import { useState } from 'react';
import type { Catalog } from './artifacts';
import { selectArtifact } from './artifact-selection';
import type { ArtifactRef } from './types';
export function ArtifactPicker({catalog, selectedPath,onSelect}:{catalog:Catalog;selectedPath:string|null;onSelect:(artifact:ArtifactRef)=>void}) {
  const [search,setSearch] = useState('');
  const [error,setError] = useState('');
  const matches = catalog.artifacts.filter(a=>`${a.path} ${a.label}`.toLowerCase().includes(search.toLowerCase()));
  const shown = matches.slice(0,100);
  const groups = [...new Set(shown.map(a=>a.datasetPath ?? ''))];
  return <div className="my-4 space-y-3">
    <form onSubmit={event=>{event.preventDefault();try {onSelect(selectArtifact(search));setError('');} catch(cause) {setError((cause as Error).message);}}}>
      <label className="block text-sm font-semibold" htmlFor="artifact-search">Find an artifact or enter a relative path</label>
      <div className="mt-2 flex gap-2"><input id="artifact-search" className="min-w-0 flex-1 rounded border bg-background px-3 py-2 text-sm" value={search} onChange={e=>setSearch(e.target.value)} placeholder="README, .csv, site/stories/…"/><button className="rounded border px-3 py-2 text-sm" type="submit">Open path</button></div>
    </form>
    {error && <p role="alert" className="text-sm">{error}</p>}
    <select aria-label="Artifact" value={shown.some(a=>a.path===selectedPath)?selectedPath!:''} className="w-full rounded border bg-background p-2 text-sm" onChange={e=>{const artifact=catalog.artifacts.find(a=>a.path===e.target.value);if(artifact)onSelect(artifact);}}>
      <option value="" disabled>Choose an artifact ({matches.length} matches)</option>
      {groups.map(group=><optgroup key={group} label={catalog.datasets.find(d=>d.path===group)?.title ?? 'Documents and images'}>{shown.filter(a=>(a.datasetPath??'')===group).map(a=><option value={a.path} key={a.path}>{a.path}</option>)}</optgroup>)}
    </select>
    {matches.length>100 && <p className="text-xs text-muted-foreground">Showing the first 100 matches. Refine your search or open an exact path.</p>}
    {catalog.incomplete && <p role="status" className="text-sm">Discovery stopped after {catalog.scanned.toLocaleString()} entries. Open an exact relative path to browse beyond this limit.</p>}
    {!!catalog.warnings.length && <details className="text-xs text-muted-foreground"><summary>{catalog.warnings.length} discovery notices</summary>{catalog.warnings.map((w,i)=><p key={i}>{w}</p>)}</details>}
  </div>;
}
