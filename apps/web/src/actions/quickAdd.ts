'use server';

import Anthropic from '@anthropic-ai/sdk';
import {
  quickAddInputSchema,
  quickAddExtractionSchema,
  type QuickAddExtraction,
} from '@bucketboard/shared';
import { requireCurrentDirectusUser } from '@/lib/auth/current-user';
import { getServerEnv } from '@/lib/env';
import { importImageFromUrl } from '@/services/files';

export interface QuickAddParseActionResult {
  ok: boolean;
  error?: string;
  data?: QuickAddExtraction;
}

const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/i;

/** Best-effort pull of the first link out of a pasted WhatsApp-style message. */
function extractFirstUrl(text: string): string | null {
  return text.match(URL_PATTERN)?.[0] ?? null;
}

/**
 * Hand-written mirror of `quickAddExtractionSchema` as a raw JSON Schema.
 * The SDK's `zodOutputFormat()` helper requires zod's internal v4 core
 * types, which don't line up with this repo's zod 3.24 — a raw schema
 * sidesteps that version coupling entirely.
 */
const QUICK_ADD_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: ['string', 'null'] },
    brand: { type: ['string', 'null'] },
    body: { type: ['string', 'null'] },
    url: { type: ['string', 'null'] },
    imageUrl: { type: ['string', 'null'] },
    price: { type: ['number', 'null'] },
    currency: { type: ['string', 'null'] },
    categoryName: { type: ['string', 'null'] },
  },
  required: ['title', 'brand', 'body', 'url', 'imageUrl', 'price', 'currency', 'categoryName'],
  additionalProperties: false,
} as const;

/**
 * Parses a pasted link (or free text containing one) into item-submission
 * fields. Uses Claude's server-side web_fetch tool so the linked page is
 * fetched and read entirely on Anthropic's infrastructure — this app never
 * downloads or parses third-party HTML itself.
 */
export async function quickAddParseAction(rawText: unknown): Promise<QuickAddParseActionResult> {
  try {
    await requireCurrentDirectusUser();
  } catch {
    return { ok: false, error: 'Sign in to use quick add.' };
  }

  const parsedInput = quickAddInputSchema.safeParse({ text: rawText });
  if (!parsedInput.success) {
    return { ok: false, error: parsedInput.error.issues[0]?.message ?? 'Paste some text first.' };
  }

  const link = extractFirstUrl(parsedInput.data.text);
  if (!link) {
    return { ok: false, error: 'Paste a link (or a message that contains one) to analyze.' };
  }

  const env = getServerEnv();
  if (!env.ENRICHMENT_LLM_API_KEY) {
    return { ok: false, error: 'Quick add is not configured on this deployment.' };
  }

  const client = new Anthropic({ apiKey: env.ENRICHMENT_LLM_API_KEY });

  try {
    const response = await client.messages.create({
      model: env.ENRICHMENT_LLM_MODEL,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: QUICK_ADD_OUTPUT_SCHEMA },
      },
      tools: [{ type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 3 }],
      messages: [
        {
          role: 'user',
          content: [
            'A user pasted the message below (often forwarded from WhatsApp) while submitting a product to a community "favourites" site. It contains a product link and maybe some surrounding commentary.',
            '',
            'Fetch the link and extract what you can about the product being shared:',
            '- title: the product name',
            '- brand: the brand/manufacturer, if identifiable',
            '- body: a short 1-3 sentence neutral description of the product, in your own words',
            '- url: the canonical product page URL',
            '- imageUrl: a direct URL to the primary product image, if one is present on the page',
            '- price and currency (ISO 4217 code, e.g. GBP): if a price is shown',
            '- categoryName: a short general category name for the product (e.g. "Snacks", "Skincare"), if inferable',
            '',
            "Leave any field null rather than guessing if you can't determine it with reasonable confidence. Don't invent facts not present on the page.",
            '',
            '---',
            parsedInput.data.text,
            '---',
          ].join('\n'),
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return { ok: false, error: 'Could not extract details from that link.' };
    }

    let raw: unknown;
    try {
      raw = JSON.parse(textBlock.text);
    } catch {
      return { ok: false, error: 'Could not extract details from that link.' };
    }

    const parsedOutput = quickAddExtractionSchema.safeParse(raw);
    if (!parsedOutput.success) {
      return { ok: false, error: 'Could not extract details from that link.' };
    }

    return { ok: true, data: parsedOutput.data };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return { ok: false, error: 'Could not reach the AI service. Try again shortly.' };
    }
    throw error;
  }
}

export interface QuickAddImageActionResult {
  ok: boolean;
  error?: string;
  fileId?: string;
}

/** Imports an AI-discovered product image URL into Directus as the item's image asset. */
export async function importQuickAddImageAction(
  imageUrl: unknown,
): Promise<QuickAddImageActionResult> {
  try {
    await requireCurrentDirectusUser();
  } catch {
    return { ok: false, error: 'Sign in to use quick add.' };
  }

  if (typeof imageUrl !== 'string' || !URL_PATTERN.test(imageUrl)) {
    return { ok: false, error: 'Invalid image URL.' };
  }

  try {
    const fileId = await importImageFromUrl(imageUrl);
    return { ok: true, fileId };
  } catch {
    return { ok: false, error: 'Could not import the image from that link.' };
  }
}
