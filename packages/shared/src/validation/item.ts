import { z } from 'zod';
import { slugSchema, urlSchema, uuidSchema } from './common';
import type { AttributeType } from '../enums';

export const itemAttributeInputSchema = z.object({
  definitionId: uuidSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable(),
});
export type ItemAttributeInput = z.infer<typeof itemAttributeInputSchema>;

export const shopLinkInputSchema = z.object({
  url: urlSchema,
  retailerId: uuidSchema.nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).nullable().optional(),
});
export type ShopLinkInput = z.infer<typeof shopLinkInputSchema>;

export const submitItemSchema = z.object({
  categoryId: uuidSchema,
  title: z.string().trim().min(2).max(200),
  slug: slugSchema.optional(),
  url: urlSchema.optional(),
  body: z.string().trim().min(10).max(10_000),
  brand: z.string().trim().max(120).optional(),
  imageAssetId: uuidSchema.nullable().optional(),
  attributes: z.array(itemAttributeInputSchema).default([]),
  shopLinks: z.array(shopLinkInputSchema).min(1, 'add at least one place to buy this').max(20),
});
export type SubmitItemInput = z.infer<typeof submitItemSchema>;

export const quickAddInputSchema = z.object({
  text: z.string().trim().min(1).max(4000),
});
export type QuickAddInput = z.infer<typeof quickAddInputSchema>;

/** Shape of the AI-extracted preview for the "paste a link / WhatsApp message" quick-add flow. */
export const quickAddExtractionSchema = z.object({
  title: z.string().max(200).nullable(),
  brand: z.string().max(120).nullable(),
  body: z.string().max(10_000).nullable(),
  url: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.number().nonnegative().nullable(),
  currency: z.string().nullable(),
  categoryName: z.string().nullable(),
});
export type QuickAddExtraction = z.infer<typeof quickAddExtractionSchema>;

export const attributeDefinitionValueSchema = (type: AttributeType) => {
  switch (type) {
    case 'text':
    case 'url':
      return z.string().max(2000);
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'select':
      return z.string();
    case 'multiselect':
      return z.array(z.string());
    case 'date':
      return z
        .string()
        .datetime()
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
  }
};
