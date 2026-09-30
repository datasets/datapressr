import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../src/csv.ts';
import { LIMITS } from '../src/limits.ts';
test('preserves quoted multiline, empty, Unicode, literal NA and CRLF fields',()=>{
  assert.deepEqual(parseCsv('name,value,note\r\n"é,land",,"line 1\r\nline 2"\r\nNA,0,"say ""hi"""\r\n').rows,[['é,land','','line 1\r\nline 2'],['NA','0','say "hi"']]);
});
test('keeps blank and duplicate headers as cells without treating them as object keys',()=>{
  assert.deepEqual(parseCsv(',x,x\n1,2,3\n').headers,['','x','x']);assert.deepEqual(parseCsv(',x,x\n1,2,3\n').rows,[['1','2','3']]);
});
test('reports inconsistent rows and malformed quotes',()=>{
  for(const content of ['a,b\n1\n','a\n"unterminated','a,b\n1,2,3\n'])assert.throws(()=>parseCsv(content));
});
test('caps displayed rows/columns without claiming a full dataset count',()=>{
  const content=Array.from({length:203},(_,r)=>Array.from({length:102},(_,c)=>`${r}:${c}`).join(',')).join('\n');const parsed=parseCsv(content);
  assert.equal(parsed.rows.length,200);assert.equal(parsed.headers.length,100);assert.equal(parsed.totalColumns,102);assert.equal(parsed.moreRows,true);
  assert.equal(parseCsv('a\n1\n').moreRows,false);
});
test('empty file and oversized inputs are explicit errors',()=>{
  assert.throws(()=>parseCsv(''));assert.throws(()=>parseCsv('x'.repeat(LIMITS.fileBytes+1)));
});
