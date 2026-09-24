import { useRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const btnBase =
  "min-h-[46px] px-5 py-2.5 rounded-full border border-line bg-white/[0.035] text-app-text inline-flex items-center justify-center gap-2 text-sm font-semibold leading-tight whitespace-normal hover:bg-lime-soft hover:border-lime/40 transition-colors";
const btnPrimary = "bg-lime! text-[#081004]! border-lime! font-extrabold hover:bg-[#d5ff70]!";
const btnSmall = "min-h-10! text-[13px]! px-3.5! py-2!";
const btnFull = "w-full";

function cx(...parts: (string | false | undefined | null)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  primary,
  small,
  full,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; small?: boolean; full?: boolean }) {
  return (
    <button className={cx(btnBase, primary && btnPrimary, small && btnSmall, full && btnFull, className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  primary,
  small,
  full,
  className = "",
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { primary?: boolean; small?: boolean; full?: boolean }) {
  return (
    <a className={cx(btnBase, primary && btnPrimary, small && btnSmall, full && btnFull, className)} {...rest}>
      {children}
    </a>
  );
}

export function TextLink({ className = "", full, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { full?: boolean }) {
  return (
    <button
      className={cx(
        "border-0 bg-transparent p-0 py-1.5 text-[#dce3dc] text-sm inline-flex items-center gap-1.5 hover:text-lime transition-colors",
        full && "w-full justify-center",
        className,
      )}
      {...rest}
    />
  );
}

export function Chip({ active, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cx(
        "border border-line bg-surface2 text-[#cbd5cd] rounded-full px-3.5 py-2 min-h-10 text-[13px] inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0",
        active && "text-[#081004]! bg-lime! border-lime! font-bold!",
        className,
      )}
      {...rest}
    />
  );
}

/** Pointer-driven drag-to-scroll for horizontal rails, ported from the original's `setupRails()`. */
export function Rail({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };
  const endDrag = () => {
    drag.current.active = false;
  };
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div
      ref={ref}
      className={cx(
        "flex gap-4 overflow-x-auto no-scrollbar py-[3px] px-0.5 pb-[9px] cursor-grab active:cursor-grabbing overscroll-x-contain max-sm:gap-3",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      {...rest}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title, children, className = "" }: { title?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cx("border border-line rounded-app p-6 bg-surface text-muted text-[15px] leading-relaxed", className)}>
      {title && <h3 className="text-app-text text-[23px] tracking-tight m-0 mb-2">{title}</h3>}
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 mb-4 min-w-0">
      <span className="text-[#b4c0b6] text-[13px]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full max-w-full border border-line rounded-xl bg-[#080e0a] text-white px-3.5 py-3 text-[15px] min-h-12 outline-none focus:border-lime/60 transition-colors";
