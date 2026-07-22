import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { directusAdminItemUrl } from '@/lib/directus/assets';

/** Opens this record directly in the Directus admin app — shown only to tenant owners/admins. */
export function DirectusEditLink({ collection, itemId }: { collection: string; itemId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      render={
        <Link
          href={directusAdminItemUrl(collection, itemId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Pencil data-icon="inline-start" />
          Edit in Directus
        </Link>
      }
    />
  );
}
