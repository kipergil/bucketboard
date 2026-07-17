import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase, alphanumeric, hyphen-separated');

export const urlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'must be a valid http(s) URL' },
  );

export const currencySchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'must be an ISO 4217 currency code');

export const countrySchema = z
  .string()
  .length(2)
  .regex(/^[A-Z]{2}$/, 'must be an ISO 3166-1 alpha-2 country code');
