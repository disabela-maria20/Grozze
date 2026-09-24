import { useAppStore } from "../../lib/store";
import { scopeFromPath, usePathname } from "../../lib/useRoute";
import { useAccountAction } from "../../lib/useAccountAction";
import { Icon } from "./Icon";
import gIcon from "../../assets/g.png";

export function BottomNav() {
  const pathname = usePathname();
  const scope = scopeFromPath(pathname);
  const root = pathname.replace(/^\/+/, "").split("/")[0] || "inicio";
  const openDialog = useAppStore((s) => s.openDialog);
  const accountAction = useAccountAction();

  if (scope) return null;

  const sessionsActive = ["filme", "filmes", "cinema", "cinemas"].includes(root);

  return (
    <nav
      id="bottom-nav"
      className="hidden max-sm:flex fixed bottom-0 left-0 right-0 z-[70] justify-around items-center min-h-[67px] px-2 pt-2.5 pb-[calc(9px+env(safe-area-inset-bottom))] bg-bg/[0.97] border-t border-line backdrop-blur-2xl"
      aria-label="Atalhos mobile"
    >
      <a href="/" aria-current={root === "inicio" ? "page" : undefined} className="flex flex-col items-center gap-0.5 flex-1 text-[#aab6ab] text-[10px] min-h-11 justify-center aria-[current=page]:text-lime">
        <img src={gIcon.src} alt="" className={`w-6 h-[29px] object-contain ${root === "inicio" ? "" : "grayscale opacity-75"}`} />
        <span>Início</span>
      </a>
      <a href="/filmes" aria-current={sessionsActive ? "page" : undefined} className="flex flex-col items-center gap-0.5 flex-1 text-[#aab6ab] text-[10px] min-h-11 justify-center aria-[current=page]:text-lime">
        <Icon name="ticket" className="w-[25px] h-[25px]" />
        <span>Sessões</span>
      </a>
      <button type="button" onClick={() => openDialog("search")} className="flex flex-col items-center gap-0.5 flex-1 border-0 bg-transparent text-[#aab6ab] text-[10px] min-h-11 justify-center">
        <Icon name="search" className="w-[25px] h-[25px]" />
        <span>Buscar</span>
      </button>
      <button
        type="button"
        onClick={accountAction}
        aria-current={root === "minha-grozze" ? "page" : undefined}
        className="flex flex-col items-center gap-0.5 flex-1 border-0 bg-transparent text-[#aab6ab] text-[10px] min-h-11 justify-center aria-[current=page]:text-lime"
      >
        <Icon name="heart" className="w-[25px] h-[25px]" />
        <span>Minha lista</span>
      </button>
    </nav>
  );
}
