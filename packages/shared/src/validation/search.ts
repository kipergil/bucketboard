import { z } from 'zod';

export const itemSortSchema = z.enum([
  'top_all',
  'top_month',
  'top_week',
  'new',
  'name_asc',
  'name_desc',
]);
export type ItemSort = z.infer<typeof itemSortSchema>;

export const retailerSortSchema = z.enum(['votes', 'new', 'name_asc', 'name_desc']);
export type RetailerSort = z.infer<typeof retailerSortSchema>;

export const categoryFacetFilterSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

export const categoryQuerySchema = z.object({
  sort: itemSortSchema.default('top_all'),
  retailer: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  facets: categoryFacetFilterSchema.optional(),
});
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  category: z.string().optional(),
  retailer: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const storeDirectoryQuerySchema = z.object({
  tag: z.string().optional(),
  city: z.string().optional(),
  openNow: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
});
export type StoreDirectoryQuery = z.infer<typeof storeDirectoryQuerySchema>;

export const retailerDirectoryQuerySchema = z.object({
  type: z.string().optional(),
  kind: z.string().optional(),
  tag: z.string().optional(),
  country: z.string().optional(),
  sort: retailerSortSchema.default('votes'),
  page: z.coerce.number().int().min(1).default(1),
});
export type RetailerDirectoryQuery = z.infer<typeof retailerDirectoryQuerySchema>;
