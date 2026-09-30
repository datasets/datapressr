import { useMemo } from 'react';
import { parseCsv } from '../csv';
export function CsvPreview({content}:{content:string}) {
  const parsed=useMemo(()=>{try{return {data:parseCsv(content),error:''};}catch(cause){return {data:null,error:(cause as Error).message};}},[content]);
  if(!parsed.data)return <p role="alert">CSV unavailable: {parsed.error}</p>;
  const {headers,rows,moreRows,totalColumns}=parsed.data;
  return <div>
    <p className="mb-3 text-sm text-muted-foreground">{moreRows?`First ${rows.length} data rows · more rows exist; remainder not scanned`:`${rows.length} data rows`} · {headers.length<totalColumns?`First ${headers.length} of ${totalColumns} columns`:`${headers.length} columns`}</p>
    <div className="max-h-[650px] overflow-auto rounded border" tabIndex={0} aria-label="CSV preview table">
      <table className="w-full border-collapse text-sm"><thead className="sticky top-0 bg-background"><tr>{headers.map((header,i)=><th key={i} className="whitespace-pre-wrap border-b border-r px-3 py-2 text-left font-semibold">{header || <span className="font-normal text-muted-foreground">(blank column {i+1})</span>}</th>)}</tr></thead><tbody>{rows.map((row,r)=><tr key={r}>{row.map((value,c)=><td key={c} className="whitespace-pre-wrap border-b border-r px-3 py-2 align-top tabular-nums">{value}</td>)}</tr>)}</tbody></table>
    </div>
  </div>;
}
