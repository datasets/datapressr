import { SelectionSaves } from './src/refresh';
import { selectArtifact } from './src/artifact-selection';
import { FilePreview } from './src/file-preview';
import { ArtifactPicker } from './src/artifact-picker';
import type { Catalog } from './src/artifacts';
import type { ArtifactRef } from './src/types';
import { useEffect, useState, useRef } from 'react';
import { definePluginApp, useRpc } from '@get-bb/plugin-sdk/app';
import type { PluginThreadPanelProps } from '@get-bb/plugin-sdk';
import type { rpcContract } from './server';
import type { WorkspaceResult } from './src/bb-workspace';

const selectionSaves=new SelectionSaves();

function Preview({threadId}:PluginThreadPanelProps) {
  const selectionVersion=useRef(0);
  const [selectionError,setSelectionError]=useState('');
  const rpc = useRpc<typeof rpcContract>();
  const [result, setResult] = useState<WorkspaceResult|null>(null);
  const [catalog,setCatalog] = useState<Catalog|null>(null);
  const [selected,setSelected] = useState<ArtifactRef|null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    selectionVersion.current++;
    setResult(null); setCatalog(null); setSelected(null);setSelectionError('');
    selectionSaves.settled(threadId).then(()=>rpc.call('catalog', {threadId})).then(value => {if (active) {setResult(value); if(value.ok) {setCatalog(value.catalog); if(value.selectedPath) {try{setSelected(selectArtifact(value.selectedPath));}catch{setSelectionError('Saved selection is no longer supported. Choose another file.');}}}}}, () => {
      if (active) setResult({ok:false, code:'bb_unavailable', message:'Cannot connect to BB. Try again.'});
    });
    return () => {active = false;selectionVersion.current++;};
  }, [rpc, threadId, retry]);
  function choose(artifact:ArtifactRef) {
    setSelected(artifact);setSelectionError('');
    if(!result?.ok)return;
    const environmentId=result.workspace.environmentId;
    const version=++selectionVersion.current;
    void selectionSaves.save(threadId,async()=>{const saved=await rpc.call('select',{threadId,environmentId,path:artifact.path});if(!saved.ok)throw new Error(saved.message);}).catch(()=>{if(selectionVersion.current===version)setSelectionError('Selection could not be saved.');});
  }
  return <section className="h-full overflow-auto p-5">
    <h1 className="text-xl font-semibold">DataPressr Preview</h1>
    <p className="mb-5 text-sm text-muted-foreground">Read-only workspace preview</p>
    {!result ? <p role="status">Resolving conversation workspace…</p> : !result.ok ? <div role="alert"><p>{result.message}</p><button className="mt-3 rounded border px-3 py-2" onClick={() => setRetry(n => n+1)}>Retry</button></div> : <>
      <details><summary className="cursor-pointer text-xs text-muted-foreground">Conversation workspace</summary>
      <p className="break-all rounded border p-3 font-mono text-sm">{result.workspace.rootPath}</p>
      <dl className="my-4 text-xs text-muted-foreground"><dt>Environment</dt><dd>{result.workspace.environmentId}</dd><dt className="mt-2">Host</dt><dd>{result.workspace.hostId}</dd></dl></details>
      {catalog && <ArtifactPicker catalog={catalog} selectedPath={selected?.path??null} onSelect={choose}/>}
      <button className="mb-3 text-xs underline" onClick={()=>setRetry(n=>n+1)}>Rescan artifacts</button>
      {selectionError && <p role="alert">{selectionError}</p>}
      {selected && <div className="border-t pt-4"><p className="break-all font-mono text-sm">{selected.path}</p><FilePreview key={`${threadId}:${selected.path}`} threadId={threadId} environmentId={result.workspace.environmentId} path={selected.path} onNavigate={path=>{try{choose(selectArtifact(path));}catch{setSelectionError('This linked file type is not supported.');}}}/></div>}
    </>}
  </section>;
}
export default definePluginApp(app => {
  app.slots.threadPanelAction({id:'preview', title:'DataPressr Preview', icon:'Table', layout:'flush', component:Preview});
});
