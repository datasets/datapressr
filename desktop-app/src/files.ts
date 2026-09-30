import { realpath, open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { isAbsolute, relative, resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { LIMITS } from './limits.ts';
export class PreviewError extends Error {
  code:string;
  constructor(code:string,message:string) {super(message);this.code=code;}
}
export type FileContent = {path:string;mediaType:string;bytes:Buffer;revision:string};
const media:Record<string,string> = {'.csv':'text/csv','.md':'text/markdown','.markdown':'text/markdown','.html':'text/html','.htm':'text/html','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.css':'text/css'};
export function relativePath(path:string):string {
  if (!path || isAbsolute(path) || /[\\\x00-\x1f%]/.test(path) || /^[a-z][a-z0-9+.-]*:/i.test(path)) throw new PreviewError('invalid_path','Use a relative path inside the workspace.');
  const normalized = relative('/',resolve('/',path));
  // Resolve from a sentinel to detect attempts to cross the starting root.
  let depth=0;
  for(const part of path.split('/')) {if(part==='..') depth--; else if(part && part!=='.') depth++; if(depth<0) throw new PreviewError('invalid_path','The path escapes the workspace.');}
  return normalized;
}
function inside(root:string,path:string):boolean {const rel=relative(root,path);return rel!== '..' && !rel.startsWith('../') && !isAbsolute(rel);}
export async function readWorkspaceFile(root:string,input:string,limit:number=LIMITS.fileBytes):Promise<FileContent> {
  const path=relativePath(input);
  const mediaType=media[extname(path).toLowerCase()];
  if(!mediaType) throw new PreviewError('unsupported_type','This file type is not supported.');
  try {
    const canonicalRoot=await realpath(root);
    const filePath=await realpath(resolve(canonicalRoot,path));
    if(!inside(canonicalRoot,filePath)) throw new PreviewError('outside_workspace','The file points outside this workspace.');
    const handle=await open(filePath,constants.O_RDONLY|constants.O_NOFOLLOW);
    try {
      const info=await handle.stat();
      if(!info.isFile()) throw new PreviewError('not_file','Choose a file, not a directory.');
      if(info.size>limit) throw new PreviewError('file_too_large',`File exceeds the ${limit.toLocaleString()} byte preview limit.`);
      // Bounded even if a writer grows the file after stat.
      const buffer=Buffer.alloc(limit+1);let length=0;
      while(length<buffer.length) {const {bytesRead}=await handle.read(buffer,length,buffer.length-length,null);if(!bytesRead)break;length+=bytesRead;}
      if(length>limit) throw new PreviewError('file_too_large',`File exceeds the ${limit.toLocaleString()} byte preview limit.`);
      const bytes=Buffer.from(buffer.subarray(0,length));
      return {path,mediaType,bytes,revision:createHash('sha256').update(bytes).digest('hex')};
    } finally {await handle.close();}
  } catch(cause) {
    if(cause instanceof PreviewError) throw cause;
    throw new PreviewError('file_unavailable','The file is missing, changing or inaccessible.');
  }
}
