import type { NextConfig } from 'next';
import { OPTIMIZED_IMAGE_HOSTS } from './src/shared/lib/imageHosts';

const nextConfig: NextConfig = {
  // output: 'export',
  trailingSlash: true,
  images: {
    // Only these hosts are fetched by the optimizer (see imageHosts.ts)
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
    qualities: [75],
    formats: ['image/webp'],
    // Catalog file names change with the image, so a long cache is safe
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
