import Link from 'next/link';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

export function CategoryBreadcrumb({
  tenantSlug,
  segments,
}: {
  tenantSlug: string;
  segments: BreadcrumbSegment[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href={`/t/${tenantSlug}`}>Home</Link>} />
        </BreadcrumbItem>
        {segments.map((segment, index) => (
          <Fragment key={segment.path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === segments.length - 1 ? (
                <BreadcrumbPage>{segment.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  render={<Link href={`/t/${tenantSlug}/c/${segment.path}`}>{segment.name}</Link>}
                />
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
