import { test } from 'node:test';
import assert from 'node:assert/strict';
import { poll,selectionKey } from '../src/refresh.ts';
const flush=()=>new Promise<void>(resolve=>setImmediate(resolve));
test('only schedules after the current read; disposed stale response cannot replace next selection',async()=>{
  let done!:(s:string)=>void;let scheduled=0;const values:string[]=[];
  const stop=poll({read:()=>new Promise<string>(r=>done=r),accept:v=>values.push(v),error:()=>{},schedule:()=>{scheduled++;return 1;},cancel:()=>{}});
  assert.equal(scheduled,0);stop();done('old');await flush();assert.deepEqual(values,[]);assert.equal(scheduled,0);
});
test('inactive views do not read; errors recover and closure cancels timers',async()=>{
  let active=false;let calls=0;let next!:()=>void;let cancelled=0;const values:string[]=[];
  const stop=poll({read:async()=>{calls++;if(calls===1)throw Error('missing');return 'restored';},accept:v=>values.push(v),error:()=>values.push('missing'),active:()=>active,schedule:fn=>{next=fn;return 1;},cancel:()=>{cancelled++;}});
  await flush();assert.equal(calls,0);active=true;next();await flush();assert.deepEqual(values,['missing']);next();await flush();assert.deepEqual(values,['missing','restored']);stop();assert.equal(cancelled,1);
});
test('selections are isolated by thread and environment',()=>{
  assert.notEqual(selectionKey('a','e'),selectionKey('b','e'));assert.notEqual(selectionKey('a','e'),selectionKey('a','f'));
});

test('rescan and reopened panels wait for ordered selection saves',async()=>{
  const {SelectionSaves}=await import('../src/refresh.ts');
  const saves=new SelectionSaves();let release!:()=>void;let value='old';let read=false;
  const first=saves.save('thread',async()=>{await new Promise<void>(r=>release=r);value='first';});
  const second=saves.save('thread',async()=>{value='second';});
  const rescan=saves.settled('thread').then(()=>{read=true;assert.equal(value,'second');});
  await new Promise(r=>setImmediate(r));assert.equal(read,false);
  release();await Promise.all([first,second,rescan]);assert.equal(read,true);
  await assert.rejects(saves.save('thread',async()=>{throw new Error('offline');}));
  await saves.settled('thread');
});
