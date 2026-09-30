import { poll } from './refresh';
import { useEffect,useState,useRef } from 'react';
import { useRpc } from '@get-bb/plugin-sdk/app';
import type { rpcContract } from '../server';
import { ImagePreview } from './renderers/image';
import { CsvPreview } from './renderers/csv';
import { HtmlPreview } from './renderers/html';
type Preview={path:string;revision:string;mediaType?:string;dataUrl?:string;content?:string;html?:string;warnings?:string[]};
export function FilePreview({threadId,path,environmentId,onNavigate}:{threadId:string;path:string;environmentId:string;onNavigate:(path:string)=>void}) {
  const root=useRef<HTMLDivElement>(null);
  const rpc=useRpc<typeof rpcContract>();
  const [file,setFile]=useState<Preview|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    setFile(null);setError('');
    return poll({
      active:()=>document.visibilityState!=='hidden' && !!root.current?.getClientRects().length,
      read:async()=>/\.(md|markdown|html|htm)$/i.test(path)?rpc.call('document',{threadId,path}):rpc.call('file',{threadId,path}),
      accept:result=>{
        if(!result.ok){setFile(null);setError(result.message);return;}
        if(result.workspace.environmentId!==environmentId){setFile(null);setError('The workspace changed. Rescan to load its selection.');return;}
        setFile(previous=>previous?.revision===result.revision?previous:result);setError('');
      },
      error:()=>{setFile(null);setError('Cannot connect to BB. Retrying…');},
    });
  },[rpc,threadId,path,environmentId]);
  if(error)return <div ref={root}><p role="alert">{error} Waiting for the file to become available…</p></div>;
  if(!file)return <div ref={root}><p role="status">Reading file…</p></div>;
  return <div ref={root}><p className="my-3 text-xs text-muted-foreground">Revision {file.revision.slice(0,12)} · 10 MiB input limit</p>
    {file.warnings?.map((warning,i)=><p className="mb-2 text-sm" role="status" key={i}>{warning}</p>)}
    {file.html!==undefined?<HtmlPreview html={file.html} path={path} onNavigate={onNavigate}/>:file.mediaType==='text/csv'?<CsvPreview content={file.content!}/>:file.mediaType?.startsWith('image/')?<ImagePreview path={file.path} dataUrl={file.dataUrl!}/>:<p>This file type is not previewable.</p>}
  </div>;
}
