import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readWorkspaceFile } from '../src/files.ts';
export async function fixture(t:any) {
  const root=await mkdtemp(join(tmpdir(),'datapressr-files-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  await mkdir(join(root,'docs'));
  return root;
}
test('reads quoted unicode names, hashes content and handles valid parent paths',async t=>{
  const root=await fixture(t);const path='docs/é "sample".csv';await writeFile(join(root,path),'x\nNA\n');
  const file=await readWorkspaceFile(root,path);assert.equal(file.bytes.toString(),'x\nNA\n');assert.equal(file.mediaType,'text/csv');
  await writeFile(join(root,path),'x\nnew\n');assert.notEqual((await readWorkspaceFile(root,path)).revision,file.revision);
  assert.equal((await readWorkspaceFile(root,'docs/../'+path)).path,path);
});
test('rejects traversal, absolute paths, encoded traversal, missing, directories, unsupported and oversize',async t=>{
  const root=await fixture(t);await writeFile(join(root,'a.csv'),'12345');await writeFile(join(root,'a.exe'),'x');
  for(const path of ['/etc/passwd','../a.csv','docs/../../a.csv','%2e%2e/a.csv','docs/%252e%252e/a.csv','a\\b.csv']) await assert.rejects(readWorkspaceFile(root,path),{code:'invalid_path'});
  await assert.rejects(readWorkspaceFile(root,'missing.csv'),{code:'file_unavailable'});
  await assert.rejects(readWorkspaceFile(root,'docs'),{code:'unsupported_type'});
  await assert.rejects(readWorkspaceFile(root,'a.exe'),{code:'unsupported_type'});
  await assert.rejects(readWorkspaceFile(root,'a.csv',4),{code:'file_too_large'});
  await mkdir(join(root,'directory.csv'));await assert.rejects(readWorkspaceFile(root,'directory.csv'),{code:'not_file'});
});
test('symlinks within workspace work; escaping file and directory symlinks fail',async t=>{
  const root=await fixture(t);await writeFile(join(root,'a.csv'),'inside');await symlink(join(root,'a.csv'),join(root,'link.csv'));
  assert.equal((await readWorkspaceFile(root,'link.csv')).bytes.toString(),'inside');
  const outside=await mkdtemp(join(tmpdir(),'datapressr-outside-'));t.after(()=>rm(outside,{recursive:true,force:true}));await writeFile(join(outside,'a.csv'),'secret');
  await symlink(join(outside,'a.csv'),join(root,'escape.csv'));await symlink(outside,join(root,'escape'));
  for(const path of ['escape.csv','escape/a.csv']) await assert.rejects(readWorkspaceFile(root,path),{code:'outside_workspace'});
});
test('atomic replacement and deletion/restoration are read afresh',async t=>{
  const {rename}=await import('node:fs/promises');const root=await fixture(t);await writeFile(join(root,'live.csv'),'a\n1\n');const first=await readWorkspaceFile(root,'live.csv');
  await writeFile(join(root,'next.csv'),'a\n2\n');await rename(join(root,'next.csv'),join(root,'live.csv'));assert.notEqual((await readWorkspaceFile(root,'live.csv')).revision,first.revision);
  await rename(join(root,'live.csv'),join(root,'hidden.csv'));await assert.rejects(readWorkspaceFile(root,'live.csv'));await rename(join(root,'hidden.csv'),join(root,'live.csv'));assert.equal((await readWorkspaceFile(root,'live.csv')).bytes.toString(),'a\n2\n');
});
