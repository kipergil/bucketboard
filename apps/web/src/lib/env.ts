import { z } from 'zod';

const serverEnvSchema = z.object({
  DIRECTUS_URL: z.string().url(),
  DIRECTUS_SERVICE_TOKEN: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_DIRECTUS_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_TENANT_SLUG: z.string().default('supermarket'),
  ENRICHMENT_LLM_API_KEY: z.string().optional(),
  ENRICHMENT_LLM_MODEL: z.string().default('claude-opus-4-8'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/** Validated server-only environment. Call only from server code (never a Client Component). */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  cached = serverEnvSchema.parse({
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    DIRECTUS_SERVICE_TOKEN: process.env.DIRECTUS_SERVICE_TOKEN,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DEFAULT_TENANT_SLUG: process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG,
    ENRICHMENT_LLM_API_KEY: process.env.ENRICHMENT_LLM_API_KEY,
    ENRICHMENT_LLM_MODEL: process.env.ENRICHMENT_LLM_MODEL,
  });
  return cached;
}
