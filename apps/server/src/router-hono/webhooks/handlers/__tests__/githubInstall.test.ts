// @vitest-environment node
import { getTestDB } from '@lobechat/database/test-utils';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { users, workspaceMembers, workspaces } from '@/database/schemas';

import { githubInstall } from '../githubInstall';

const serverDB = await getTestDB();
const userId = 'scm-install-user';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  issueState: vi.fn(),
}));

vi.mock('@/database/core/db-adaptor', () => ({ getServerDB: vi.fn(async () => serverDB) }));
vi.mock('@/envs/scm', () => ({ scmEnv: { ENABLED_GITHUB_APP: true, GITHUB_APP_SLUG: 'dev' } }));
vi.mock('@/auth', () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock('@/server/services/scm/oauth/stateStore', () => ({
  issueScmInstallState: mocks.issueState,
}));
vi.mock('@/server/services/scm/github/app', () => ({
  buildGitHubInstallUrl: (state: string) =>
    `https://github.com/apps/dev/installations/new?state=${state}`,
}));

const app = new Hono().get('/install', githubInstall);
const install = (query: Record<string, string>) =>
  app.request(`http://localhost/install?${new URLSearchParams(query)}`);

beforeEach(async () => {
  await serverDB.insert(users).values({ id: userId });
  mocks.getSession.mockResolvedValue({ user: { id: userId } });
  mocks.issueState.mockResolvedValue('state-1');
});

afterEach(async () => {
  await serverDB.delete(workspaces);
  await serverDB.delete(users);
  vi.clearAllMocks();
});

describe('githubInstall', () => {
  it('keeps the sign-in bounce on the public origin behind a Docker proxy', async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await app.request(
      'https://0.0.0.0:3210/install?returnTo=%2Facme%2Fsettings%2Fintegrations%2Fgithub&workspaceId=ws',
    );
    expect(res.status).toBe(302);
    const location = res.headers.get('location')!;
    expect(location.startsWith('/signin?')).toBe(true);
    const target = new URL(location, 'https://public.example.com');
    expect(target.origin).toBe('https://public.example.com');
    expect(target.searchParams.get('callbackUrl')).toBe(
      '/api/webhooks/github/install?returnTo=%2Facme%2Fsettings%2Fintegrations%2Fgithub&workspaceId=ws',
    );
  });

  it('issues a state for the session user and sends them to GitHub', async () => {
    const res = await install({ returnTo: '/settings/integrations/github' });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(
      'https://github.com/apps/dev/installations/new?state=state-1',
    );
    expect(mocks.issueState).toHaveBeenCalledWith({
      lobeUserId: userId,
      returnTo: '/settings/integrations/github',
      workspaceId: null,
    });
  });

  it('drops a cross-origin returnTo before it reaches the state', async () => {
    await install({ returnTo: 'https://evil.example/phish' });
    expect(mocks.issueState).toHaveBeenCalledWith(expect.objectContaining({ returnTo: undefined }));
  });

  it('lets members install into a workspace but not viewers', async () => {
    const [workspace] = await serverDB
      .insert(workspaces)
      .values({ name: 'ws', primaryOwnerId: userId, slug: 'scm-install-ws' })
      .returning();

    await serverDB
      .insert(workspaceMembers)
      .values({ role: 'viewer', userId, workspaceId: workspace.id });
    const denied = await install({ workspaceId: workspace.id });
    expect(denied.status).toBe(403);
    expect(mocks.issueState).not.toHaveBeenCalled();

    await serverDB
      .update(workspaceMembers)
      .set({ role: 'member' })
      .where(eq(workspaceMembers.workspaceId, workspace.id));
    const allowed = await install({ workspaceId: workspace.id });
    expect(allowed.status).toBe(302);
    expect(mocks.issueState).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: workspace.id }),
    );
  });
});
