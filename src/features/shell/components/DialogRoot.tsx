'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/shared/store';
import { CatalogGate, DialogShell } from '@/shared/ui';
import { AuthDialog } from '@/features/auth';
import { SessionDialog, TrailerDialog } from '@/features/movies';
import { PricesDialog } from '@/features/cinemas';
import { AccountHubDialog } from '@/features/account';
import {
  LocationDialog,
  ConsentDialog,
  MenuDialog,
  NowDialog,
  SearchDialog,
} from '../dialogs';

/** Accessible name of each dialog, keyed by dialog id. */
const LABELS: Record<string, string> = {
  auth: 'Entrar',
  session: 'Confirmação da sessão',
  trailer: 'Trailer',
  location: 'Localização',
  consent: 'Preferências de cookies',
  menu: 'Menu principal',
  now: 'Começando agora',
  search: 'Buscar',
  prices: 'Preços',
  'account-hub': 'Conta neste hub',
};

/** Dialogs that don't read the catalog open without waiting for the API. */
const CATALOG_FREE = new Set(['location', 'consent', 'menu']);

export function DialogRoot() {
  const dialog = useAppStore((s) => s.dialog);
  const closeDialog = useAppStore((s) => s.closeDialog);
  const pathname = usePathname();

  // Navigation no longer reloads the page, so a link inside a dialog (menu,
  // search...) must close it; the login dialog keeps a pending favorite
  useEffect(() => {
    useAppStore.getState().closeDialog({ keepPending: true });
  }, [pathname]);

  if (!dialog) return null;
  const dialogProps = dialog.props || {};

  let content: ReactNode = null;
  switch (dialog.id) {
    case 'auth':
      content = <AuthDialog signup={!!dialogProps.signup} />;
      break;
    case 'session':
      content = <SessionDialog sessionId={dialogProps.sessionId as string} />;
      break;
    case 'trailer':
      content = <TrailerDialog movieId={dialogProps.movieId as string} />;
      break;
    case 'location':
      content = <LocationDialog />;
      break;
    case 'consent':
      content = <ConsentDialog />;
      break;
    case 'menu':
      content = <MenuDialog />;
      break;
    case 'now':
      content = <NowDialog />;
      break;
    case 'search':
      content = (
        <SearchDialog scope={dialogProps.scope as string | undefined} />
      );
      break;
    case 'prices':
      content = <PricesDialog cinemaId={dialogProps.cinemaId as string} />;
      break;
    case 'account-hub':
      content = <AccountHubDialog scope={dialogProps.scope as string} />;
      break;
    default:
      return null;
  }

  return (
    <DialogShell
      onClose={() => closeDialog()}
      label={LABELS[dialog.id] || 'Diálogo'}
      wide={dialog.id === 'now'}
      video={dialog.id === 'trailer'}
      menu={dialog.id === 'menu'}
    >
      {CATALOG_FREE.has(dialog.id) ? (
        content
      ) : (
        <CatalogGate compact>{content}</CatalogGate>
      )}
    </DialogShell>
  );
}
