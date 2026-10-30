import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const targets=await (await fetch('http://127.0.0.1:9331/json')).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}};
function call(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))})}
await call('Page.enable');const checks=[];
for(const version of ['original','revised'])for(const [device,width,height] of [['desktop',1280,900],['mobile',390,844]]){
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'file://'+path.join(root,version,'index.html')});
 await new Promise(r=>setTimeout(r,800));
 const {result}=await call('Runtime.evaluate',{expression:`JSON.stringify({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:[...document.images].map(i=>({src:i.getAttribute('src'),complete:i.complete,width:i.width,height:i.height,naturalWidth:i.naturalWidth})),title:document.title})`,returnByValue:true});
 checks.push({version,device,...JSON.parse(result.value)});
 const screenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
 await fs.writeFile(path.join(root,'author',`${version}-${device}.png`),Buffer.from(screenshot.data,'base64'));
}
await fs.writeFile(path.join(root,'author','render-checks.json'),JSON.stringify(checks,null,2)+'\n');
console.log(JSON.stringify(checks,null,2));ws.close();
