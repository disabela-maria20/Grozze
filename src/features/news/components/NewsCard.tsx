'use client';

import { newsHref } from '@/shared/lib/catalog';
import type { NewsItem } from '@/shared/lib/types';

export function NewsCard({ n, scope }: { n: NewsItem; scope?: string | null }) {
  return (
    <a
      className="news-card border border-line bg-surface rounded-2xl overflow-hidden block min-w-0 max-sm:grid max-sm:grid-cols-[108px_minmax(0,1fr)]"
      href={newsHref(n.id, scope)}
    >
      <div className="h-[140px] max-sm:h-full max-sm:min-h-[122px] bg-gradient-to-[130deg] from-[#263e2d] to-[#112319] flex items-end p-4.5 max-sm:p-3 text-lime text-xs font-extrabold tracking-[0.1em] uppercase">
        {n.k}
      </div>
      <div className="p-4.5 max-sm:p-3.5">
        <h3 className="text-xl max-sm:text-lg leading-[1.2] -tracking-[0.025em] m-0 mb-2.5">
          {n.t}
        </h3>
        <p className="text-muted text-[13px] max-sm:text-xs m-0">{n.p}</p>
      </div>
    </a>
  );
}
