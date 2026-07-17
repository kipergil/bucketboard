import { readFiles, uploadFiles } from '@directus/sdk';
import type { AdminClient } from '../lib/client.js';

const PALETTE = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#4b5563',
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length] as string;
}

function wrapLabel(label: string, maxCharsPerLine: number): string[] {
  const words = label.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

/** A simple, dependency-free SVG placeholder — a colour block with a label, used for seed data. */
function buildPlaceholderSvg(label: string, width: number, height: number): string {
  const bg = colorFor(label);
  const lines = wrapLabel(label, 18);
  const lineHeight = Math.round(height * 0.11);
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  const text = lines
    .map(
      (line, i) =>
        `<text x="50%" y="${startY + i * lineHeight}" font-family="system-ui, sans-serif" font-size="${Math.round(height * 0.09)}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${escapeXml(line)}</text>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bg}"/>${text}</svg>`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Uploads (or reuses) a generated SVG placeholder image for seed data.
 * Idempotent: looks up an existing file by title before uploading again.
 */
export async function ensurePlaceholderImage(
  client: AdminClient,
  label: string,
  opts: { width?: number; height?: number } = {},
): Promise<string> {
  const title = `Placeholder: ${label}`;
  const existing = await client.request(
    readFiles({ filter: { title: { _eq: title } }, fields: ['id'], limit: 1 }),
  );
  if (existing[0]) return existing[0].id;

  const svg = buildPlaceholderSvg(label, opts.width ?? 800, opts.height ?? 600);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', blob, `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`);

  const file = await client.request(uploadFiles(formData, { fields: ['id'] }));
  return file.id;
}
