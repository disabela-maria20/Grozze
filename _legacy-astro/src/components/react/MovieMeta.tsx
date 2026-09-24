import type { Movie } from "../../lib/types";
import { ratingColor } from "../../lib/catalog";

export function RatingBadge({ rating }: { rating: string | undefined }) {
  const r = ratingColor(rating);
  if (!r) return null;
  return (
    <span
      className="min-w-7 h-7 px-1.5 rounded-[5px] text-white font-black leading-7 text-center inline-block"
      style={{ background: r.color }}
      aria-label={`Classificação ${rating}`}
    >
      {r.code}
    </span>
  );
}

export function ImdbBadge({ m }: { m: Movie }) {
  const i = m.imdb;
  if (!i?.score) return null;
  const url = String(i.url || "");
  const isImdbUrl = /^https:\/\/www\.imdb\.com\//.test(url);
  const Tag = isImdbUrl ? "a" : "span";
  return (
    <Tag
      className="inline-flex gap-2 items-center text-white font-bold whitespace-nowrap text-sm"
      {...(isImdbUrl ? { href: url, target: "_blank", rel: "noopener noreferrer" } : {})}
      title="Nota herdada do snapshot; não atualizada nesta revisão"
    >
      <span className="bg-[#f5c518] text-[#080908] font-black text-[15px] px-1.5 py-0.5 rounded-[5px] -tracking-[0.05em]">IMDb</span>
      <span>{i.score}/10</span>
    </Tag>
  );
}

export function MovieMeta({ m }: { m: Movie }) {
  const extras = [m.dur, m.genre].filter(Boolean);
  return (
    <div className="flex items-center gap-2.5 flex-wrap text-[#cbd4cc] text-sm mb-3.5 max-sm:justify-center max-sm:gap-1.5 max-sm:text-xs">
      <ImdbBadge m={m} />
      <RatingBadge rating={m.rating} />
      {extras.map((v, i) => (
        <span key={v} className="flex items-center gap-2.5 max-sm:gap-1.5">
          {i > 0 && <span className="text-[#79877b]">·</span>}
          {v}
        </span>
      ))}
    </div>
  );
}
