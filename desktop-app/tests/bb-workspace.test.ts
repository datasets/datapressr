import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveWorkspace, type WorkspaceServices } from '../src/bb-workspace.ts';

async function fixture(t: {after: (fn: () => Promise<void>) => void}) {
  const root = await mkdtemp(join(tmpdir(), 'datapressr-workspace-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  await mkdir(join(root, 'one')); await mkdir(join(root, 'two'));
  const services: WorkspaceServices = {
    thread: async id => ({ environmentId: id === 'first' ? 'one' : 'two' }),
    environment: async id => ({id, hostId: 'local', path: join(root, id), status: 'ready', lifecycle: {phase: 'active'}, hostLifecycle: 'active'}),
    primaryHost: async () => 'local',
  };
  return {root, services};
}
test('resolves two threads to their own canonical worktrees', async t => {
  const {root, services} = await fixture(t);
  for (const [threadId, environmentId] of [['first','one'],['second','two']]) {
    assert.deepEqual(await resolveWorkspace(services, threadId), {ok:true, workspace: {threadId, environmentId, hostId:'local', rootPath:await realpath(join(root,environmentId))}});
  }
});
test('reports a missing thread environment', async t => {
  const {services} = await fixture(t); services.thread = async () => ({environmentId:null});
  assert.equal((await resolveWorkspace(services,'first')).ok, false);
});
for (const state of ['destroyed','provisioning','retiring']) test(`rejects ${state} environment`, async t => {
  const {services} = await fixture(t); const get = services.environment;
  services.environment = async id => ({...await get(id), status: state === 'retiring' ? 'ready' : state, lifecycle:{phase:state}});
  assert.equal((await resolveWorkspace(services,'first')).ok, false);
});
test('rejects remote host even if path exists locally', async t => {
  const {services} = await fixture(t); services.primaryHost = async () => 'another-host';
  assert.deepEqual(await resolveWorkspace(services,'first'), {ok:false, code:'remote_workspace', message:'Remote workspaces are not supported in v0.1.'});
});
test('rejects unknown primary host', async t => {
  const {services} = await fixture(t); services.primaryHost = async () => null;
  assert.equal((await resolveWorkspace(services,'first')).ok, false);
});
test('reports unavailable BB service', async t => {
  const {services} = await fixture(t); services.thread = async () => {throw new Error('offline');};
  assert.deepEqual(await resolveWorkspace(services,'first'), {ok:false, code:'bb_unavailable', message:'BB workspace information is unavailable. Retry when BB is connected.'});
});
test('reports deleted directory', async t => {
  const {services, root} = await fixture(t); await rm(join(root,'one'), {recursive:true});
  const result = await resolveWorkspace(services,'first');
  assert.equal(result.ok,false); if (!result.ok) assert.equal(result.code,'workspace_unavailable');
});
