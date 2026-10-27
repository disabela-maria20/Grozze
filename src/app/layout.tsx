import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/features/shell';
import {
  ogCard,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/shared/lib/seo';

export const metadata: Metadata = {
  // Relative URLs in every page's metadata (images, canonicals) resolve here
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
    images: [ogCard()],
  },
  twitter: { card: 'summary_large_image', images: [ogCard()] },
  formatDetection: { telephone: false, address: false, email: false },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-app-text">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
