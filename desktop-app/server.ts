import { defineRpcContract, type BbPluginApi } from '@get-bb/plugin-sdk';
import { z } from 'zod';
import { bbWorkspaceServices, resolveWorkspace } from './src/bb-workspace.ts';

export const rpcContract = defineRpcContract({
  workspace: {
    input: z.object({threadId:z.string().min(1)}).strict(),
    output: z.discriminatedUnion('ok', [
      z.object({ok:z.literal(true), workspace:z.object({threadId:z.string(), environmentId:z.string(), hostId:z.string(), rootPath:z.string()})}),
      z.object({ok:z.literal(false), code:z.string(), message:z.string()}),
    ]),
  },
});
export default function plugin(bb:BbPluginApi) {
  bb.rpc.register(rpcContract, {workspace: ({threadId}) => resolveWorkspace(bbWorkspaceServices(bb), threadId)});
  bb.log.info('DataPressr workspace preview loaded');
}
