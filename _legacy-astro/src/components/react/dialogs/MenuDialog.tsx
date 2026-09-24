import { useAppStore } from "../../../lib/store";
import { NAV, SECONDARY_NAV, pathFor } from "../../../lib/nav";
import { activeRootFromPath, usePathname } from "../../../lib/useRoute";
import { useAccountAction } from "../../../lib/useAccountAction";
import { Avatar } from "../Avatar";
import { TextLink } from "../ui";
import { Icon } from "../Icon";

export function MenuDialog() {
  const logged = useAppStore((s) => s.logged());
  const profile = useAppStore((s) => s.profile());
  const location = useAppStore((s) => s.location);
  const openDialog = useAppStore((s) => s.openDialog);
  const logout = useAppStore((s) => s.logout);
  const pathname = usePathname();
  const active = activeRootFromPath(pathname);
  const accountAction = useAccountAction();

  return (
    <div>
      <div className="flex items-center gap-3 pt-7.5 pb-4.5">
        <Avatar size="large" />
        <div>
          <strong className="block">{logged ? profile!.name : "Sua Grozze"}</strong>
          <TextLink onClick={accountAction}>{logged ? "Abrir minha conta" : "Entrar ou criar conta"}</TextLink>
        </div>
      </div>
      <nav className="grid gap-1">
        {NAV.map(([p, l]) => (
          <a
            key={p}
            href={pathFor(p)}
            aria-current={active === p ? "page" : undefined}
            className="min-h-[46px] flex items-center text-left border-0 bg-transparent text-[#cad5cc] px-3 rounded-[10px] text-[17px] aria-[current=page]:text-lime aria-[current=page]:bg-lime-soft"
          >
            {l}
          </a>
        ))}
        <button
          type="button"
          onClick={() => openDialog("location")}
          className="min-h-[46px] flex items-center gap-2 text-left border-0 bg-transparent text-[#cad5cc] px-3 rounded-[10px] text-[17px]"
        >
          <Icon name="pin" className="w-[18px] h-[18px]" /> {location.label}
        </button>
      </nav>
      <nav className="grid gap-1 border-t border-line mt-5 pt-3.5">
        {SECONDARY_NAV.map(([p, l]) => (
          <a key={p} href={pathFor(p)} className="min-h-[46px] flex items-center text-left border-0 bg-transparent text-muted px-3 rounded-[10px] text-sm">
            {l}
          </a>
        ))}
        <button
          type="button"
          onClick={() => openDialog("consent")}
          className="min-h-[46px] flex items-center text-left border-0 bg-transparent text-muted px-3 rounded-[10px] text-sm"
        >
          Preferências de cookies
        </button>
        {logged && (
          <button type="button" onClick={logout} className="min-h-[46px] flex items-center text-left border-0 bg-transparent text-muted px-3 rounded-[10px] text-sm">
            Sair
          </button>
        )}
      </nav>
    </div>
  );
}
