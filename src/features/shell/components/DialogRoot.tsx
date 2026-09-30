'use client';

import type { ReactNode } from 'react';
import { useAppStore } from '@/shared/store';
import { DialogShell } from '@/shared/ui';
import { AuthDialog } from '@/features/auth';
import { SessionDialog, TrailerDialog, PartnerDialog } from '@/features/movies';
import { PricesDialog } from '@/features/cinemas';
import { AccountHubDialog } from '@/features/account';
import {
  LocationDialog,
  ConsentDialog,
  MenuDialog,
  NowDialog,
  SearchDialog,
} from '../dialogs';
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
  partner: 'Simulação de encaminhamento',
  'account-hub': 'Conta neste hub',
};

export function DialogRoot() {
  const dialog = useAppStore((s) => s.dialog);
  const closeDialog = useAppStore((s) => s.closeDialog);

  if (!dialog) return null;
  const props = dialog.props || {};

  let content: ReactNode = null;
  switch (dialog.id) {
    case 'auth':
      content = <AuthDialog signup={!!props.signup} />;
      break;
    case 'session':
      content = <SessionDialog sessionId={props.sessionId as string} />;
      break;
    case 'trailer':
      content = <TrailerDialog movieId={props.movieId as string} />;
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
      content = <SearchDialog scope={props.scope as string | undefined} />;
      break;
    case 'prices':
      content = <PricesDialog cinemaId={props.cinemaId as string} />;
      break;
    case 'partner':
      content = <PartnerDialog seller={props.seller as string} />;
      break;
    case 'account-hub':
      content = <AccountHubDialog scope={props.scope as string} />;
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
      {content}
    </DialogShell>
  );
}
