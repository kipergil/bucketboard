import 'server-only';
import { createItem, readItems } from '@directus/sdk';
import { getServiceDirectusClient } from '../lib/directus/client';

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Matches a pasted shop-link URL to an existing retailer by hostname
 * (retailers.domains). No match creates a `draft` retailer for admin
 * review — never published automatically, per the spec's "unmatched
 * domains create a pending retailer for admin review".
 */
export async function matchOrCreateRetailerForUrl(url: string): Promise<string> {
  const hostname = hostnameOf(url);
  if (!hostname) {
    throw new Error('Could not determine a domain from that URL.');
  }

  const client = getServiceDirectusClient();
  // `domains` is a `json` column (an arbitrary string[]), not a Directus
  // "array" field type, so the SDK doesn't offer a typed "array contains"
  // filter operator for it. The retailer catalogue is small (tens of
  // rows), so matching in JS after a full read is simpler and safer than
  // relying on an untyped raw filter escape hatch.
  const allRetailers = await client.request(
    readItems('retailers', { fields: ['id', 'domains'], limit: -1 }),
  );
  const match = (allRetailers as Array<{ id: string; domains: string[] }>).find((retailer) =>
    retailer.domains.includes(hostname),
  );
  if (match) return match.id;

  const created = await client.request(
    createItem(
      'retailers',
      {
        tenant: null,
        name: hostname,
        slug: hostname.replace(/\./g, '-'),
        type: 'online',
        kind: 'independent',
        domains: [hostname],
        nofollow: true,
        status: 'draft',
      },
      { fields: ['id'] },
    ),
  );
  return (created as { id: string }).id;
}
