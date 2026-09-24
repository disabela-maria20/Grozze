import { useState } from "react";
import { allMovies, sortedCinemas } from "../../lib/catalog";
import { useAppStore } from "../../lib/store";
import { AuthDialog } from "./dialogs/AuthDialog";
import { Avatar } from "./Avatar";
import { CinemaCard } from "./CinemaCard";
import { MovieCard } from "./MovieCard";
import { Button, EmptyState, Field, TextLink, inputClass } from "./ui";

const ACCOUNT_TABS: [string, string][] = [
  ["", "Visão geral"],
  ["salvos", "Filmes favoritos"],
  ["cinemas", "Cinemas favoritos"],
  ["preferencias", "Preferências"],
  ["conta", "Conta"],
];

const AVATAR_OPTIONS: ["initial" | "star" | "moon" | "sun", string][] = [
  ["initial", "Inicial"],
  ["star", "★"],
  ["moon", "☾"],
  ["sun", "☀"],
];
const AVATAR_CHARS: Record<string, string> = { star: "★", moon: "☾", sun: "☀" };

function OverviewTab({ saved, fav }: { saved: ReturnType<typeof allMovies>; fav: ReturnType<typeof sortedCinemas> }) {
  const profile = useAppStore((s) => s.profile())!;
  return (
    <>
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">Minha Grozze</p>
      <h1 className="text-[42px] max-sm:text-[33px] -tracking-[0.05em] leading-[1.1] m-0 mb-3">Olá, {profile.name.split(" ")[0]}.</h1>
      <p className="text-muted text-sm">Seus filmes e cinemas, no mesmo lugar.</p>
      <div className="grid grid-cols-2 gap-3 my-5.5">
        <a className="border border-line rounded-2xl p-4.5 bg-surface" href="/minha-grozze/salvos">
          <b className="block text-[27px] leading-tight">{saved.length}</b>
          <span className="text-xs text-muted">Filmes favoritos</span>
        </a>
        <a className="border border-line rounded-2xl p-4.5 bg-surface" href="/minha-grozze/cinemas">
          <b className="block text-[27px] leading-tight">{fav.length}</b>
          <span className="text-xs text-muted">Cinemas favoritos</span>
        </a>
      </div>
      <section className="my-6.5">
        <div className="flex justify-between items-end gap-6 mb-4">
          <h2 className="text-2xl m-0">Filmes favoritos</h2>
          <a className="text-xs text-[#dce3dc] hover:text-lime" href="/minha-grozze/salvos">
            Ver todos →
          </a>
        </div>
        {saved.length ? (
          <div className="grid grid-cols-4 max-sm:grid-cols-3 gap-4">
            {saved.slice(0, 6).map((m) => (
              <MovieCard key={m.id} m={m} />
            ))}
          </div>
        ) : (
          <EmptyState>
            <p>Guarde os filmes que você quer encontrar depois.</p>
            <a className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold" href="/filmes">
              Descobrir filmes
            </a>
          </EmptyState>
        )}
      </section>
      <section className="my-6.5">
        <div className="flex justify-between items-end gap-6 mb-4">
          <h2 className="text-2xl m-0">Cinemas favoritos</h2>
          <a className="text-xs text-[#dce3dc] hover:text-lime" href="/cinemas?favoritos=1">
            Gerenciar →
          </a>
        </div>
        <div className="grid gap-3">
          {fav.length ? (
            fav.map((c) => <CinemaCard key={c.id} c={c} />)
          ) : (
            <EmptyState>
              <p>Seus cinemas favoritos aparecerão aqui.</p>
              <a className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold" href="/cinemas">
                Encontrar cinemas
              </a>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}

function PreferencesTab() {
  const profile = useAppStore((s) => s.profile())!;
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const openDialog = useAppStore((s) => s.openDialog);
  const [language, setLanguage] = useState(profile.preferences?.language || "Todos");
  const [format, setFormat] = useState(profile.preferences?.format || "Todos");

  return (
    <>
      <h1 className="text-[42px] max-sm:text-[33px] -tracking-[0.05em] m-0 mb-3">Preferências</h1>
      <p className="text-muted text-sm mb-5">Suas escolhas priorizam sessões compatíveis sem esconder as outras.</p>
      <form
        className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app"
        onSubmit={(e) => {
          e.preventDefault();
          updatePreferences({ language, format });
        }}
      >
        <Field label="Idioma preferido">
          <select className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
            {["Todos", "Legendado", "Nacional", "Dublado / original"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Experiência preferida">
          <select className={inputClass} value={format} onChange={(e) => setFormat(e.target.value)}>
            {["Todos", "IMAX", "VIP", "4DX", "LED"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-faint mb-4">O envio de alertas não está ativo nesta homologação.</p>
        <Button primary type="submit">
          Salvar preferências
        </Button>
      </form>
      <div className="mt-5">
        <TextLink onClick={() => openDialog("consent")}>Preferências de cookies →</TextLink>
      </div>
    </>
  );
}

function AccountTab() {
  const profile = useAppStore((s) => s.profile())!;
  const setAvatar = useAppStore((s) => s.setAvatar);
  const updateProfileName = useAppStore((s) => s.updateProfileName);
  const logout = useAppStore((s) => s.logout);
  const openDialog = useAppStore((s) => s.openDialog);
  const [name, setName] = useState(profile.name);

  return (
    <>
      <h1 className="text-[42px] max-sm:text-[33px] -tracking-[0.05em] m-0 mb-3">Sua conta</h1>
      <form
        className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfileName(name);
        }}
      >
        <div className="flex flex-wrap gap-2.5 mb-5" role="group" aria-label="Escolha seu avatar">
          {AVATAR_OPTIONS.map(([v]) => (
            <button
              key={v}
              type="button"
              onClick={() => setAvatar(v)}
              aria-pressed={(profile.avatar || "initial") === v}
              aria-label={`Avatar ${v}`}
              className="p-1 bg-none border border-transparent rounded-full aria-[pressed=true]:border-lime"
            >
              <span className="w-[60px] h-[60px] text-[25px] inline-grid place-items-center rounded-full font-extrabold bg-lime text-[#091006]">
                {v === "initial" ? profile.name.charAt(0).toUpperCase() : AVATAR_CHARS[v]}
              </span>
            </button>
          ))}
        </div>
        <Field label="Nome">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoComplete="name" />
        </Field>
        <Field label="E-mail">
          <input className={inputClass} value={profile.email} readOnly />
        </Field>
        <Button primary type="submit">
          Salvar dados
        </Button>
        <TextLink className="ml-4" onClick={logout} type="button">
          Sair
        </TextLink>
      </form>
      <div className="mt-4.5">
        <TextLink onClick={() => openDialog("consent")}>Preferências de cookies →</TextLink>
      </div>
    </>
  );
}

export function AccountApp({ part = "" }: { part?: string }) {
  const content = useAppStore((s) => s.content);
  const logged = useAppStore((s) => s.logged());
  const cinemaSaved = useAppStore((s) => s.cinemaSaved);
  const movieSaved = useAppStore((s) => s.movieSaved);
  const profile = useAppStore((s) => s.profile());
  const logout = useAppStore((s) => s.logout);

  if (!logged) {
    return (
      <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
        <div className="w-[min(1220px,530px)] max-sm:w-[calc(100%-32px)] mx-auto">
          <div className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app">
            <AuthDialog signup={false} />
          </div>
        </div>
      </div>
    );
  }

  const saved = allMovies(content).filter((m) => movieSaved(m.id));
  const fav = sortedCinemas(cinemaSaved).filter((c) => cinemaSaved(c.id));

  let content_: React.ReactNode;
  if (part === "salvos") {
    content_ = (
      <>
        <h1 className="text-[42px] max-sm:text-[33px] -tracking-[0.05em] m-0 mb-4">Filmes favoritos</h1>
        {saved.length ? (
          <div className="grid grid-cols-4 max-sm:grid-cols-3 gap-4">
            {saved.map((m) => (
              <MovieCard key={m.id} m={m} />
            ))}
          </div>
        ) : (
          <EmptyState>
            <p>Nenhum filme salvo ainda.</p>
            <a className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold" href="/filmes">
              Descobrir filmes
            </a>
          </EmptyState>
        )}
      </>
    );
  } else if (part === "cinemas") {
    content_ = (
      <>
        <h1 className="text-[42px] max-sm:text-[33px] -tracking-[0.05em] m-0 mb-4">Cinemas favoritos</h1>
        <div className="grid gap-3">
          {fav.length ? (
            fav.map((c) => <CinemaCard key={c.id} c={c} />)
          ) : (
            <EmptyState>
              <p>Nenhum cinema favorito ainda.</p>
              <a className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold" href="/cinemas">
                Encontrar cinemas
              </a>
            </EmptyState>
          )}
        </div>
      </>
    );
  } else if (part === "preferencias") {
    content_ = <PreferencesTab />;
  } else if (part === "conta") {
    content_ = <AccountTab />;
  } else {
    content_ = <OverviewTab saved={saved} fav={fav} />;
  }

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto grid grid-cols-[215px_1fr] max-md:grid-cols-[180px_1fr] max-sm:flex max-sm:flex-col gap-9 max-md:gap-6 max-sm:gap-5.5 items-start">
        <aside className="border border-line rounded-[19px] p-5 sticky top-[104px] min-w-0 max-sm:static max-sm:w-full max-sm:border-0 max-sm:p-0 max-sm:rounded-none">
          <div className="text-center min-w-0 max-sm:grid max-sm:grid-cols-[48px_1fr] max-sm:text-left max-sm:gap-x-3 max-sm:items-center">
            <Avatar size="large" />
            <strong className="block mt-2.5 text-base max-sm:mt-0 max-sm:self-end break-words">{profile!.name}</strong>
            <small className="block text-muted text-xs mt-1 max-sm:self-start break-words">{profile!.email}</small>
          </div>
          <nav className="grid gap-1 mt-5 max-sm:flex max-sm:overflow-auto max-sm:no-scrollbar max-sm:mt-4 max-sm:pb-1" aria-label="Minha Grozze">
            {ACCOUNT_TABS.map(([v, l]) => (
              <a
                key={v}
                href={`/minha-grozze${v ? "/" + v : ""}`}
                className={`px-3 py-2.5 rounded-xl text-left text-[13px] whitespace-nowrap max-sm:border max-sm:border-line max-sm:rounded-full max-sm:flex-none ${
                  part === v ? "bg-lime-soft text-lime" : "text-muted"
                }`}
              >
                {l}
              </a>
            ))}
            <button type="button" onClick={logout} className="px-3 py-2.5 rounded-xl text-left text-[13px] text-muted max-sm:hidden">
              Sair
            </button>
          </nav>
        </aside>
        <section className="min-w-0 w-full">{content_}</section>
      </div>
    </div>
  );
}
