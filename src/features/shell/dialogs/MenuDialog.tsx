'use client';

import { usePathname } from 'next/navigation';
import { useAppStore } from '@/shared/store';
import { NAV, SECONDARY_NAV, pathFor } from '../lib/nav';
import { activeRootFromPath } from '@/shared/lib/route';
import { useAccountAction, Avatar } from '@/features/account';
import { TextLink, Icon } from '@/shared/ui';

/** Shared look of the links and buttons in the secondary (lower) menu list. */
const SECONDARY_ITEM_CLASS =
  'min-h-[46px] flex items-center text-left border-0 bg-transparent text-muted px-3 rounded-[10px] text-sm';

export function MenuDialog() {
  const logged = useAppStore((s) => s.logged());
  const profile = useAppStore((s) => s.profile());
  const location = useAppStore((s) => s.location);
  const openDialog = useAppStore((s) => s.openDialog);
  const logout = useAppStore((s) => s.logout);
  const pathname = usePathname();
  const activeRoot = activeRootFromPath(pathname);
  const accountAction = useAccountAction();

  return (
    <div>
      <div className="flex items-center gap-3 pt-7.5 pb-4.5">
        <Avatar size="large" />
        <div>
          <strong className="block">
            {logged ? profile!.name : 'Sua Grozze'}
          </strong>
          <TextLink onClick={accountAction}>
            {logged ? 'Abrir minha conta' : 'Entrar ou criar conta'}
          </TextLink>
        </div>
      </div>
      <nav className="grid gap-1">
        {NAV.map(([root, label]) => (
          <a
            key={root}
            href={pathFor(root)}
            aria-current={activeRoot === root ? 'page' : undefined}
            className="min-h-[46px] flex items-center text-left border-0 bg-transparent text-[#cad5cc] px-3 rounded-[10px] text-[17px] aria-[current=page]:text-lime aria-[current=page]:bg-lime-soft"
          >
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => openDialog('location')}
          className="min-h-[46px] flex items-center gap-2 text-left border-0 bg-transparent text-[#cad5cc] px-3 rounded-[10px] text-[17px]"
        >
          <Icon name="pin" className="w-[18px] h-[18px]" /> {location.label}
        </button>
      </nav>
      <nav className="grid gap-1 border-t border-line mt-5 pt-3.5">
        {SECONDARY_NAV.map(([root, label]) => (
          <a key={root} href={pathFor(root)} className={SECONDARY_ITEM_CLASS}>
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => openDialog('consent')}
          className={SECONDARY_ITEM_CLASS}
        >
          Preferências de cookies
        </button>
        {logged && (
          <button
            type="button"
            onClick={logout}
            className={SECONDARY_ITEM_CLASS}
          >
            Sair
          </button>
        )}
      </nav>
    </div>
  );
}
