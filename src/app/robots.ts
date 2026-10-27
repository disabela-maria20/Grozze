import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/lib/seo';

/** Account, login and CMS pages stay out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/minha-grozze/',
        '/entrar/',
        '/cadastro/',
        '/esqueci-senha/',
        '/redefinir-senha/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
