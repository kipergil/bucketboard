import {
  createFlow,
  createOperation,
  deleteFlow,
  readFlows,
  updateFlow,
  updateOperation,
} from '@directus/sdk';
import { getSchemaClient } from '../lib/client.js';
import { allFlows } from './definitions.js';
import type { FlowDefinition } from './types.js';

type Client = Awaited<ReturnType<typeof getSchemaClient>>;

function triggerFields(trigger: FlowDefinition['trigger']) {
  if (trigger.type === 'event') {
    return {
      trigger: 'event',
      options: { type: 'action', scope: trigger.scope, collections: trigger.collections },
    };
  }
  return { trigger: 'schedule', options: { cron: trigger.cron } };
}

/**
 * Flows are replaced wholesale on every run (delete + recreate) rather
 * than diffed field-by-field: the operation graph (resolve/reject chain)
 * is cheap to rebuild and much simpler to keep correct than a partial
 * update across two collections (directus_flows + directus_operations).
 */
async function applyFlow(client: Client, def: FlowDefinition): Promise<void> {
  // Delete every flow matching this name, not just the first — a prior
  // partial/interrupted run can otherwise leave duplicates that a
  // limit:1 lookup would never find again, compounding on each re-apply.
  const existing = await client.request(
    readFlows({ filter: { name: { _eq: def.name } }, fields: ['id'], limit: -1 }),
  );
  for (const flow of existing) {
    await client.request(deleteFlow(flow.id));
    console.log(`  - removed existing flow ${def.name} (${flow.id})`);
  }

  const flow = await client.request(
    createFlow({
      name: def.name,
      icon: def.icon,
      description: def.description,
      status: 'active',
      accountability: 'all',
      ...triggerFields(def.trigger),
    }),
  );

  const idByKey = new Map<string, string>();
  let y = 1;
  for (const op of def.operations) {
    const created = await client.request(
      createOperation({
        name: op.name,
        key: op.key,
        type: op.type,
        position_x: 19,
        position_y: y,
        options: op.options,
        flow: flow.id,
      }),
    );
    idByKey.set(op.key, created.id);
    y += 4;
  }

  for (const op of def.operations) {
    const patch: Record<string, string> = {};
    if (op.resolve) patch.resolve = idByKey.get(op.resolve) as string;
    if (op.reject) patch.reject = idByKey.get(op.reject) as string;
    if (Object.keys(patch).length > 0) {
      await client.request(updateOperation(idByKey.get(op.key) as string, patch));
    }
  }

  const entryPoint = def.operations[0];
  if (entryPoint) {
    await client.request(updateFlow(flow.id, { operation: idByKey.get(entryPoint.key) }));
  }

  console.log(`  + created flow ${def.name} (${def.operations.length} operations)`);
}

async function main() {
  console.log('Applying BucketBoard flows...');
  const client = await getSchemaClient();

  for (const def of allFlows) {
    await applyFlow(client, def);
  }

  console.log('\nFlows apply complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
