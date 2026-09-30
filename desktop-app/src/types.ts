export type { Workspace } from './bb-workspace.ts';
export type ArtifactKind = 'csv' | 'markdown' | 'html' | 'image';
export type ArtifactRef = {path:string; kind:ArtifactKind; label:string; datasetPath?:string};
export type PreviewRequest = {threadId:string; path:string};
