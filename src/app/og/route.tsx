import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { canOptimizeImage } from '@/shared/lib/imageHosts';

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
 * The card as a JPEG: as PNG (all `ImageResponse` makes) a photo card weighs
 * ~0.5–1 MB, over what WhatsApp shows; as JPEG ~100 KB. `null` if sharp
 * (installed with Next for its image optimizer) can't load on this server.
 */
async function toJpeg(png: Buffer): Promise<Buffer | null> {
  try {
    const { default: sharp } = await import('sharp');
    return await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } catch {
    return null;
  }
}

/** Posters come at ~3 MB; anything much bigger isn't a catalog image. */
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/** Image type from the file's first bytes: the catalog sends them all as `binary/octet-stream`. */
function sniffImageType(data: Buffer): string | null {
  if (data[0] === 0x89 && data[1] === 0x50) return 'image/png';
  if (data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg';
  return null;
}

/**
 * The `?image=` photo as a data URL, or `null` (the card goes without it)
 * when it's off the allowed hosts, slow, too big or not a PNG/JPEG. The
 * host list keeps the route from fetching anything anyone asks for.
 */
async function photoDataUrl(src: string | null): Promise<string | null> {
  if (!src || !canOptimizeImage(src)) return null;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(6000) });
    if (!res.ok || Number(res.headers.get('content-length')) > MAX_PHOTO_BYTES)
      return null;
    const data = Buffer.from(await res.arrayBuffer());
    const type = data.length <= MAX_PHOTO_BYTES && sniffImageType(data);
    return type ? `data:${type};base64,${data.toString('base64')}` : null;
  } catch {
    return null;
  }
}

/**
 * Sharing card (1200×630) of every page: the logo, plus `?title=` and
 * `?subtitle=` when given, over the `?image=` photo (backdrop, cover) when
 * there is one. Text is rendered as text, so the query can't inject
 * anything but letters into the picture.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || '').slice(0, 120);
  const subtitle = (
    searchParams.get('subtitle') ||
    (title ? '' : 'Filmes, cinemas e sessões para decidir mais rápido.')
  ).slice(0, 160);
  const photo = await photoDataUrl(searchParams.get('image'));

  const card = new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        position: 'relative',
        background: `radial-gradient(circle at 85% 10%, #1d3a12, ${BG} 60%)`,
        color: '#f6f8f4',
      }}
    >
      {photo && (
        <img
          src={photo}
          alt=""
          width={1200}
          height={630}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            objectFit: 'cover',
            objectPosition: 'center 28%',
          }}
        />
      )}
      {photo && (
        // Same shade as the site's hero, so the text stays readable
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            backgroundImage:
              'linear-gradient(to right, rgba(5,8,7,0.94) 0%, rgba(5,8,7,0.7) 45%, rgba(5,8,7,0.15) 85%)',
          }}
        />
      )}
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
    { width: 1200, height: 630 }
  );
  const png = Buffer.from(await card.arrayBuffer());
  const jpeg = await toJpeg(png);
  return new Response(new Uint8Array(jpeg ?? png), {
    headers: {
      'Content-Type': jpeg ? 'image/jpeg' : 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
