#!/usr/bin/env bun
/**
 * Klavis cleanup script — delete users (and all their MCP server instances)
 * under the API key set in `KLAVIS_API_KEY`.
 *
 * Usage:
 *   KLAVIS_API_KEY=xxx bunx scripts/klavisCleanup.mts                # dry-run: list only
 *   KLAVIS_API_KEY=xxx bunx scripts/klavisCleanup.mts --confirm      # delete all
 *   KLAVIS_API_KEY=xxx bunx scripts/klavisCleanup.mts --confirm --keep <userId>
 *
 * The key is read from the environment only — never from CLI args.
 */
import { KlavisClient } from 'klavis';

const apiKey = process.env.KLAVIS_API_KEY?.trim();
if (!apiKey) {
  console.error('❌ KLAVIS_API_KEY env var is required (do not paste the key as an argument).');
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const confirm = args.has('--confirm');
const keepIdx = process.argv.indexOf('--keep');
const keepUserId = keepIdx >= 0 ? process.argv[keepIdx + 1] : undefined;

const client = new KlavisClient({ apiKey });

const fetchAllUsers = async () => {
  const all: { userId: string; createdAt: string }[] = [];
  let page = 1;
  while (true) {
    const res = await client.user.getAllUsers({ page_number: page, page_size: 100 });
    all.push(...res.users);
    if (page >= res.totalPages || res.users.length === 0) break;
    page += 1;
  }
  return all;
};

const main = async () => {
  console.log(`Fetching users for API key …`);
  const users = await fetchAllUsers();
  console.log(`Found ${users.length} user(s).`);

  if (users.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  for (const u of users) {
    const integrations = await client.user
      .getUserIntegrations(u.userId)
      .catch(() => ({ integrations: [] as unknown }));
    const list = (integrations as { integrations?: string[] }).integrations ?? [];
    const willKeep = keepUserId === u.userId;
    console.log(
      `  ${willKeep ? '🟢 keep ' : '🔴 will delete'} userId=${u.userId} created=${u.createdAt} integrations=${JSON.stringify(list)}`,
    );
  }

  if (!confirm) {
    console.log('\nDry-run complete. Re-run with --confirm to delete.');
    return;
  }

  console.log('\n--confirm provided. Deleting…');
  let deleted = 0;
  let failed = 0;
  for (const u of users) {
    if (keepUserId === u.userId) continue;
    try {
      await client.user.deleteUserByUserId(u.userId);
      console.log(`  ✅ deleted ${u.userId}`);
      deleted += 1;
    } catch (error) {
      console.error(`  ❌ failed ${u.userId}:`, error instanceof Error ? error.message : error);
      failed += 1;
    }
  }
  console.log(`\nDone. deleted=${deleted} failed=${failed} kept=${keepUserId ?? 'none'}`);
};

main().catch((error) => {
  console.error('❌ fatal:', error);
  process.exit(1);
});
