import { parse } from 'csv-parse/browser/esm/sync';
import { LIMITS } from './limits.ts';
export type CsvPreview = {headers:string[];rows:string[][];moreRows:boolean;totalColumns:number};
export function parseCsv(content:string):CsvPreview {
  if(new TextEncoder().encode(content).length>LIMITS.fileBytes) throw new Error('CSV exceeds the 10 MiB input limit.');
  const records:string[][]=parse(content,{bom:true,to:LIMITS.csvRows+2,skip_empty_lines:true});
  if(!records.length)throw new Error('The CSV is empty.');
  const [headers,...rows]=records;
  return {headers:headers.slice(0,LIMITS.csvColumns),rows:rows.slice(0,LIMITS.csvRows).map(row=>row.slice(0,LIMITS.csvColumns)),moreRows:rows.length>LIMITS.csvRows,totalColumns:headers.length};
}
