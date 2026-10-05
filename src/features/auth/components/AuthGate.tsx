'use client';

import type { ReactNode } from 'react';
import { useAppStore } from '@/shared/store';
import { EmptyState, FilmLoader, LinkButton } from '@/shared/ui';
import { AuthCardPage } from './AuthCardPage';
import { AuthDialog } from './AuthDialog';

/**
 * Shows `children` only to a logged-in user (with `requiredRole`, when given). While
 * the session is being restored it shows a loader instead of flashing the
 * login form; logged out, the login form; wrong role, a restricted notice.
 */
export function AuthGate({
  requiredRole,
  children,
}: {
  requiredRole?: 'admin';
  children: ReactNode;
}) {
  const authStatus = useAppStore((s) => s.authStatus);
  const userRole = useAppStore((s) => s.account?.role);

  if (authStatus === 'loading') {
    return (
      <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
        <FilmLoader label="Carregando sua conta" />
      </div>
    );
  }

  if (authStatus === 'guest') {
    return (
      <AuthCardPage>
        <AuthDialog signup={false} />
      </AuthCardPage>
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
        <div className="w-[min(1220px,530px)] max-sm:w-[calc(100%-32px)] mx-auto">
          <EmptyState title="Acesso restrito">
            <p className="mb-4">
              Esta área é só para administradores da Grozze.
            </p>
            <LinkButton href="/">Voltar ao início</LinkButton>
          </EmptyState>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
