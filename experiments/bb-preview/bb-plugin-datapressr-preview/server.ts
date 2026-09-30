import { defineRpcContract, type BbPluginApi } from '@get-bb/plugin-sdk';
import { z } from 'zod';
import { readArtifact } from './reader.ts';

export const rpcContract = defineRpcContract({
  preview: {
    input: z.object({ kind: z.enum(['data', 'readme', 'story']) }),
    output: z.object({ name: z.string(), content: z.string(), columns: z.array(z.string()), rows: z.array(z.array(z.string())), revision: z.string() }),
  },
});
export default function plugin(bb: BbPluginApi) {
  const settings = bb.settings.define({ fixtureDirectory: { type: 'string', label: 'Fixture directory', default: '' } });
  bb.rpc.register(rpcContract, {
    preview: async ({ kind }) => {
      const { fixtureDirectory } = await settings.get();
      if (!fixtureDirectory) throw new Error('Set the fixtureDirectory plugin setting before previewing.');
      return readArtifact(fixtureDirectory, kind);
    },
  });
  bb.log.info('Read-only DataPressr fixture preview loaded');
}
