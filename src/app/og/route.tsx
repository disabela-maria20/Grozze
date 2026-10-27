import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/** Brand colors (see globals.css) */
const BG = '#050807';
const LIME = '#c8ff39';
const MUTED = '#a0aaa2';

let logo: Promise<string> | null = null;

/** The logo as a data URL, read once per server process. */
function logoDataUrl() {
  logo ??= readFile(join(process.cwd(), 'public', 'logo.png')).then(
    (file) => `data:image/png;base64,${file.toString('base64')}`
  );
  return logo;
}

/**
 * Sharing card (1200×630) for pages without an image of their own: the
 * logo, plus `?title=` and `?subtitle=` when given. Text only, so the query
 * can't inject anything but letters into the picture.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || '').slice(0, 120);
  const subtitle = (
    searchParams.get('subtitle') ||
    (title ? '' : 'Filmes, cinemas e sessões para decidir mais rápido.')
  ).slice(0, 160);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: `radial-gradient(circle at 85% 10%, #1d3a12, ${BG} 60%)`,
        color: '#f6f8f4',
      }}
    >
      <img src={await logoDataUrl()} alt="" width={324} height={90} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {title && (
          <div
            style={{
              fontSize: title.length > 60 ? 58 : 72,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              marginBottom: subtitle ? 24 : 0,
            }}
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div style={{ fontSize: 32, color: MUTED, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        )}
        <div
          style={{
            marginTop: 40,
            width: 120,
            height: 8,
            borderRadius: 8,
            background: LIME,
          }}
        />
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }
  );
}
