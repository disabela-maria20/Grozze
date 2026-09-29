import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/features/shell';

export const metadata: Metadata = {
  title: {
    default: 'Grozze | V1 RC2',
    template: '%s · Grozze',
  },
  description: 'Filmes, cinemas e sessões para decidir mais rápido.',
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
