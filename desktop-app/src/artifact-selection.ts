import type { ArtifactKind, ArtifactRef } from './types.ts';
const kinds:Record<string,ArtifactKind> = {'.csv':'csv','.md':'markdown','.markdown':'markdown','.html':'html','.htm':'html','.svg':'image','.png':'image','.jpg':'image','.jpeg':'image','.webp':'image'};
export function selectArtifact(path:string):ArtifactRef {
  if (!path || path.startsWith('/') || /[\\\x00-\x1f%]/.test(path) || /^[a-z][a-z0-9+.-]*:/i.test(path)) throw new Error('Enter a supported file path relative to this workspace.');
  const parts:string[] = [];
  for (const part of path.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..' && parts.length && parts.at(-1) !== '..') parts.pop(); else parts.push(part);
  }
  const normalized = parts.join('/');
  if (normalized === '..' || normalized.startsWith('../')) throw new Error('The file must be inside this workspace.');
  const kind = kinds[('.'+normalized.split('/').at(-1)!.split('.').pop()).toLowerCase()];
  if (!kind) throw new Error('Supported files: CSV, Markdown, HTML, SVG, PNG, JPEG and WebP.');
  return {path:normalized,kind,label:normalized};
}
