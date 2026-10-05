import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui';
import { ForgotPasswordApp } from '@/features/auth';

export const metadata: Metadata = { title: 'Esqueci minha senha' };

export default function Page() {
  return (
    <ClientOnly>
      <ForgotPasswordApp />
    </ClientOnly>
  );
}
