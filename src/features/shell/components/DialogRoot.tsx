'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/shared/store';
import { CatalogGate } from '@/entities/catalog';
import { DialogShell } from './DialogShell';
import { AuthDialog } from '@/features/auth';
import { SessionDialog, TrailerDialog } from '@/features/movies';
import { PricesDialog } from '@/features/cinemas';
import { AccountHubDialog } from '@/features/account';
import {
  LocationDialog,
  ConsentDialog,
  MenuDialog,
  NearbyCitiesDialog,
  NowDialog,
  SearchDialog,
} from '../dialogs';

/** Accessible name of each dialog, keyed by dialog id. */
const LABELS: Record<string, string> = {
  auth: 'Entrar',
  session: 'Confirmação da sessão',
  trailer: 'Trailer',
  location: 'Localização',
  'nearby-cities': 'Cidades próximas',
  consent: 'Preferências de cookies',
  menu: 'Menu principal',
  now: 'Começando agora',
  search: 'Buscar',
  prices: 'Preços',
  'account-hub': 'Conta neste hub',
};

/** Length of the exit animations (`animate-*-out` in globals.css). */
const DIALOG_EXIT_MS = 200;

/** Dialogs that don't read the catalog open without waiting for the API. */
const CATALOG_FREE = new Set(['consent', 'menu']);

export function DialogRoot() {
  const dialog = useAppStore((s) => s.dialog);
  const closeDialog = useAppStore((s) => s.closeDialog);
  const pathname = usePathname();

  // The dialog on screen: the open one, or the one just closed while its
  // exit animation plays (however it was closed: button, Escape, a store
  // action). Updated during render, React's way of deriving from a prop.
  const [shown, setShown] = useState(dialog);
  if (dialog && dialog !== shown) setShown(dialog);
  const closing = !dialog && !!shown;
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => setShown(null), DIALOG_EXIT_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  // Navigation no longer reloads the page, so a link inside a dialog (menu,
  // search...) must close it; the login dialog keeps a pending favorite.
  // Only on an actual route change: not on mount, where it would close a
  // dialog opened by another component (the first-visit location question)
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    useAppStore.getState().closeDialog({ keepPending: true });
  }, [pathname]);

  if (!shown) return null;
  const dialogProps = shown.props || {};

  let content: ReactNode = null;
  switch (shown.id) {
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
    case 'nearby-cities':
      content = <NearbyCitiesDialog />;
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
      label={LABELS[shown.id] || 'Diálogo'}
      wide={shown.id === 'now'}
      video={shown.id === 'trailer'}
      menu={shown.id === 'menu'}
      closing={closing}
    >
      {CATALOG_FREE.has(shown.id) ? (
        content
      ) : (
        <CatalogGate compact>{content}</CatalogGate>
      )}
    </DialogShell>
  );
}
