import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

/** Shared OG image template — a simple branded card. Kept deliberately plain: next/og's JSX subset doesn't support most CSS. */
export function renderOgImage(title: string, subtitle?: string) {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 28, color: '#94a3b8', display: 'flex', marginBottom: 24 }}>
        BucketBoard
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, display: 'flex', lineHeight: 1.15 }}>
        {title}
      </div>
      {subtitle ? (
        <div style={{ fontSize: 32, color: '#cbd5e1', display: 'flex', marginTop: 24 }}>
          {subtitle}
        </div>
      ) : null}
    </div>,
    { ...ogSize },
  );
}
