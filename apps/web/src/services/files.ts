import 'server-only';
import { uploadFiles, importFile } from '@directus/sdk';
import { getServiceDirectusClient } from '../lib/directus/client';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export class InvalidUploadError extends Error {}

/** Server-side type/size validation + upload to Directus Files. Client-side compression happens before this is called. */
export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new InvalidUploadError('Only JPEG, PNG, WEBP, or GIF images are allowed.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new InvalidUploadError('Image must be under 8MB.');
  }

  const client = getServiceDirectusClient();
  const formData = new FormData();
  formData.append('file', file);
  const uploaded = await client.request(uploadFiles(formData, { fields: ['id'] }));
  return uploaded.id;
}

/** Imports a remote image (e.g. discovered by the quick-add AI flow) directly into Directus Files, server-side. */
export async function importImageFromUrl(url: string): Promise<string> {
  const client = getServiceDirectusClient();
  const imported = await client.request(importFile(url, {}, { fields: ['id'] }));
  return (imported as { id: string }).id;
}
