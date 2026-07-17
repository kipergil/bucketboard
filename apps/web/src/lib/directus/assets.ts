// Strip any trailing slash so callers can set NEXT_PUBLIC_DIRECTUS_URL with
// or without one (e.g. "https://host.example.com/") without producing a
// double slash when concatenated with "/assets/..." below — a malformed
// path Directus's asset endpoint 404s on.
const DIRECTUS_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_DIRECTUS_URL ??
  process.env.DIRECTUS_URL ??
  ''
).replace(/\/+$/, '');

export interface AssetOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  quality?: number;
}

const PRESETS: Record<'thumb' | 'card' | 'cover' | 'avatar', AssetOptions> = {
  thumb: { width: 160, height: 160, fit: 'cover', quality: 75 },
  card: { width: 480, height: 360, fit: 'cover', quality: 80 },
  cover: { width: 1200, height: 630, fit: 'cover', quality: 80 },
  avatar: { width: 96, height: 96, fit: 'cover', quality: 80 },
};

/** Builds a Directus on-the-fly asset transform URL for a file id. */
export function assetUrl(
  fileId: string | null | undefined,
  preset: keyof typeof PRESETS | AssetOptions = 'card',
): string | null {
  if (!fileId) return null;
  const options = typeof preset === 'string' ? PRESETS[preset] : preset;
  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.fit) params.set('fit', options.fit);
  params.set('quality', String(options.quality ?? 80));
  return `${DIRECTUS_PUBLIC_URL}/assets/${fileId}?${params.toString()}`;
}
