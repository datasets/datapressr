import { selectionKey } from './src/refresh.ts';
import { selectArtifact } from './src/artifact-selection.ts';
import { renderDocument } from './src/documents.ts';
import { readAsset } from './src/asset-routes.ts';
import { readWorkspaceFile, PreviewError } from './src/files.ts';
import { LIMITS } from './src/limits.ts';
import { defineRpcContract, type BbPluginApi } from '@get-bb/plugin-sdk';
import { z } from 'zod';
import { discoverArtifacts } from './src/artifacts.ts';
import { bbWorkspaceServices, resolveWorkspace } from './src/bb-workspace.ts';

const workspaceSchema = z.object({threadId:z.string(), environmentId:z.string(), hostId:z.string(), rootPath:z.string()});
const errorSchema = z.object({ok:z.literal(false), code:z.string(), message:z.string()});
export const rpcContract = defineRpcContract({
  select: {
    input:z.object({threadId:z.string().min(1),environmentId:z.string().min(1),path:z.string().min(1)}).strict(),
    output:z.discriminatedUnion('ok',[errorSchema,z.object({ok:z.literal(true)})]),
  },
  document: {
    input:z.object({threadId:z.string().min(1),path:z.string().min(1)}).strict(),
    output:z.discriminatedUnion('ok',[errorSchema,z.object({ok:z.literal(true),workspace:workspaceSchema,path:z.string(),html:z.string(),revision:z.string(),warnings:z.array(z.string())})]),
  },
  file: {
    input:z.object({threadId:z.string().min(1),path:z.string().min(1)}).strict(),
    output:z.discriminatedUnion('ok',[errorSchema,z.object({ok:z.literal(true),workspace:workspaceSchema,path:z.string(),mediaType:z.string(),revision:z.string(),content:z.string(),dataUrl:z.string(),limitBytes:z.number()})]),
  },
  asset: {
    input:z.object({threadId:z.string().min(1),documentPath:z.string().min(1),reference:z.string().min(1)}).strict(),
    output:z.discriminatedUnion('ok',[errorSchema,z.object({ok:z.literal(true),workspace:workspaceSchema,path:z.string(),revision:z.string(),dataUrl:z.string()})]),
  },
  catalog: {
    input: z.object({threadId:z.string().min(1)}).strict(),
    output: z.discriminatedUnion('ok', [errorSchema, z.object({ok:z.literal(true),workspace:workspaceSchema,selectedPath:z.string().nullable(),catalog:z.object({
      artifacts:z.array(z.object({path:z.string(),kind:z.enum(['csv','markdown','html','image']),label:z.string(),datasetPath:z.string().optional()})),
      datasets:z.array(z.object({path:z.string(),title:z.string()})),warnings:z.array(z.string()),scanned:z.number(),incomplete:z.boolean(),
    })})]),
  },
  workspace: {
    input: z.object({threadId:z.string().min(1)}).strict(),
    output: z.discriminatedUnion('ok', [
      z.object({ok:z.literal(true), workspace:z.object({threadId:z.string(), environmentId:z.string(), hostId:z.string(), rootPath:z.string()})}),
      z.object({ok:z.literal(false), code:z.string(), message:z.string()}),
    ]),
  },
});
export default function plugin(bb:BbPluginApi) {
  bb.rpc.register(rpcContract, {
    select: async ({threadId,environmentId,path})=>{
      const result=await resolveWorkspace(bbWorkspaceServices(bb),threadId);if(!result.ok)return result;
      if(result.workspace.environmentId!==environmentId)return {ok:false as const,code:'workspace_changed',message:'The conversation workspace changed. Reopen the preview.'};
      try {const selected=selectArtifact(path);await bb.storage.kv.set(selectionKey(threadId,environmentId),selected.path);return {ok:true as const};}catch(cause){return fileError(cause);}
    },
    document: async ({threadId,path})=>{
      const result=await resolveWorkspace(bbWorkspaceServices(bb),threadId);if(!result.ok)return result;
      try{return {...result,path,...await renderDocument(result.workspace,path)};}catch(cause){return fileError(cause);}
    },
    file: async ({threadId,path}) => {
      const result=await resolveWorkspace(bbWorkspaceServices(bb),threadId);if(!result.ok)return result;
      try {const file=await readWorkspaceFile(result.workspace.rootPath,path);return {...result,path:file.path,mediaType:file.mediaType,revision:file.revision,content:file.mediaType.startsWith('text/')?file.bytes.toString('utf8'):'',dataUrl:`data:${file.mediaType};base64,${file.bytes.toString('base64')}`,limitBytes:LIMITS.fileBytes};}
      catch(cause) {return fileError(cause);}
    },
    asset: async ({threadId,documentPath,reference}) => {
      const result=await resolveWorkspace(bbWorkspaceServices(bb),threadId);if(!result.ok)return result;
      try {return {ok:true as const,...await readAsset(result.workspace,documentPath,reference)};} catch(cause) {return fileError(cause);}
    },
    workspace: ({threadId}) => resolveWorkspace(bbWorkspaceServices(bb), threadId),
    catalog: async ({threadId}) => {
      const result = await resolveWorkspace(bbWorkspaceServices(bb),threadId);
      if (!result.ok) return result;
      return {...result,selectedPath:await bb.storage.kv.get<string>(selectionKey(threadId,result.workspace.environmentId))??null,catalog:await discoverArtifacts(result.workspace.rootPath)};
    },
  });
  bb.log.info('DataPressr workspace preview loaded');
}

function fileError(cause:unknown) {return {ok:false as const,code:cause instanceof PreviewError?cause.code:'file_unavailable',message:cause instanceof PreviewError?cause.message:'Preview unavailable.'};}
