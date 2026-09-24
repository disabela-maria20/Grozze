import { useEffect, useState } from "react";
import { dateLabel, hasSessions, status } from "../../lib/catalog";
import { useAppStore } from "../../lib/store";
import type { Movie } from "../../lib/types";
import { MovieMeta } from "./MovieMeta";
import { SaveButton } from "./SaveButton";
import { Icon } from "./Icon";
import { TextLink } from "./ui";

export function MovieHero({ m, path }: { m: Movie; path: string }) {
  const [expanded, setExpanded] = useState(false);
  const setHasHero = useAppStore((s) => s.setHasHero);
  const openDialog = useAppStore((s) => s.openDialog);
  const upcoming = status(m) === "soon";

  useEffect(() => {
    setHasHero(true);
    document.body.classList.add("has-hero");
    return () => {
      setHasHero(false);
      document.body.classList.remove("has-hero");
    };
  }, []);

  return (
    <section id="movieHero" className="hero movie-hero relative isolate bg-[#09110d] overflow-hidden" data-movie={m.id}>
      <div
        className="absolute inset-0 -z-20 bg-cover bg-[center_28%] opacity-85"
        style={{ background: `radial-gradient(circle at 75% 20%, ${m.colors?.[0] || "#294630"}, #06110a)` }}
      >
        {m.backdrop && <img src={m.backdrop} alt="" draggable={false} className="w-full h-full object-cover object-[center_28%]" />}
      </div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,8,7,.94), rgba(5,8,7,.68) 43%, rgba(5,8,7,.12) 80%), linear-gradient(0deg, var(--color-bg) 1%, transparent 66%)",
        }}
      />
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto min-h-[650px] max-sm:min-h-[min(650px,calc(100svh-90px))] flex items-end pt-[174px] pb-[78px] max-sm:pt-[180px] max-sm:pb-6.5 max-sm:justify-center">
        <div className="w-[720px] max-w-full min-w-0 max-sm:text-center">
          {upcoming ? (
            <div className="inline-flex items-center gap-3 px-3.5 py-2.5 mb-3.5 border border-lime/30 bg-lime-soft rounded-[14px]">
              <small className="text-[#c3cfc1] text-[11px] uppercase tracking-[0.12em]">Estreia</small>
              <strong className="text-lime text-xl">{dateLabel(m.releaseDate, true)}</strong>
            </div>
          ) : (
            <div className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
              {status(m) === "presale" ? "Pré-venda" : "Em cartaz"}
            </div>
          )}
          <h1 className="text-[62px] max-sm:text-[clamp(29px,8.5vw,39px)] font-extrabold leading-[1.04] -tracking-[0.052em] my-2.5 mb-4.5">{m.t}</h1>
          <MovieMeta m={m} />
          <div className="flex justify-start max-sm:justify-center mb-2.5">
            <SaveButton m={m} path={path} />
          </div>
          <div className="mt-4 max-w-[710px]">
            <p className={`text-[#cbd5cd] text-[15px] max-sm:text-[13px] leading-relaxed mb-2.5 ${expanded ? "" : "line-clamp-3"}`}>
              {m.syn || "A sinopse deste filme ainda não está disponível."}
            </p>
            <TextLink onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
              {expanded ? "Ver menos" : "Saiba mais"}
            </TextLink>
            {expanded && (
              <dl className="grid grid-cols-2 max-sm:grid-cols-1 gap-5.5 max-sm:gap-2.5 mt-4.5 max-sm:text-center">
                {m.director && (
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-faint mb-1.5">Direção</dt>
                    <dd className="m-0 text-sm text-[#dae3da]">{m.director}</dd>
                  </div>
                )}
                {!!m.cast?.length && (
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-faint mb-1.5">Elenco principal</dt>
                    <dd className="m-0 text-sm text-[#dae3da]">{m.cast.join(", ")}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-faint mb-1.5">Distribuição</dt>
                  <dd className="m-0 text-sm text-[#dae3da]">{m.distLabel}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-faint mb-1.5">{status(m) === "now" ? "Estreia nos cinemas" : "Estreia"}</dt>
                  <dd className="m-0 text-sm text-[#dae3da]">{dateLabel(m.releaseDate, true)}</dd>
                </div>
              </dl>
            )}
          </div>
          <div className="flex items-center gap-2.5 flex-wrap mt-4.5 max-sm:justify-center">
            {hasSessions(m.id) && (
              <a
                className="min-h-[46px] px-5 py-2.5 rounded-full bg-lime text-[#081004] font-extrabold inline-flex items-center gap-2 text-sm hover:bg-[#d5ff70] transition-colors"
                href="#sessoes"
              >
                <Icon name="ticket" /> Sessões
              </a>
            )}
            <button
              type="button"
              className="min-h-[46px] px-5 py-2.5 rounded-full border border-line bg-white/[0.035] inline-flex items-center gap-2 text-sm font-semibold hover:bg-lime-soft hover:border-lime/40 transition-colors"
              onClick={() => openDialog("trailer", { movieId: m.id })}
            >
              <Icon name="play" /> Trailer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
