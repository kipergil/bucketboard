import { tenancyCollections } from './tenancy.js';
import { taxonomyCollections } from './taxonomy.js';
import { contentCollections } from './content.js';
import { engagementCollections } from './engagement.js';
import { commerceCollections } from './commerce.js';
import type { CollectionDefinition } from '../types.js';

/**
 * Every BucketBoard collection, in dependency order (a collection only
 * relies on ones that appear before it — enforced by the apply script's
 * two-pass create: base fields first, m2o/file relations second, so the
 * exact order here doesn't matter for correctness, only for readability).
 */
export const allCollections: CollectionDefinition[] = [
  ...tenancyCollections,
  ...taxonomyCollections,
  ...contentCollections,
  ...engagementCollections,
  ...commerceCollections,
];
