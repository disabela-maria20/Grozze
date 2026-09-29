'use client';

import type { Movie } from '@/shared/lib/types';

export function ImdbBadge({ m }: { m: Movie }) {
  const i = m.imdb;
  if (!i?.score) return null;
  const url = String(i.url || '');
  const isImdbUrl = /^https:\/\/www\.imdb\.com\//.test(url);
  const Tag = isImdbUrl ? 'a' : 'span';
  return (
    <Tag
      className="inline-flex gap-2 items-center text-white font-bold whitespace-nowrap text-sm"
      {...(isImdbUrl
        ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      title="Nota herdada do snapshot; não atualizada nesta revisão"
    >
      <span className="bg-[#f5c518] text-[#080908] font-black text-[15px] px-1.5 py-0.5 rounded-[5px] -tracking-[0.05em]">
        IMDb
      </span>
      <span>{i.score}/10</span>
    </Tag>
  );
}
