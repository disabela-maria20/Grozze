'use client';

import type { GrozzeNewsSummary } from '@/shared/api';
import { NewsCard } from './NewsCard';

export function NewsSection({
  items,
  title,
  scope,
}: {
  items: GrozzeNewsSummary[];
  title: string;
  scope?: string | null;
}) {
  if (!items.length) return null;
  return (
    <section className="py-8 max-sm:py-6">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <div className="flex items-end justify-between gap-6 mb-4.5">
          <div>
            <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
              Editorial
            </p>
            <h2 className="text-[32px] max-sm:text-[26px] tracking-tight m-0">
              {title}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4.5">
          {items.slice(0, 3).map((item) => (
            <NewsCard key={item.id} article={item} scope={scope} />
          ))}
        </div>
      </div>
    </section>
  );
}
