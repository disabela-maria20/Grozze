'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/shared/store';
import { FilmLoader } from '@/shared/ui';
import { AuthCardPage } from './AuthCardPage';
import { AuthDialog } from './AuthDialog';

export function LoginPageApp({ signup }: { signup: boolean }) {
  const authStatus = useAppStore((s) => s.authStatus);
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'authenticated') router.replace('/minha-grozze');
  }, [authStatus, router]);

  if (authStatus === 'authenticated') return null;

  if (authStatus === 'loading') {
    return (
      <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
        <FilmLoader label="Carregando sua conta" />
      </div>
    );
  }

  return (
    <AuthCardPage>
      <AuthDialog signup={signup} />
    </AuthCardPage>
  );
}
