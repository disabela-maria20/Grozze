import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

const INERT_SELECTOR = "#site-header, main, #site-footer, #bottom-nav, #movie-sticky, #consent-root";

export function DialogShell({
  onClose,
  label,
  wide = false,
  video = false,
  menu = false,
  children,
}: {
  onClose: () => void;
  label: string;
  wide?: boolean;
  video?: boolean;
  menu?: boolean;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("has-overlay");
    const inertTargets = document.querySelectorAll<HTMLElement>(INERT_SELECTOR);
    inertTargets.forEach((el) => el.setAttribute("inert", ""));
    const first = dialogRef.current?.querySelector<HTMLElement>(
      "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])",
      );
      if (!focusables.length) return;
      const list = [...focusables];
      const idx = list.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && (idx <= 0 || idx === -1)) {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (!e.shiftKey && idx === list.length - 1) {
        e.preventDefault();
        list[0].focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("has-overlay");
      inertTargets.forEach((el) => el.removeAttribute("inert"));
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`overlay fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md max-sm:p-3.5 ${
        menu ? "justify-end p-0 bg-[rgba(2,5,3,.6)] max-sm:items-stretch" : "bg-[rgba(2,5,3,.78)] max-sm:items-center"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={
          menu
            ? "w-[min(350px,88vw)] h-dvh max-h-none overflow-auto rounded-l-[24px] border-l border-line p-7 pt-0 bg-surface animate-drawer-in max-sm:w-[min(330px,89vw)] max-sm:rounded-l-[20px] max-sm:p-5.5"
            : `relative w-full ${wide ? "max-w-[960px]" : video ? "max-w-[1000px]" : "max-w-[590px]"} max-h-[calc(100dvh-48px)] overflow-auto overscroll-contain rounded-[25px] bg-surface border border-white/[0.13] shadow-[0_28px_110px_#0009] ${
                video ? "p-4 pt-[62px]" : "p-7.5"
              } max-sm:rounded-[22px] max-sm:p-5 max-sm:max-h-[calc(100dvh-28px)]`
        }
      >
        {!menu && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="close-btn absolute right-4 top-4 bg-[#162019] text-white w-9 h-9 border border-line rounded-full grid place-items-center hover:border-lime/40 transition-colors"
          >
            <Icon name="close" className="w-[18px] h-[18px]" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
