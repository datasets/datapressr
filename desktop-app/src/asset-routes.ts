import { posix } from 'node:path';
import type { Workspace } from './bb-workspace.ts';
import { PreviewError, readWorkspaceFile, relativePath } from './files.ts';
export function resolveAssetPath(documentPath:string,reference:string):string {
  relativePath(documentPath);
  if(!reference || reference.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(reference) || /%(?:2e|2f|5c|25)/i.test(reference)) throw new PreviewError('invalid_path','Only local document-relative assets are supported.');
  let decoded:string;
  try {decoded=decodeURIComponent(reference.split(/[?#]/)[0]);} catch {throw new PreviewError('invalid_path','Invalid asset URL.');}
  if(decoded.startsWith('/') || decoded.includes('\\')) throw new PreviewError('invalid_path','Invalid asset path.');
  return relativePath(`${posix.dirname(documentPath)}/${decoded}`);
}
// Transported through bb.rpc: no new HTTP route, bearer token or auth bypass.
// Data URLs load in sandbox="" frames without credentials or network access.
export async function readAsset(workspace:Workspace,documentPath:string,reference:string) {
  const file=await readWorkspaceFile(workspace.rootPath,resolveAssetPath(documentPath,reference));
  return {workspace,path:file.path,revision:file.revision,dataUrl:`data:${file.mediaType};base64,${file.bytes.toString('base64')}`};
}
