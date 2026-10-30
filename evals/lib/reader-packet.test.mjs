import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import * as packet from './reader-packet.mjs';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const digest = b => createHash('sha256').update(b).digest('hex');
function fixture(fn) { const root=mkdtempSync(join(tmpdir(),'reader-packet-'));try {writeFileSync(join(root,'page.png'),png);writeFileSync(join(root,'source.html'),'<h1>Title</h1><figcaption hidden>ANSWER FROM SOURCE ONLY</figcaption><img alt="SECRET ASSISTANCE">');fn(root);}finally{rmSync(root,{recursive:true,force:true});} }
test('ordinary packet contains only neutral instructions and raster pages, never neighboring hidden/source assistance',()=>fixture(root=>{
  const out=join(root,'reader');
  const manifest=packet.prepareReaderPacket({out,images:[{path:join(root,'page.png'),display_width_px:1,display_height_px:1}]});
  assert.deepEqual(readdirSync(out).sort(),['README.md','page-1.png']);
  assert.deepEqual(readFileSync(join(out,'page-1.png')),png);
  assert.doesNotMatch(readFileSync(join(out,'README.md'),'utf8'),/ANSWER FROM SOURCE ONLY|SECRET ASSISTANCE|source.html/);
  assert.equal(manifest.mode,'ordinary-rendered');
  assert.equal(manifest.pages[0].sha256,digest(png));
  assert.equal(manifest.pages[0].width_px,1);
  assert.equal(manifest.pages[0].height_px,1);
  assert.equal(manifest.pages[0].intended_display_width_px,1);
  assert.equal(manifest.pages[0].intended_display_height_px,1);
  assert.throws(()=>packet.prepareReaderPacket({out,images:[{path:join(root,'page.png'),display_width_px:1,display_height_px:1}]}),/exist|frozen/i);
}));
test('missing, invalid or unknown-size delivery cannot silently become a packet',()=>fixture(root=>{
  for(const images of [[],[{path:join(root,'source.html'),display_width_px:1,display_height_px:1}],[{path:join(root,'page.png'),display_width_px:null,display_height_px:1}]]) assert.throws(()=>packet.prepareReaderPacket({out:join(root,'reader'),images}),/PNG|size|images|positive/i);
}));
test('single-title repair removes only the identical duplicate leading title and preserves other prose',()=>{
  assert.equal(packet.singleLeadingTitle('# Title\n\n# Title\n\nText\n'),'# Title\n\nText\n');
  for(const original of ['# Title\n\nText\n','# First\n\n# Second\n\nText\n'])assert.equal(packet.singleLeadingTitle(original),original);
});

test('verification release requires immutable spontaneous then prompted responses bound to the same packet',()=>fixture(root=>{
  const packetSha256=digest('synthetic packet manifest');
  const first=packet.freezeReaderResponse({path:join(root,'first.json'),stage:'spontaneous',response:'I think the ratio fell.',packetSha256});
  assert.throws(()=>packet.releaseVerification({spontaneous:first}),/prompted|response/i);
  assert.throws(()=>packet.freezeReaderResponse({path:join(root,'bad.json'),stage:'prompted',response:'Answer',packetSha256}),/spontaneous/i);
  const second=packet.freezeReaderResponse({path:join(root,'second.json'),stage:'prompted',response:'The unit is percent.',packetSha256,spontaneous:first});
  assert.equal(packet.releaseVerification({spontaneous:first,prompted:second}).packet_sha256,packetSha256);
  assert.throws(()=>packet.freezeReaderResponse({path:first.path,stage:'spontaneous',response:'Rewrite',packetSha256}),/exist/i);
  writeFileSync(first.path,'changed response');
  assert.throws(()=>packet.releaseVerification({spontaneous:first,prompted:second}),/hash|frozen/i);
}));
test('assisted readings are retained explicitly and cannot be released as unaided',()=>fixture(root=>{
  const first=packet.freezeReaderResponse({path:join(root,'first.json'),stage:'spontaneous',response:'Answer from hidden caption',packetSha256:digest('packet'),assistance:['HTML hidden caption']});
  const second=packet.freezeReaderResponse({path:join(root,'second.json'),stage:'prompted',response:'Answer',packetSha256:digest('packet'),spontaneous:first});
  assert.equal(packet.releaseVerification({spontaneous:first,prompted:second}).reading_scope,'source-assisted');
}));

test('cross-packet, swapped and malformed responses cannot authorize source release; accessibility stays separate',()=>fixture(root=>{
  const a=packet.freezeReaderResponse({path:join(root,'a.json'),stage:'spontaneous',response:'Accessible reading',packetSha256:digest('A'),mode:'accessibility'});
  assert.throws(()=>packet.freezeReaderResponse({path:join(root,'bad.json'),stage:'prompted',response:'Answer',packetSha256:digest('B'),spontaneous:a,mode:'accessibility'}),/mismatch/);
  assert.throws(()=>packet.freezeReaderResponse({path:join(root,'bad.json'),stage:'prompted',response:'Answer',packetSha256:digest('A'),spontaneous:a}),/mismatch/);
  const b=packet.freezeReaderResponse({path:join(root,'b.json'),stage:'prompted',response:'Answer from accessible description',packetSha256:digest('A'),spontaneous:a,mode:'accessibility'});
  assert.equal(packet.releaseVerification({spontaneous:a,prompted:b}).reading_scope,'accessibility');
  assert.throws(()=>packet.releaseVerification({spontaneous:b,prompted:a}),/malformed/);
  for (const content of ['{broken', '{}', 'null']) {
    writeFileSync(join(root,'malformed.json'),content);
    assert.throws(()=>packet.releaseVerification({spontaneous:a,prompted:{path:join(root,'malformed.json'),sha256:digest(content)}}));
  }
}));

test('retained clipping and correction fixtures match delivered hashes and intrinsic dimensions',()=>{
  const base=new URL('../calibration/story/diagnostic-v2/rendered/',import.meta.url);
  const manifest=JSON.parse(readFileSync(new URL('manifest.json',base)));
  assert.equal(manifest.pages.length,2);
  for(const [i,page] of manifest.pages.entries()) {
    const bytes=readFileSync(new URL(`reader/${page.path}`,base));
    assert.equal(digest(bytes),page.sha256);
    assert.equal(bytes.readUInt32BE(16),page.width_px);
    assert.equal(bytes.readUInt32BE(20),page.height_px);
    assert.equal(page.width_px,360);
    assert.equal(page.height_px,i===0?220:260);
    assert.equal(page.intended_display_width_px,360);
    assert.equal(page.intended_display_height_px,page.height_px);
  }
});
