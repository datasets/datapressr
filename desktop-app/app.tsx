import { FilePreview } from './src/file-preview';
import { ArtifactPicker } from './src/artifact-picker';
import type { Catalog } from './src/artifacts';
import type { ArtifactRef } from './src/types';
import { useEffect, useState } from 'react';
import { definePluginApp, useRpc } from '@get-bb/plugin-sdk/app';
import type { PluginThreadPanelProps } from '@get-bb/plugin-sdk';
import type { rpcContract } from './server';
import type { WorkspaceResult } from './src/bb-workspace';

function Preview({threadId}:PluginThreadPanelProps) {
  const rpc = useRpc<typeof rpcContract>();
  const [result, setResult] = useState<WorkspaceResult|null>(null);
  const [catalog,setCatalog] = useState<Catalog|null>(null);
  const [selected,setSelected] = useState<ArtifactRef|null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setResult(null); setCatalog(null); setSelected(null);
    rpc.call('catalog', {threadId}).then(value => {if (active) {setResult(value); if(value.ok) setCatalog(value.catalog);}}, () => {
      if (active) setResult({ok:false, code:'bb_unavailable', message:'Cannot connect to BB. Try again.'});
    });
    return () => {active = false;};
  }, [rpc, threadId, retry]);
  return <section className="h-full overflow-auto p-5">
    <h1 className="text-xl font-semibold">DataPressr Preview</h1>
    <p className="mb-5 text-sm text-muted-foreground">Read-only workspace preview</p>
    {!result ? <p role="status">Resolving conversation workspace…</p> : !result.ok ? <div role="alert"><p>{result.message}</p><button className="mt-3 rounded border px-3 py-2" onClick={() => setRetry(n => n+1)}>Retry</button></div> : <>
      <h2 className="mb-2 font-semibold">Conversation workspace</h2>
      <p className="break-all rounded border p-3 font-mono text-sm">{result.workspace.rootPath}</p>
      <dl className="my-4 text-xs text-muted-foreground"><dt>Environment</dt><dd>{result.workspace.environmentId}</dd><dt className="mt-2">Host</dt><dd>{result.workspace.hostId}</dd></dl>
      {catalog && <ArtifactPicker catalog={catalog} onSelect={setSelected}/>}
      {selected && <div className="border-t pt-4"><p className="break-all font-mono text-sm">{selected.path}</p><FilePreview key={`${threadId}:${selected.path}`} threadId={threadId} path={selected.path}/></div>}
    </>}
  </section>;
}
export default definePluginApp(app => {
  app.slots.threadPanelAction({id:'preview', title:'DataPressr Preview', icon:'Table', layout:'flush', component:Preview});
});
