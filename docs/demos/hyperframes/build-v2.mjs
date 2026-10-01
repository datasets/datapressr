import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const project=dirname(fileURLToPath(import.meta.url));
const root=join(project,'v2');await mkdir(root,{recursive:true});process.chdir(root);
await mkdir('assets',{recursive:true});await mkdir('output',{recursive:true});
const narrations=(await readFile(join(project,'../datapressr-demo-v2-voiceover.txt'),'utf8')).trim().split(/\n\n/);
const shots=[
 {title:'From data to story.',sub:'Work through it with an AI. Make something worth sharing.',tag:'THE DATAPRESSR VISION',image:'bb-v01-clean-install.png',crop:[1620,890,900,860],note:'Vision · current prototype shown'},
 {title:'See it take shape.',sub:'Data, explanation and charts. In the same workspace.',tag:'WORK TOGETHER',image:'bb-v01-story.png',crop:[1630,800,880,940],note:'Existing data story in the prototype'},
 {title:'Here’s the prototype.',sub:'Open a CSV. Check the actual numbers.',tag:'BUILT INSIDE BB  /  V0.1',image:'bb-v01-csv-co2.png',crop:[1620,655,900,840],note:'Real CO₂ dataset · 47 rows'},
 {title:'Ask. Then look.',sub:'The agent edits the file. You can see the result.',tag:'LESS TAB TENNIS',image:'bb-v01-claude-edit.png',crop:[665,865,1850,860],note:'Recorded prototype test result · screenshot demo'},
 {title:'Read the story.',sub:'The explanation and its charts, together.',tag:'THE KEELING CURVE',image:'bb-v01-story.png',crop:[1630,800,880,940],note:'Real data story · annual CO₂ at Mauna Loa'},
 {title:'Try the prototype.',sub:'An early step toward working with data, together.',tag:'DATAPRESSR  /  V0.1',image:'bb-v01-clean-install.png',crop:[1620,890,900,860],note:'Local source install · setup guide linked with the video'},
];
const durationOf=p=>Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',p],{encoding:'utf8'}).trim());
let time=0;
for(let i=0;i<shots.length;i++){
 const n=i+1;const text=narrations[i].replaceAll('DataPressr','Data Presser').replaceAll('README','read me').replaceAll('CSV','C S V').replaceAll('SVG','S V G').replaceAll('v0.1','version zero point one');
 await writeFile(`assets/voice-${n}.txt`,text);
 if(process.argv.includes('--speech')){execFileSync(join(project,'node_modules/.bin/hyperframes'),['tts',`assets/voice-${n}.txt`,'--voice','bf_emma','--speed','1.0','--output',`assets/voice-${n}.wav`],{stdio:'inherit',env:{...process.env,HYPERFRAMES_NO_TELEMETRY:'1',HYPERFRAMES_PYTHON:join(project,'.venv/bin/python')}});}
 await access(`assets/voice-${n}.wav`);
 const audio=durationOf(`assets/voice-${n}.wav`);const duration=Math.ceil((audio+1.0)*24)/24;
 Object.assign(shots[i],{start:time,duration,audio,text:narrations[i]});time+=duration;
 await copyFile(join(project,`../../benchmarks/images/${shots[i].image}`),`assets/${shots[i].image}`);
}
await copyFile(join(project,'node_modules/gsap/dist/gsap.min.js'),'assets/gsap.min.js');
await copyFile('/System/Library/Fonts/Supplemental/Arial.ttf','assets/font.ttf');
await copyFile('/System/Library/Fonts/Supplemental/Arial Bold.ttf','assets/font-bold.ttf');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const subtitles=[];
for(const s of shots){const parts=s.text.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean);let elapsed=0;const weights=parts.map(p=>p.split(/\s+/).length);const total=weights.reduce((a,b)=>a+b,0);parts.forEach((text,i)=>{const duration=s.audio*weights[i]/total;subtitles.push({text,start:s.start+.5+elapsed,duration});elapsed+=duration;});}
const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
await writeFile('captions.srt',subtitles.map((s,i)=>`${i+1}\n${stamp(s.start)} --> ${stamp(s.start+s.duration)}\n${s.text}\n`).join('\n'));
const scenes=shots.map((s,i)=>{const [x,y,w,h]=s.crop;const scale=Math.min(1160/w,742/h);const iw=w*scale,ih=h*scale;return `<section class="clip scene" id="scene-${i}" data-start="${s.start}" data-duration="${s.duration}" data-track-index="1"><div class="scene-content" id="content-${i}"><div class="copy"><div class="eyebrow">${s.tag}</div><h1>${s.title}</h1><p>${s.sub}</p><div class="step">${i===5?'Setup guide below.':i<2?'The vision':String(i-1).padStart(2,'0')+' / 03'}</div></div><div class="picture-zone"><div class="picture" id="picture-${i}" style="width:${iw}px;height:${ih}px"><img data-layout-allow-overflow="true" src="assets/${s.image}" style="width:${2560*scale}px;height:${1800*scale}px;left:${-x*scale}px;top:${-y*scale}px" alt="Recorded DataPressr Preview screenshot"></div><div class="note">${s.note??'Recorded in BB · DataPressr Preview v0.1'}</div></div></div></section>`;}).join('\n');
const audio=shots.map((s,i)=>`<audio id="voice-${i}" src="assets/voice-${i+1}.wav" data-start="${s.start+.5}" data-duration="${s.audio}" data-track-index="10" data-volume="1"></audio>`).join('\n');
const captions=subtitles.map((s,i)=>`<div class="clip caption" id="caption-${i}" data-start="${s.start}" data-duration="${s.duration}" data-track-index="20"><span>${escape(s.text)}</span></div>`).join('\n');
await writeFile('index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>DataPressr — Vision and prototype</title><script src="assets/gsap.min.js"></script><style>
@font-face{font-family:Demo;src:url('assets/font.ttf')}@font-face{font-family:Demo;src:url('assets/font-bold.ttf');font-weight:700}
*{box-sizing:border-box}body{margin:0;font-family:Demo,sans-serif;background:#f4f1eb;color:#22212c}#root{position:relative;width:100%;height:100%;overflow:hidden}.backdrop{position:absolute;inset:0;background:#f4f1eb}.brand{position:absolute;left:72px;top:36px;font-size:28px;font-weight:700;letter-spacing:-.6px}.brand b{color:#6344c5}.edition{position:absolute;right:72px;top:43px;font-size:16px;letter-spacing:2px;color:#595566}.rule{position:absolute;left:72px;right:72px;top:91px;height:2px;background:#d6d0c6}.scene{position:absolute;inset:0}.scene-content{position:absolute;inset:0}.copy{position:absolute;left:80px;top:210px;width:465px}.eyebrow{font-size:19px;letter-spacing:2px;font-weight:700;color:#6344c5;line-height:1.6}h1{font-size:76px;line-height:1.06;letter-spacing:-3px;margin:30px 0 35px}p{font-size:30px;line-height:1.5;margin:0;color:#55505e}.step{margin-top:64px;font-size:21px;color:#6344c5;font-weight:700;line-height:1.4}.picture-zone{position:absolute;left:635px;top:138px;width:1200px;height:775px;display:flex;align-items:center;justify-content:center}.picture{position:relative;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 18px 45px #31294520;border:1px solid #d4cfdd}.picture img{position:absolute;max-width:none}.note{position:absolute;top:783px;left:0;right:0;text-align:center;font-size:18px;color:#5a5365}.caption{position:absolute;left:140px;right:140px;top:959px;height:84px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:28px;line-height:1.35;color:#fff;z-index:40}.caption span{background:#272230;padding:12px 24px;border-radius:10px}.progress{position:absolute;bottom:0;left:0;height:5px;width:100%;background:#6344c5;transform-origin:left center;z-index:50}
</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="${time}" data-width="1920" data-height="1080" data-fps="24"><div class="backdrop"></div><div class="brand"><b>●</b> DataPressr</div><div class="edition">VISION → PROTOTYPE</div><div class="rule"></div>${scenes}${audio}${captions}<div class="progress" id="progress"></div></div><script>const tl=gsap.timeline({paused:true});
${shots.map((s,i)=>`tl.fromTo('#content-${i}',{opacity:0,y:12},{opacity:1,y:0,duration:.45,ease:'power2.out'},${s.start});tl.fromTo('#picture-${i}',{scale:1},{scale:1.015,duration:${s.duration-.6},ease:'none'},${s.start+.45});`).join('\n')}
tl.fromTo('#progress',{scaleX:0},{scaleX:1,duration:${time},ease:'none'},0);window.__timelines['main']=tl;</script></body></html>`);
await writeFile('timing.json',JSON.stringify({duration:time,shots},null,2)+'\n');
console.log(`Built ${shots.length} scenes, ${time.toFixed(2)} seconds. Caption sentence timing is estimated within each measured voice clip.`);
