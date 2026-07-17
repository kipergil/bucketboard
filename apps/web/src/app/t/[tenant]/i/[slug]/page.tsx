import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTenantBySlug } from '@/services/tenants';
import { getItemAttributes, getItemBySlug, getOffersForItem } from '@/services/items';
import { getAttributeDefinitionsForCategory, getCategoryById } from '@/services/categories';
import { listCommentsForItem } from '@/services/comments';
import { getCurrentDirectusUser } from '@/lib/auth/current-user';
import { getUserVote } from '@/services/votes';
import { assetUrl } from '@/lib/directus/assets';
import { VoteButtons } from '@/components/item/vote-buttons';
import { OfferList } from '@/components/item/offer-list';
import { AttributeList } from '@/components/item/attribute-list';
import { CommentThread } from '@/components/item/comment-thread';
import { ReportButton } from '@/components/item/report-button';
import {
  CategoryBreadcrumb,
  type BreadcrumbSegment,
} from '@/components/category/category-breadcrumb';
import { ItemJsonLd } from '@/components/seo/json-ld';
import type { Retailer } from '@bucketboard/shared';

interface ItemPageProps {
  params: Promise<{ tenant: string; slug: string }>;
}

async function loadItemPage(props: ItemPageProps) {
  const { tenant: tenantSlug, slug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;
  const item = await getItemBySlug(tenant.id, slug);
  if (!item) return null;
  return { tenant, item };
}

export async function generateMetadata(props: ItemPageProps): Promise<Metadata> {
  const loaded = await loadItemPage(props);
  if (!loaded) return {};
  const { item } = loaded;
  return {
    title: item.title,
    description: (item.body ?? '').slice(0, 160),
    openGraph: { images: item.image ? [assetUrl(item.image, 'cover') ?? ''] : [] },
  };
}

export default async function ItemPage(props: ItemPageProps) {
  const loaded = await loadItemPage(props);
  if (!loaded) notFound();
  const { tenant, item } = loaded;

  const categoryId = typeof item.category === 'string' ? item.category : item.category.id;

  const [category, attributes, offers, comments, currentUser] = await Promise.all([
    getCategoryById(categoryId),
    getItemAttributes(item.id),
    getOffersForItem(item.id),
    listCommentsForItem(item.id),
    getCurrentDirectusUser(),
  ]);

  const definitions = category
    ? await getAttributeDefinitionsForCategory(tenant.id, category.id)
    : [];
  const userVote = currentUser ? await getUserVote(item.id, currentUser.id) : null;

  const segments: BreadcrumbSegment[] = category
    ? category.path.split('/').map((_, index, parts) => {
        const path = parts.slice(0, index + 1).join('/');
        return { name: index === parts.length - 1 ? category.name : (parts[index] ?? ''), path };
      })
    : [];

  const retailerNameById = new Map<string, string>();
  for (const offer of offers) {
    if (typeof offer.retailer === 'object') {
      retailerNameById.set((offer.retailer as Retailer).id, (offer.retailer as Retailer).name);
    }
  }

  const image = assetUrl(item.image, 'cover');

  return (
    <div className="space-y-6">
      <ItemJsonLd tenant={tenant} item={item} offers={offers} retailerNameById={retailerNameById} />
      <CategoryBreadcrumb tenantSlug={tenant.slug} segments={segments} />

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <VoteButtons
          tenantSlug={tenant.slug}
          itemId={item.id}
          initialScore={item.vote_score}
          initialUserVote={userVote}
        />

        <div className="space-y-4">
          {image ? (
            <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 768px) 640px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div>
            <h1 className="text-2xl font-bold">{item.title}</h1>
            {item.brand ? <p className="text-muted-foreground">{item.brand}</p> : null}
          </div>

          <AttributeList attributes={attributes} definitions={definitions} />

          <p className="whitespace-pre-wrap leading-relaxed">{item.body}</p>

          <ReportButton tenantSlug={tenant.slug} targetCollection="items" targetId={item.id} />

          <section>
            <h2 className="mb-3 text-lg font-semibold">Where to buy</h2>
            <OfferList offers={offers} tenantSlug={tenant.slug} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Comments ({item.comment_count})</h2>
            <CommentThread tenantSlug={tenant.slug} itemId={item.id} comments={comments} />
          </section>
        </div>
      </div>
    </div>
  );
}
