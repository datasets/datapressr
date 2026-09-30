import { useEffect,useState } from 'react';
import { useRpc } from '@get-bb/plugin-sdk/app';
import type { rpcContract } from '../server';
import { ImagePreview } from './renderers/image';
import { CsvPreview } from './renderers/csv';
import { HtmlPreview } from './renderers/html';
type Preview={path:string;revision:string;mediaType?:string;dataUrl?:string;content?:string;html?:string;warnings?:string[]};
export function FilePreview({threadId,path,onNavigate}:{threadId:string;path:string;onNavigate:(path:string)=>void}) {
  const rpc=useRpc<typeof rpcContract>();
  const [file,setFile]=useState<Preview|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;setFile(null);setError('');
    const request=/\.(md|markdown|html|htm)$/i.test(path)?rpc.call('document',{threadId,path}):rpc.call('file',{threadId,path});
    request.then(result=>{
      if(!active)return;
      if(result.ok)setFile(result);else setError(result.message);
    },()=>{if(active)setError('Cannot connect to BB.');});
    return()=>{active=false;};
  },[rpc,threadId,path]);
  if(error)return <p role="alert">{error}</p>;
  if(!file)return <p role="status">Reading file…</p>;
  return <><p className="my-3 text-xs text-muted-foreground">Revision {file.revision.slice(0,12)} · 10 MiB input limit</p>
    {file.warnings?.map((warning,i)=><p className="mb-2 text-sm" role="status" key={i}>{warning}</p>)}
    {file.html!==undefined?<HtmlPreview html={file.html} path={path} onNavigate={onNavigate}/>:file.mediaType==='text/csv'?<CsvPreview content={file.content!}/>:file.mediaType?.startsWith('image/')?<ImagePreview path={file.path} dataUrl={file.dataUrl!}/>:<p>This file type is not previewable.</p>}
  </>;
}
