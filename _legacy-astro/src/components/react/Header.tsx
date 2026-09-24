import { useEffect, useState } from "react";
import { useAppStore } from "../../lib/store";
import { NAV, pathFor } from "../../lib/nav";
import { activeRootFromPath, scopeFromPath, usePathname } from "../../lib/useRoute";
import { useAccountAction } from "../../lib/useAccountAction";
import { DISTRIBUTORS } from "../../lib/catalog";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import logo from "../../assets/logo.png";

export function Header() {
  const pathname = usePathname();
  const scope = scopeFromPath(pathname);
  const active = activeRootFromPath(pathname);
  const logged = useAppStore((s) => s.logged());
  const profile = useAppStore((s) => s.profile());
  const location = useAppStore((s) => s.location);
  const openDialog = useAppStore((s) => s.openDialog);
  const accountAction = useAccountAction();
  const hasHero = useAppStore((s) => s.hasHero);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-hub", !!scope);
  }, [scope]);

  const hub = scope ? DISTRIBUTORS.find((d) => d.slug === scope) : null;

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 h-[84px] max-sm:h-[76px] border-b backdrop-blur-2xl transition-colors ${
        scrolled || !hasHero
          ? "bg-bg/[0.93] border-line"
          : "bg-gradient-to-b from-bg/[0.68] to-transparent border-transparent backdrop-blur-none"
      }`}
    >
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto h-full flex items-center gap-7 max-sm:gap-2.5">
        {scope ? (
          <>
            <span className="text-[22px] font-extrabold tracking-tight">{hub?.name || "Distribuidora"}</span>
            <span className="text-[10px] text-muted flex items-center gap-2">
              Com tecnologia <img src={logo.src} alt="Grozze" className="w-[63px]" />
            </span>
          </>
        ) : (
          <>
            <a className="shrink-0 leading-none" href="/" aria-label="Grozze, início">
              <img src={logo.src} alt="grozze." className="w-[156px] max-sm:w-[130px] h-auto" />
            </a>
            <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
              {NAV.map(([p, l]) => (
                <a
                  key={p}
                  href={pathFor(p)}
                  aria-current={active === p ? "page" : undefined}
                  className="text-[15px] font-semibold text-[#b9c2bb] py-3.5 whitespace-nowrap relative aria-[current=page]:text-lime hover:text-lime transition-colors"
                >
                  {l}
                </a>
              ))}
            </nav>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => openDialog("location")}
            aria-label="Definir localização"
            className="tool min-w-11 h-11 border border-line bg-[#080d0a]/45 rounded-full inline-flex items-center justify-center px-3.5 gap-2 text-[13px] hover:border-lime/40 transition-colors max-sm:w-[35px] max-sm:min-w-[35px] max-sm:border-transparent max-sm:px-0"
          >
            <span className="w-2 h-2 rounded-full bg-lime shadow-[0_0_0_4px_var(--color-lime-soft)] max-sm:hidden" />
            <Icon name="pin" className="max-sm:w-5 max-sm:h-5" />
            <span className="max-[1160px]:hidden max-sm:hidden">{location.label || "São Paulo, SP"}</span>
          </button>
          {!scope && (
            <button
              type="button"
              onClick={() => openDialog("search")}
              aria-label="Buscar"
              className="tool min-w-11 h-11 border border-line bg-[#080d0a]/45 rounded-full inline-flex items-center justify-center hover:border-lime/40 transition-colors max-sm:hidden"
            >
              <Icon name="search" />
            </button>
          )}
          <button
            type="button"
            onClick={accountAction}
            aria-label={logged ? `Abrir conta de ${profile!.name}` : "Entrar"}
            className="tool h-11 border border-line bg-[#080d0a]/45 rounded-full inline-flex items-center px-3.5 gap-2 text-[13px] hover:border-lime/40 transition-colors max-sm:px-0 max-sm:border-0 max-sm:bg-transparent"
          >
            <Avatar />
            <span className="max-[1160px]:hidden max-sm:hidden">{logged ? profile!.name.split(" ")[0] : "Entrar"}</span>
          </button>
          {!scope && (
            <button
              type="button"
              onClick={() => openDialog("menu")}
              aria-label="Abrir menu"
              aria-expanded="false"
              className="tool min-w-11 h-11 border border-line bg-[#080d0a]/45 rounded-full hidden max-md:inline-flex items-center justify-center hover:border-lime/40 transition-colors"
            >
              <Icon name="menu" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
