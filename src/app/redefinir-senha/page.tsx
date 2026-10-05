import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ClientOnly } from '@/shared/ui';
import { ResetPasswordApp } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Criar nova senha',
  // The URL carries a one-time token: keep it out of search engines and referrers
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Page() {
  return (
    <ClientOnly>
      <Suspense>
        <ResetPasswordApp />
      </Suspense>
    </ClientOnly>
  );
}
