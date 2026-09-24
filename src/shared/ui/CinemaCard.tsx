"use client";

import { useAppStore } from "@/shared/store/store";
import { distanceKm } from "@/shared/lib/catalog";
import type { Cinema } from "@/shared/lib/types";
import { HeartButton } from "./HeartButton";

export function CinemaCard({ c }: { c: Cinema }) {
  const saved = useAppStore((s) => s.cinemaSaved(c.id));
  const location = useAppStore((s) => s.location);
  const km = distanceKm(c, location.coords);
  return (
    <article
      className={`cinema-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center border rounded-[17px] p-5 min-w-0 max-sm:p-4 max-sm:rounded-2xl ${
        saved ? "border-lime/30 bg-gradient-to-[120deg] from-lime-soft to-surface" : "border-line bg-surface"
      }`}
    >
      <div>
        <a href={`/cinema/${c.id}`}>
          <h2 className="text-xl max-sm:text-lg leading-[1.25] -tracking-[0.025em] m-0 mb-1.5">{c.name}</h2>
          <p className="text-muted text-[13px] max-sm:text-xs m-0 mb-1.5">{c.address}</p>
        </a>
        <small className="text-faint text-xs">
          {km !== null ? `${km.toFixed(1).replace(".", ",")} km em linha reta · ` : ""}
          {c.roomCount} {c.roomCount === 1 ? "sala" : "salas"} · {c.tech.join(" · ")}
        </small>
      </div>
      <HeartButton kind="cinema" id={c.id} path={`/cinema/${c.id}`} />
    </article>
  );
}
