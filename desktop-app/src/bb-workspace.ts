import { realpath, stat } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import type { BbPluginApi } from '@get-bb/plugin-sdk';
export type Workspace = {threadId:string; environmentId:string; hostId:string; rootPath:string};
export type WorkspaceServices = {
  thread(id:string): Promise<{environmentId:string|null}>;
  environment(id:string): Promise<{id:string;hostId:string;path:string|null;status:string;lifecycle:{phase:string};hostLifecycle:string}>;
  primaryHost(): Promise<string|null>;
};
export type WorkspaceResult = {ok:true;workspace:Workspace}|{ok:false;code:string;message:string};
export async function resolveWorkspace(services:WorkspaceServices, threadId:string):Promise<WorkspaceResult> {
  const failure = (code:string, message:string):WorkspaceResult => ({ok:false, code, message});
  let environment: Awaited<ReturnType<WorkspaceServices['environment']>>;
  try {
    const thread = await services.thread(threadId);
    if (!thread.environmentId) return failure('missing_environment', 'This conversation has no workspace yet.');
    environment = await services.environment(thread.environmentId);
    const primaryHost = await services.primaryHost();
    if (!primaryHost) return failure('bb_unavailable', 'BB has not identified its local host.');
    if (environment.hostId !== primaryHost) return failure('remote_workspace', 'Remote workspaces are not supported in v0.1.');
    if (environment.id !== thread.environmentId || environment.status !== 'ready' || environment.lifecycle.phase !== 'active' || environment.hostLifecycle !== 'active') {
      return failure('environment_unavailable', 'This conversation’s workspace is not ready or has been removed.');
    }
  } catch {
    return failure('bb_unavailable', 'BB workspace information is unavailable. Retry when BB is connected.');
  }
  try {
    if (!environment.path || !isAbsolute(environment.path)) throw new Error('Missing absolute path');
    const rootPath = await realpath(environment.path);
    if (!(await stat(rootPath)).isDirectory()) throw new Error('Not a directory');
    return {ok:true, workspace:{threadId, environmentId:environment.id, hostId:environment.hostId, rootPath}};
  } catch {
    return failure('workspace_unavailable', 'The workspace directory is missing or inaccessible.');
  }
}

// Public SDK adapter; do not fall back to a project's default path.
export function bbWorkspaceServices(bb:BbPluginApi):WorkspaceServices {
  return {
    thread: threadId => bb.sdk.threads.get({threadId}),
    environment: environmentId => bb.sdk.environments.get({environmentId}),
    primaryHost: async () => (await bb.sdk.system.config()).primaryHostId,
  };
}
