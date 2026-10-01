import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const project = dirname(fileURLToPath(import.meta.url));
const root = join(project, 'v4');
await mkdir(join(root, 'assets'), { recursive: true });
await mkdir(join(root, 'output'), { recursive: true });
const scenes = [
  { kind: 'card', duration: 4, eyebrow: 'SKILLS + TOOLS FOR DATA WORK WITH AI', title: 'DataPressr', sub: 'Meet the app.', footer: 'Your conversation. Your data. In one workspace.' },
  { image: '01-panel-launcher', duration: 2, label: 'Open DataPressr Preview', detail: 'Prototype inside BB', crop: [1270, 0, 1270, 740] },
  { image: '02-panel-open', duration: 1, label: 'Your workspace, beside the conversation', crop: [0, 0, 2560, 1070] },
  { image: '03-search-csv', duration: 1.5, label: 'Find your data', crop: [1300, 90, 1220, 720] },
  { image: '04-csv-choice', duration: 1.5, label: 'Choose the file', crop: [1300, 90, 1220, 720] },
  { image: '05-csv-open', duration: 3.5, label: 'Check the actual numbers', crop: [1310, 700, 1210, 1050] },
  { kind: 'card', duration: 2.5, eyebrow: 'WORK THROUGH THE CONVERSATION', title: 'Ask for a change.', sub: 'In plain English.' },
  { image: '06-readme-before', duration: 1.5, label: 'Here’s our README', crop: [1310, 850, 1210, 865] },
  { image: '07-edit-request', duration: 4, label: '“What does ppm mean?”', detail: 'A real request to the agent', crop: [20, 1460, 1230, 260] },
  { image: '08-edit-sent', duration: 1.5, label: 'The agent edits the file', detail: 'Wait shortened', crop: [0, 360, 2540, 1300] },
  { image: '09-edit-result', duration: 3, label: 'The result appears beside the conversation', detail: 'Actual file edit · preview refreshed', crop: [20, 540, 2500, 1210] },
  { image: '09-edit-result', duration: 5, label: 'A useful explanation. In the actual README.', detail: 'Less tab tennis.', crop: [1350, 1520, 1160, 245] },
  { kind: 'card', duration: 2, eyebrow: 'GO FROM ROWS TO CONTEXT', title: 'Explore the story.', sub: 'The explanation and its charts, together.' },
  { image: '10-story-path', duration: 1.5, label: 'Open a story', crop: [1300, 290, 1220, 390] },
  { image: '11-story-open', duration: 3, label: 'See the long-term trend', crop: [1310, 850, 1210, 880] },
  { image: '12-story-scroll', duration: 0.5, label: 'Scroll for a closer look', crop: [1310, 350, 1210, 1370] },
  { image: '13-story-seasonal', duration: 4, label: 'Then look at the seasonal pattern', crop: [1340, 930, 1150, 810] },
  { kind: 'card', duration: 4, eyebrow: 'DATAPRESSR · EARLY APP PROTOTYPE', title: 'Your agent. Your data.', sub: 'One workspace.', footer: 'Try it · setup guide below' },
];
let total = 0;
for (const scene of scenes) {
  scene.start = total;
  total += scene.duration;
  if (scene.image) await copyFile(join(project, '../assets/v4', scene.image + '.png'), join(root, 'assets', scene.image + '.png'));
}
if (total >= 60) throw new Error('Keep this cut below one minute.');
await copyFile(join(project, 'node_modules/gsap/dist/gsap.min.js'), join(root, 'assets/gsap.min.js'));
await copyFile('/System/Library/Fonts/Supplemental/Arial.ttf', join(root, 'assets/font.ttf'));
await copyFile('/System/Library/Fonts/Supplemental/Arial Bold.ttf', join(root, 'assets/font-bold.ttf'));
const esc = text => String(text ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const html = scenes.map((scene, i) => {
  const attrs = `class="clip ${scene.kind === 'card' ? 'card' : 'screen'}" id="scene-${i}" data-start="${scene.start}" data-duration="${scene.duration}" data-track-index="1"`;
  if (scene.kind === 'card') return `<section ${attrs}><div class="card-content" id="content-${i}"><div class="eyebrow">${esc(scene.eyebrow)}</div><h1>${esc(scene.title)}</h1><div class="sub">${esc(scene.sub)}</div>${scene.footer ? `<div class="card-footer">${esc(scene.footer)}</div>` : ''}</div><div class="card-count">DATAPRESSR / 04</div></section>`;
  const [x, y, w, h] = scene.crop;
  const scale = Math.min(1780 / w, 820 / h);
  const width = w * scale;
  const height = h * scale;
  return `<section ${attrs}><div class="screen-head"><span class="label">${esc(scene.label)}</span><span class="detail">${esc(scene.detail || 'Recorded UI · edited sequence')}</span></div><div class="stage"><div class="frame" id="frame-${i}" style="width:${width}px;height:${height}px"><img data-layout-allow-overflow="true" src="assets/${scene.image}.png" alt="Actual DataPressr UI capture" style="width:${2560 * scale}px;height:${1800 * scale}px;left:${-x * scale}px;top:${-y * scale}px"></div></div><div class="screen-footer">DataPressr <span>Skills + app for data work with AI</span></div></section>`;
}).join('\n');
const animations = scenes.map((scene, i) => scene.kind === 'card'
  ? `tl.fromTo('#content-${i}',{opacity:0,y:20},{opacity:1,y:0,duration:.35,ease:'power2.out'},${scene.start});`
  : (scene.duration >= 3 ? `tl.fromTo('#frame-${i}',{scale:1},{scale:1.012,duration:${scene.duration},ease:'none'},${scene.start});` : '')).join('\n');
await writeFile(join(root, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>DataPressr — silent app walkthrough</title><script src="assets/gsap.min.js"></script><style>
@font-face{font-family:Demo;src:url('assets/font.ttf')}@font-face{font-family:Demo;src:url('assets/font-bold.ttf');font-weight:700}*{box-sizing:border-box}body{margin:0;font-family:Demo,sans-serif;color:#262131;background:#f5f2ec}#root{position:relative;width:100%;height:100%;overflow:hidden}.clip{position:absolute;inset:0}.card{background:#3b246d;color:#fff;display:flex;align-items:center;justify-content:center}.card-content{text-align:center;width:1740px}.eyebrow{font-size:25px;letter-spacing:3px;color:#dfd2ff;font-weight:700}h1{font-size:112px;letter-spacing:-4px;line-height:1.05;margin:38px 0}.sub{font-size:49px;line-height:1.35;color:#fff}.card-footer{margin-top:84px;font-size:30px;color:#dfd2ff}.card-count{position:absolute;bottom:38px;right:65px;font-size:18px;letter-spacing:3px;color:#dfd2ff}.screen{background:#f5f2ec}.screen-head{position:absolute;top:39px;left:65px;right:65px;display:flex;justify-content:space-between;align-items:center;height:60px;gap:20px}.label{font-size:38px;font-weight:700;letter-spacing:-1px}.detail{font-size:19px;color:#60536d;text-align:right;max-width:440px}.stage{position:absolute;left:60px;right:60px;top:143px;height:820px;display:flex;align-items:center;justify-content:center}.frame{position:relative;overflow:hidden;border:1px solid #d4cfda;border-radius:17px;background:#fff;box-shadow:0 14px 35px #271a4019}.frame img{position:absolute;max-width:none}.screen-footer{position:absolute;left:65px;right:65px;bottom:33px;font-size:22px;font-weight:700;color:#5b3b99;display:flex;justify-content:space-between}.screen-footer span{font-size:19px;font-weight:400;color:#60536d}.progress{position:absolute;bottom:0;left:0;width:100%;height:5px;background:#a68af0;transform-origin:left center;z-index:99}
</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080" data-fps="24">${html}<div id="progress" class="progress"></div></div><script>const tl=gsap.timeline({paused:true});${animations}tl.fromTo('#progress',{scaleX:0},{scaleX:1,duration:${total},ease:'none'},0);window.__timelines.main=tl;</script></body></html>`);
await writeFile(join(root, 'timing.json'), JSON.stringify({ duration: total, audio: false, capture: 'Real UI actions captured as sequential stills; waits shortened; no invented clicks or UI changes.', scenes }, null, 2) + '\n');
console.log(`Built silent v4: ${total}s, ${scenes.length} visual beats, no audio elements.`);
