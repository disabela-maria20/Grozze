'use client';

import Link from 'next/link';
import { dateLabel, newsHref } from '@/shared/lib/catalog';
import type { GrozzeNewsSummary } from '@/shared/api';

/** Published date as "8 de setembro de 2026" (ISO datetime → date part). */
function publishedLabel(article: GrozzeNewsSummary): string {
  const date = article.publishedAt ?? article.createdAt;
  return dateLabel(date.slice(0, 10), true);
}

export function NewsCard({
  article,
  scope,
}: {
  article: GrozzeNewsSummary;
  scope?: string | null;
}) {
  return (
    <Link
      className="news-card border border-line bg-surface rounded-2xl overflow-hidden block min-w-0 max-sm:grid max-sm:grid-cols-[108px_minmax(0,1fr)]"
      href={newsHref(article.slug, scope)}
    >
      <div
        className="h-[140px] max-sm:h-full max-sm:min-h-[122px] bg-gradient-to-[130deg] from-[#263e2d] to-[#112319] bg-cover bg-center flex items-end p-4.5 max-sm:p-3 text-lime text-xs font-extrabold tracking-[0.1em] uppercase"
        style={
          article.coverImageUrl
            ? { backgroundImage: `url("${article.coverImageUrl}")` }
            : undefined
        }
      >
        {!article.coverImageUrl && publishedLabel(article)}
      </div>
      <div className="p-4.5 max-sm:p-3.5">
        <h3 className="text-xl max-sm:text-lg leading-[1.2] -tracking-[0.025em] m-0 mb-2.5">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-muted text-[13px] max-sm:text-xs m-0">
            {article.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
