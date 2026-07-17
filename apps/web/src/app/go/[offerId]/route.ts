import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { resolveOffer, recordOfferClick } from '@/services/offers';
import { getCurrentDirectusUser } from '@/lib/auth/current-user';

const BOT_USER_AGENT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|preview/i;

/**
 * The single outbound redirect for every affiliate/shop link in the app —
 * the raw destination URL is never rendered directly (see item_offers'
 * Public policy field restrictions). Resolves via
 * packages/shared's resolveOutboundUrl, fire-and-forgets a click record,
 * and 302s. Excluded from robots.txt.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> },
): Promise<NextResponse> {
  const { offerId } = await params;

  const resolved = await resolveOffer(offerId);
  if (!resolved) {
    return NextResponse.redirect(new URL('/', request.url), { status: 404 });
  }

  const userAgent = request.headers.get('user-agent') ?? '';
  const isBot =
    BOT_USER_AGENT_PATTERN.test(userAgent) || request.headers.get('purpose') === 'prefetch';

  if (!isBot) {
    const tenantId =
      typeof resolved.offer.tenant === 'string' ? resolved.offer.tenant : resolved.offer.tenant.id;
    const itemId =
      typeof resolved.offer.item === 'string' ? resolved.offer.item : resolved.offer.item.id;
    const retailerId = resolved.retailer.id;

    // Fire-and-forget — never await, must not delay the redirect.
    getCurrentDirectusUser()
      .then((user) =>
        recordOfferClick({
          tenantId,
          itemId,
          offerId,
          retailerId,
          userId: user?.id ?? null,
          referrer: request.headers.get('referer'),
          userAgentHash: userAgent ? createHash('sha256').update(userAgent).digest('hex') : null,
          country: request.headers.get('x-vercel-ip-country'),
        }),
      )
      .catch(() => {
        // Click tracking is best-effort; never surface a failure to the visitor.
      });
  }

  return NextResponse.redirect(resolved.link.href, { status: 302 });
}
