import { randomBytes } from 'node:crypto';
import {
  createPermissions,
  createPolicy,
  createRole,
  createUser,
  customEndpoint,
  deletePermissions,
  readPermissions,
  readPolicies,
  readRoles,
  readUsers,
  updateUser,
} from '@directus/sdk';
import { getSchemaClient } from '../lib/client.js';
import { assertMinimumDirectusVersion } from '../lib/version.js';
import { allPolicies, publicPolicy } from './definitions.js';
import type { PolicyDefinition } from './types.js';

const SERVICE_ACCOUNT_EMAIL = 'service@bucketboard.dev';

type Client = Awaited<ReturnType<typeof getSchemaClient>>;

async function findPolicyByName(client: Client, name: string): Promise<string | null> {
  const found = await client.request(
    readPolicies({ filter: { name: { _eq: name } }, fields: ['id'], limit: 1 }),
  );
  return found[0]?.id ?? null;
}

async function findRoleByName(client: Client, name: string): Promise<string | null> {
  const found = await client.request(
    readRoles({ filter: { name: { _eq: name } }, fields: ['id'], limit: 1 }),
  );
  return found[0]?.id ?? null;
}

/**
 * `directus_access` (the role<->policy join, and how the built-in "Public"
 * policy is represented — a row with `role: null`) isn't wrapped by the
 * SDK's typed commands, so these go through `customEndpoint`. Directus's
 * REST API accepts a JSON-encoded `filter` query param, built manually
 * here since `customEndpoint`'s `params` bypasses the SDK's own query
 * serialization.
 */
function accessQuery(filter: Record<string, unknown>, limit: number): string {
  return `/access?${new URLSearchParams({ filter: JSON.stringify(filter), limit: String(limit) }).toString()}`;
}

async function findPublicPolicyId(client: Client): Promise<string> {
  const access = await client.request(
    customEndpoint<Array<{ policy: string; role: string | null }>>({
      path: accessQuery({ role: { _null: true } }, 1),
      method: 'GET',
    }),
  );
  const policyId = access[0]?.policy;
  if (!policyId) {
    throw new Error(
      'Could not find the built-in Public policy (no directus_access row with role=null). ' +
        'This is unexpected on a stock Directus 11 install.',
    );
  }
  return policyId;
}

async function ensureAccess(client: Client, roleId: string, policyId: string): Promise<void> {
  const existing = await client.request(
    customEndpoint<Array<{ id: string }>>({
      path: accessQuery({ role: { _eq: roleId }, policy: { _eq: policyId } }, 1),
      method: 'GET',
    }),
  );
  if (existing.length > 0) return;

  await client.request(
    customEndpoint({
      path: '/access',
      method: 'POST',
      body: JSON.stringify({ role: roleId, policy: policyId }),
    }),
  );
}

async function replacePermissions(
  client: Client,
  policyId: string,
  rules: PolicyDefinition['rules'],
): Promise<void> {
  const existing = await client.request(
    readPermissions({ filter: { policy: { _eq: policyId } }, fields: ['id'], limit: -1 }),
  );
  const existingIds = existing.map((p) => p.id);
  if (existingIds.length > 0) {
    await client.request(deletePermissions(existingIds));
  }

  if (rules.length === 0) return;

  await client.request(
    createPermissions(
      rules.map((rule) => ({
        policy: policyId,
        collection: rule.collection,
        action: rule.action,
        permissions: rule.filter ?? {},
        fields: rule.fields ?? ['*'],
        presets: rule.presets ?? null,
      })),
    ),
  );
}

async function ensureNonPublicPolicy(client: Client, def: PolicyDefinition): Promise<void> {
  let policyId = await findPolicyByName(client, def.name);
  if (!policyId) {
    const created = await client.request(
      createPolicy({
        name: def.name,
        icon: def.icon,
        description: def.description,
        admin_access: def.adminAccess,
        app_access: def.appAccess,
      }),
    );
    policyId = created.id;
    console.log(`  + policy ${def.name}`);
  } else {
    console.log(`  = policy ${def.name} already exists`);
  }

  if (def.role) {
    let roleId = await findRoleByName(client, def.name);
    if (!roleId) {
      const createdRole = await client.request(
        createRole({ name: def.name, icon: def.role.icon, description: def.description }),
      );
      roleId = createdRole.id;
      console.log(`  + role ${def.name}`);
    } else {
      console.log(`  = role ${def.name} already exists`);
    }
    await ensureAccess(client, roleId, policyId);
  }

  await replacePermissions(client, policyId, def.rules);
  console.log(`  = ${def.rules.length} permission rule(s) applied for ${def.name}`);
}

/**
 * The Next.js BFF authenticates to Directus with one long-lived static
 * token, not a login/refresh flow. That token has to live on some
 * directus_users row — this provisions a dedicated, non-human "Service"
 * account (role: Service) and prints its token so it can be pasted into
 * apps/directus/.env and apps/web/.env.local as SERVICE_TOKEN. Re-running
 * this script never rotates an existing token — delete the user (or its
 * token field) in the panel to force a fresh one.
 */
async function ensureServiceAccount(client: Client): Promise<void> {
  const serviceRoleId = await findRoleByName(client, 'Service');
  if (!serviceRoleId) {
    throw new Error('Service role missing — ensureNonPublicPolicy should have created it.');
  }

  const existing = await client.request(
    readUsers({
      filter: { email: { _eq: SERVICE_ACCOUNT_EMAIL } },
      fields: ['id', 'token'],
      limit: 1,
    }),
  );

  if (existing[0]) {
    if (!existing[0].token) {
      const token = randomBytes(32).toString('hex');
      // Explicit `fields` avoids Directus's default `*` selection, which
      // errors trying to flat-select our custom `memberships` alias field.
      await client.request(updateUser(existing[0].id, { token }, { fields: ['id'] }));
      console.log(`  = service account exists, generated missing token: ${token}`);
    } else {
      console.log('  = service account already exists (token unchanged)');
    }
    return;
  }

  const token = randomBytes(32).toString('hex');
  await client.request(
    createUser(
      {
        email: SERVICE_ACCOUNT_EMAIL,
        first_name: 'BucketBoard',
        last_name: 'Service Account',
        role: serviceRoleId,
        status: 'active',
        token,
      },
      { fields: ['id'] },
    ),
  );
  console.log('  + service account created');
  console.log(`\n  SERVICE_TOKEN=${token}`);
  console.log('  Paste this into apps/directus/.env and apps/web/.env.local\n');
}

async function main() {
  console.log('Applying BucketBoard permissions...');
  const client = await getSchemaClient();
  await assertMinimumDirectusVersion(client);

  console.log('\nPublic policy (built-in)');
  const publicPolicyId = await findPublicPolicyId(client);
  await replacePermissions(client, publicPolicyId, publicPolicy.rules);
  console.log(`  = ${publicPolicy.rules.length} permission rule(s) applied for Public`);

  console.log('\nApp policies + roles');
  for (const def of allPolicies) {
    await ensureNonPublicPolicy(client, def);
  }

  console.log('\nService account');
  await ensureServiceAccount(client);

  console.log('\nPermissions apply complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
