"use client";

import { useAppStore } from "@/shared/store/store";
import type { Movie } from "@/shared/lib/types";
import { Icon } from "@/shared/ui/Icon";

export function SaveButton({ m, path }: { m: Movie; path: string }) {
  const on = useAppStore((s) => s.movieSaved(m.id));
  const requestFavorite = useAppStore((s) => s.requestFavorite);
  return (
    <button
      type="button"
      className={`min-h-[46px] px-5 py-2.5 rounded-full border border-line bg-white/[0.035] inline-flex items-center justify-center gap-2 text-sm font-semibold hover:bg-lime-soft hover:border-lime/40 transition-colors ${
        on ? "bg-lime! text-[#081004]! border-lime!" : ""
      }`}
      aria-pressed={on}
      onClick={() => requestFavorite("movie", m.id, path)}
    >
      <Icon name={on ? "check" : "heart"} />
      <span>{on ? "Salvo" : "Salvar"}</span>
    </button>
  );
}
