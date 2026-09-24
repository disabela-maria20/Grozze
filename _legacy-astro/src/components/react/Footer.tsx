import { useAppStore } from "../../lib/store";
import { scopeFromPath, usePathname } from "../../lib/useRoute";
import { DISTRIBUTORS } from "../../lib/catalog";
import logo from "../../assets/logo.png";

const GROUPS: [string, [string, string][]][] = [
  [
    "Descobrir",
    [
      ["filmes", "Filmes"],
      ["cinemas", "Cinemas"],
      ["em-breve", "Em breve"],
      ["noticias", "Notícias"],
    ],
  ],
  [
    "Grozze",
    [
      ["sobre", "Sobre"],
      ["faq", "Perguntas frequentes"],
      ["contato", "Contato"],
      ["privacidade", "Privacidade"],
      ["termos", "Termos de uso"],
    ],
  ],
  [
    "Sua conta",
    [
      ["minha-grozze", "Minha Grozze"],
      ["minha-grozze/salvos", "Filmes salvos"],
      ["minha-grozze/cinemas", "Cinemas favoritos"],
      ["minha-grozze/preferencias", "Preferências"],
      ["newsletter", "Newsletter"],
    ],
  ],
];

export function Footer() {
  const pathname = usePathname();
  const scope = scopeFromPath(pathname);
  const openDialog = useAppStore((s) => s.openDialog);

  if (scope) {
    const d = DISTRIBUTORS.find((x) => x.slug === scope);
    return (
      <footer id="site-footer" className="py-5.5 text-center text-faint text-xs border-t border-line">
        <div className="w-[min(1220px,calc(100%-56px))] mx-auto">
          Grozze · {d?.name || ""}{" "}
          <button type="button" className="text-faint hover:text-lime" onClick={() => openDialog("consent")}>
            Privacidade e cookies
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer id="site-footer" className="border-t border-line pt-9 pb-5 bg-[#070b08] pb-[calc(85px+env(safe-area-inset-bottom))] sm:pb-5">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] max-md:grid-cols-[1.1fr_1fr_1fr] max-sm:grid-cols-2 gap-9 max-md:gap-6 max-sm:gap-5">
          <div className="max-sm:hidden">
            <a href="/">
              <img src={logo.src} alt="grozze." className="w-[140px]" />
            </a>
            <p className="text-[13px] leading-relaxed text-muted max-w-[230px] mt-3">Filmes, cinemas e sessões para decidir mais rápido.</p>
          </div>
          {GROUPS.map(([label, links]) => (
            <div key={label}>
              <strong className="block text-[11px] uppercase tracking-[0.12em] text-[#c9d5cb] mb-3.5">{label}</strong>
              {links.map(([p, l]) => (
                <a key={p} href={`/${p}`} className="block py-1 text-[13px] text-muted hover:text-lime transition-colors">
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-4.5 mt-7 text-faint text-[11px] max-sm:flex-col max-sm:gap-1.5">
          <span>© 2026 Grozze.</span>
          <button type="button" className="text-faint hover:text-lime" onClick={() => openDialog("snapshot")}>
            Ambiente de homologação · agenda de setembro/2026
          </button>
          <button type="button" className="text-faint hover:text-lime" onClick={() => openDialog("consent")}>
            Preferências de cookies
          </button>
        </div>
      </div>
    </footer>
  );
}
