import { defineRpcContract, type BbPluginApi } from '@get-bb/plugin-sdk';
import { z } from 'zod';
import { discoverArtifacts } from './src/artifacts.ts';
import { bbWorkspaceServices, resolveWorkspace } from './src/bb-workspace.ts';

const workspaceSchema = z.object({threadId:z.string(), environmentId:z.string(), hostId:z.string(), rootPath:z.string()});
const errorSchema = z.object({ok:z.literal(false), code:z.string(), message:z.string()});
export const rpcContract = defineRpcContract({
  catalog: {
    input: z.object({threadId:z.string().min(1)}).strict(),
    output: z.discriminatedUnion('ok', [errorSchema, z.object({ok:z.literal(true),workspace:workspaceSchema,catalog:z.object({
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
    workspace: ({threadId}) => resolveWorkspace(bbWorkspaceServices(bb), threadId),
    catalog: async ({threadId}) => {
      const result = await resolveWorkspace(bbWorkspaceServices(bb),threadId);
      if (!result.ok) return result;
      return {...result,catalog:await discoverArtifacts(result.workspace.rootPath)};
    },
  });
  bb.log.info('DataPressr workspace preview loaded');
}
