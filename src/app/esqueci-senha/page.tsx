import type { Metadata } from 'next';
import { privatePage } from '@/shared/lib/seo';
import { ClientOnly } from '@/shared/ui';
import { ForgotPasswordApp } from '@/features/auth';

export const metadata: Metadata = privatePage(
  'Esqueci minha senha',
  '/esqueci-senha'
);

export default function Page() {
  return (
    <ClientOnly>
      <ForgotPasswordApp />
    </ClientOnly>
  );
}
