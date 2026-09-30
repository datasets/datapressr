import { useEffect, useState } from 'react';
import { definePluginApp, Markdown, useRpc } from '@get-bb/plugin-sdk/app';
import type { rpcContract } from './server';
import type { Artifact, ArtifactKind } from './reader';

function Preview() {
  const rpc = useRpc<typeof rpcContract>();
  const [kind, setKind] = useState<ArtifactKind>('data');
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    setArtifact(null);
    setError('');
    async function refresh() {
      try {
        const next = await rpc.call('preview', { kind });
        if (!stopped) {
          setArtifact(previous => previous?.revision === next.revision && previous.name === next.name ? previous : next);
          setError('');
        }
      } catch (cause) {
        if (!stopped) { setArtifact(null); setError(cause instanceof Error ? cause.message : String(cause)); }
      } finally {
        if (!stopped) timer = setTimeout(refresh, 1000);
      }
    }
    void refresh();
    return () => { stopped = true; clearTimeout(timer); };
  }, [rpc, kind]);
  return <section className="h-full overflow-auto p-5">
    <h1 className="text-xl font-semibold">DataPressr Preview</h1>
    <p className="mb-4 text-sm text-muted-foreground">Live preview · updates as files change</p>
    <nav aria-label="Artifact previews" className="mb-4 flex gap-2">
      {(['data', 'readme', 'story'] as const).map(value => <button key={value} aria-pressed={kind === value} onClick={() => setKind(value)} className={`rounded border px-3 py-2 ${kind === value ? 'bg-secondary font-semibold' : ''}`}>{ {data:'Data',readme:'README',story:'Story'}[value] }</button>)}
    </nav>
    {error ? <p role="alert">Preview unavailable: {error}</p> : !artifact ? <p role="status">Loading preview…</p> : <>
      <p className="mb-3 text-xs text-muted-foreground">{artifact.name} · revision {artifact.revision}</p>
      {kind === 'data' ? <table className="w-full border-collapse text-sm"><caption className="mb-3 text-left">Sample dataset · {artifact.rows.length} rows</caption><thead><tr>{artifact.columns.map((column, i) => <th className="border p-3 text-left" key={i}>{column}</th>)}</tr></thead><tbody>{artifact.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td className="border p-3" key={j}>{cell}</td>)}</tr>)}</tbody></table>
      : kind === 'readme' ? <Markdown content={artifact.content} />
      : <iframe title="Data story preview" sandbox="" srcDoc={artifact.content} className="h-[650px] w-full border-0 bg-white" />}
    </>}
  </section>;
}
export default definePluginApp(app => {
  app.slots.navPanel({ id: 'preview', path: 'preview', title: 'DataPressr Preview', icon: 'Table', component: Preview });
  app.slots.threadPanelAction({ id: 'preview', title: 'DataPressr Preview', icon: 'Table', layout: 'flush', component: Preview });
});
