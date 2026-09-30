import { CsvPreview } from './renderers/csv';
import { useEffect,useState } from 'react';
import { useRpc } from '@get-bb/plugin-sdk/app';
import type { rpcContract } from '../server';
import { ImagePreview } from './renderers/image';
export function FilePreview({threadId,path}:{threadId:string;path:string}) {
  const rpc=useRpc<typeof rpcContract>();
  const [file,setFile]=useState<{path:string;revision:string;mediaType:string;dataUrl:string;content:string}|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;setFile(null);setError('');
    rpc.call('file',{threadId,path}).then(result=>{
      if(!active)return;
      if(result.ok)setFile(result);else setError(result.message);
    },()=>{if(active)setError('Cannot connect to BB.');});
    return()=>{active=false;};
  },[rpc,threadId,path]);
  if(error)return <p role="alert">{error}</p>;
  if(!file)return <p role="status">Reading file…</p>;
  return <><p className="my-3 text-xs text-muted-foreground">Revision {file.revision.slice(0,12)} · 10 MiB input limit</p>{file.mediaType==='text/csv'?<CsvPreview content={file.content}/>:file.mediaType.startsWith('image/')?<ImagePreview path={file.path} dataUrl={file.dataUrl}/>:<p>File is available. Document and CSV renderers are coming next.</p>}</>;
}
