import Image, { type ImageProps } from 'next/image';
import { canOptimizeImage } from '@/shared/lib/imageHosts';

/**
 * An image from the APIs (posters, banners, covers). Known hosts go
 * through Next's optimizer (right size, WebP, cache); others load as they
 * are. Give `sizes` so the browser picks the smallest file that fits.
 */
export function RemoteImage({
  src,
  ...props
}: Omit<ImageProps, 'src'> & { src: string }) {
  return <Image src={src} unoptimized={!canOptimizeImage(src)} {...props} />;
}
