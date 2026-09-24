"use client";

import { useMemo, useState } from "react";
import { allMovies, dateLabel, movie, movieHref, MONTH_NAMES, status, unique, validDate } from "@/shared/lib/catalog";
import { useAppStore } from "@/shared/store/store";
import { MovieCard } from "@/shared/ui/MovieCard";
import { MoviePoster } from "@/shared/ui/MoviePoster";
import { Chip, Rail } from "@/shared/ui/ui";
import { Icon } from "@/shared/ui/Icon";
import { SaveButton } from "./SaveButton";

export function ComingSoonApp() {
  const content = useAppStore((s) => s.content);
  const list = useMemo(
    () => allMovies(content).filter((m) => status(m) !== "now" && validDate(m.releaseDate)),
    [content],
  );
  const years = useMemo(() => unique(list.map((m) => m.releaseDate.slice(0, 4))).sort(), [list]);
  const [year, setYear] = useState(years[0] || "");
  const months = useMemo(
    () => unique(list.filter((m) => m.releaseDate.startsWith(year)).map((m) => m.releaseDate.slice(5, 7))).sort(),
    [list, year],
  );
  const [month, setMonth] = useState(months[0] || "");
  const effectiveMonth = months.includes(month) ? month : months[0] || "";

  const selected = list
    .filter((m) => m.releaseDate.startsWith(year + "-" + effectiveMonth))
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  const lead = movie("22941", content) || list[0];

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">Em breve</h1>
        </header>
        {lead && (
          <section
            className="rounded-app min-h-[420px] my-5 bg-cover bg-center relative overflow-hidden p-10 max-sm:p-5.5 max-sm:min-h-0 isolate"
            style={{ backgroundColor: lead.colors?.[0] || "#15331c" }}
          >
            {lead.backdrop && (
              <img src={lead.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover -z-20" />
            )}
            <div
              className="absolute inset-0 -z-10"
              style={{ background: "linear-gradient(90deg, rgba(5,8,7,.96), rgba(5,8,7,.5) 66%, rgba(5,8,7,.23))" }}
            />
            <div className="grid grid-cols-[1fr_200px] max-sm:grid-cols-1 gap-7.5 max-sm:gap-5 items-center">
              <div>
                <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">Em destaque</p>
                <h2 className="text-[44px] max-sm:text-[33px] leading-[1.04] -tracking-[0.05em] mb-3.5">{lead.t}</h2>
                <div className="inline-flex items-center gap-3 px-3.5 py-2.5 mb-3.5 border border-lime/30 bg-lime-soft rounded-[14px]">
                  <small className="text-[#c3cfc1] text-[11px] uppercase tracking-[0.12em]">Estreia</small>
                  <strong className="text-lime text-xl">{dateLabel(lead.releaseDate, true)}</strong>
                </div>
                <p className="text-[15px] max-sm:text-[13px] text-[#c7d1c8] max-w-[620px]">{lead.syn}</p>
                <div className="flex items-center gap-2.5 mt-4.5 flex-wrap">
                  <a
                    className="min-h-[46px] px-5 py-2.5 rounded-full bg-lime text-[#081004] font-extrabold inline-flex items-center gap-2 text-sm hover:bg-[#d5ff70] transition-colors"
                    href={movieHref(lead.id)}
                  >
                    Ver filme <Icon name="arrow" className="w-4 h-4" />
                  </a>
                  <SaveButton m={lead} path={movieHref(lead.id)} />
                </div>
              </div>
              <a href={movieHref(lead.id)} className="max-sm:hidden">
                <MoviePoster m={lead} className="w-[200px]" />
              </a>
            </div>
          </section>
        )}
        <div className="grid gap-3 my-6">
          <Rail aria-label="Ano">
            {years.map((y) => (
              <Chip key={y} active={year === y} onClick={() => setYear(y)}>
                {y}
              </Chip>
            ))}
          </Rail>
          <Rail aria-label="Mês">
            {months.map((mo) => (
              <Chip key={mo} active={effectiveMonth === mo} onClick={() => setMonth(mo)}>
                {MONTH_NAMES[Number(mo) - 1]}
              </Chip>
            ))}
          </Rail>
        </div>
        <div className="grid grid-cols-6 max-lg:grid-cols-5 max-md:grid-cols-4 max-sm:grid-cols-2 gap-x-4 gap-y-6">
          {selected.map((m) => (
            <MovieCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
