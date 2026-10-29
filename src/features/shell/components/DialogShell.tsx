'use client';

import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '@/shared/ui';

/** Page regions made inert (unfocusable, unclickable) while a dialog is open. */
const INERT_SELECTOR =
  '#site-header, main, #site-footer, #bottom-nav, #movie-sticky, #consent-root';

/** Elements that receive initial focus when the dialog opens. */
const INITIAL_FOCUS_SELECTOR =
  "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

/** Enabled elements the Tab key cycles through inside the dialog. */
const FOCUS_TRAP_SELECTOR =
  "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

const MENU_PANEL_CLASS =
  'w-[min(350px,88vw)] h-dvh max-h-none overflow-auto rounded-l-[24px] border-l border-line p-7 pt-0 bg-surface max-sm:w-[min(330px,89vw)] max-sm:rounded-l-[20px] max-sm:p-5.5';

function overlayClass(menu: boolean, closing: boolean) {
  const backdrop = menu
    ? 'justify-end p-0 bg-[rgba(2,5,3,.6)] max-sm:items-stretch'
    : 'bg-[rgba(2,5,3,.78)] max-sm:items-center';
  // A closing dialog lets clicks through to the page right away
  const motion = closing
    ? 'animate-overlay-out pointer-events-none'
    : 'animate-overlay-in';
  return `overlay fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md max-sm:p-3.5 ${backdrop} ${motion}`;
}

function panelMotionClass(menu: boolean, closing: boolean) {
  if (menu) return closing ? 'animate-drawer-out' : 'animate-drawer-in';
  return closing ? 'animate-dialog-out' : 'animate-dialog-in';
}

function modalMaxWidthClass(wide: boolean, video: boolean) {
  if (wide) return 'max-w-[960px]';
  if (video) return 'max-w-[1000px]';
  return 'max-w-[590px]';
}

function modalPanelClass(wide: boolean, video: boolean) {
  const maxWidth = modalMaxWidthClass(wide, video);
  const padding = video ? 'p-4 pt-[62px]' : 'p-7.5';
  return `relative w-full ${maxWidth} max-h-[calc(100dvh-48px)] overflow-auto overscroll-contain rounded-[25px] bg-surface border border-white/[0.13] shadow-[0_28px_110px_#0009] ${padding} max-sm:rounded-[22px] max-sm:p-5 max-sm:max-h-[calc(100dvh-28px)]`;
}

/**
 * Modal container: locks the rest of the page (inert + `has-overlay`),
 * focuses the first control, traps Tab inside and closes on Escape or a
 * backdrop click. `menu` renders a side drawer instead of a centered modal.
 * `closing` plays the exit animation (see DialogRoot); the page is unlocked
 * as soon as it starts, so a link's navigation never meets an inert page.
 */
export function DialogShell({
  onClose,
  label,
  wide = false,
  video = false,
  menu = false,
  closing = false,
  children,
}: {
  onClose: () => void;
  label: string;
  wide?: boolean;
  video?: boolean;
  menu?: boolean;
  closing?: boolean;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Layout effect: the lock is lifted before the browser paints the closing
  // frame (and before a link's navigation restores the scroll)
  useLayoutEffect(() => {
    if (closing) return;
    document.body.classList.add('has-overlay');
    const inertTargets = document.querySelectorAll<HTMLElement>(INERT_SELECTOR);
    inertTargets.forEach((element) => element.setAttribute('inert', ''));
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      INITIAL_FOCUS_SELECTOR
    );
    firstFocusable?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables =
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUS_TRAP_SELECTOR);
      if (!focusables.length) return;
      const focusableList = [...focusables];
      const activeIndex = focusableList.indexOf(
        document.activeElement as HTMLElement
      );
      const lastIndex = focusableList.length - 1;
      if (event.shiftKey && (activeIndex <= 0 || activeIndex === -1)) {
        event.preventDefault();
        focusableList[lastIndex].focus();
      } else if (!event.shiftKey && activeIndex === lastIndex) {
        event.preventDefault();
        focusableList[0].focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('has-overlay');
      inertTargets.forEach((element) => element.removeAttribute('inert'));
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  return (
    <div
      className={overlayClass(menu, closing)}
      // Backdrop only; keyboard users close with Escape (see onKeyDown above)
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`${menu ? MENU_PANEL_CLASS : modalPanelClass(wide, video)} ${panelMotionClass(menu, closing)}`}
        // A link to another page closes the dialog before the navigation
        // starts: while open, the page is `inert`, and Next.js would skip it
        // when restoring scroll, landing the new page at its bottom
        onClickCapture={(event) => {
          const link = (event.target as Element).closest('a[href]');
          if (link?.getAttribute('href')?.startsWith('/')) onClose();
        }}
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
