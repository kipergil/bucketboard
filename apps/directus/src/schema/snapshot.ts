import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { schemaSnapshot } from '@directus/sdk';
import { stringify } from 'yaml';
import { getSchemaClient } from '../lib/client.js';

const outPath = join(dirname(fileURLToPath(import.meta.url)), '../../schema/snapshot.yaml');

/**
 * Captures the live Directus schema as a committed, human-diffable YAML
 * artifact via Directus's own `schema/snapshot` endpoint. This mirrors
 * `directus schema snapshot`; the TypeScript definitions under
 * `src/schema/definitions/` remain the authoritative, hand-edited source —
 * this file is regenerated after every schema change for review/audit and
 * as the input a fresh environment could restore from with
 * `directus schema apply` if ever needed outside this repo's own
 * `pnpm schema:apply` script.
 */
async function main() {
  const client = await getSchemaClient();
  const snapshot = await client.request(schemaSnapshot());

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, stringify(snapshot), 'utf-8');
  console.log(`Wrote schema snapshot to ${outPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
