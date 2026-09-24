"use client";

import type { NewsItem } from "@/shared/lib/types";
import { newsHref } from "@/shared/lib/catalog";

export function NewsCard({ n, scope }: { n: NewsItem; scope?: string | null }) {
  return (
    <a className="news-card border border-line bg-surface rounded-2xl overflow-hidden block min-w-0 max-sm:grid max-sm:grid-cols-[108px_minmax(0,1fr)]" href={newsHref(n.id, scope)}>
      <div className="h-[140px] max-sm:h-full max-sm:min-h-[122px] bg-gradient-to-[130deg] from-[#263e2d] to-[#112319] flex items-end p-4.5 max-sm:p-3 text-lime text-xs font-extrabold tracking-[0.1em] uppercase">
        {n.k}
      </div>
      <div className="p-4.5 max-sm:p-3.5">
        <h3 className="text-xl max-sm:text-lg leading-[1.2] -tracking-[0.025em] m-0 mb-2.5">{n.t}</h3>
        <p className="text-muted text-[13px] max-sm:text-xs m-0">{n.p}</p>
      </div>
    </a>
  );
}

export function NewsSection({ items, title, scope }: { items: NewsItem[]; title: string; scope?: string | null }) {
  if (!items.length) return null;
  return (
    <section className="py-8 max-sm:py-6">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <div className="flex items-end justify-between gap-6 mb-4.5">
          <div>
            <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">Editorial</p>
            <h2 className="text-[32px] max-sm:text-[26px] tracking-tight m-0">{title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4.5">
          {items.slice(0, 3).map((n) => (
            <NewsCard key={n.id} n={n} scope={scope} />
          ))}
        </div>
      </div>
    </section>
  );
}
