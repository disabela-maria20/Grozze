'use client';

import { useAppStore } from '@/shared/store';
import {
  allCinemas,
  currentMovies,
  NEWS,
  preMovies,
  soonMovies,
} from '@/shared/lib/catalog';
import { useAccountAction } from '@/features/account';
import { MovieSection } from '@/features/movies';
import { NewsSection } from '@/features/news';
import { Button, Icon } from '@/shared/ui';
import { HomeHero } from './HomeHero';

export function HomeApp() {
  const content = useAppStore((s) => s.content);
  const logged = useAppStore((s) => s.logged());
  const cinemaSaved = useAppStore((s) => s.cinemaSaved);
  const openDialog = useAppStore((s) => s.openDialog);
  const accountAction = useAccountAction();

  const nowShowing = currentMovies(content);
  const favoriteCinemas = allCinemas().filter((theater) =>
    cinemaSaved(theater.id)
  );
  // Oldest releases first: the ones closest to leaving theaters
  const lastChance = nowShowing
    .slice()
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
    .slice(0, 5);

  return (
    <>
      <HomeHero list={nowShowing.slice(0, 5)} />

      <section className="py-8 max-sm:py-6">
        <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
          <button
            type="button"
            onClick={() => openDialog('now')}
            className="w-full border border-lime/32 rounded-app px-5.5 py-4.5 flex items-center gap-4.5 bg-gradient-to-r from-lime-soft to-[rgba(200,255,57,.015)] text-left max-sm:p-4 max-sm:rounded-2xl"
          >
            <span className="bg-lime text-[#081004] w-[42px] h-[42px] rounded-full grid place-items-center shrink-0">
              <Icon name="clock" />
            </span>
            <span>
              <strong className="text-[22px] leading-[1.2] block -tracking-[0.03em] max-sm:text-lg">
                Começando agora
              </strong>
              <small className="block text-[13px] text-muted mt-1 max-sm:text-xs">
                Encontre sua sessão na próxima hora.
              </small>
            </span>
            <span className="ml-auto text-lime text-sm whitespace-nowrap flex items-center gap-1.5 max-sm:hidden">
              Ver sessões <Icon name="arrow" className="w-4 h-4" />
            </span>
          </button>
        </div>
      </section>

      {logged && favoriteCinemas.length > 0 && (
        <section className="py-8 max-sm:py-6" id="homeFavorites">
          <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
            <div className="flex items-end justify-between gap-6 mb-4.5">
              <div>
                <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
                  Seus lugares
                </p>
                <h2 className="text-[32px] tracking-tight m-0">
                  Cinemas favoritos
                </h2>
              </div>
              <a
                className="text-[13px] inline-flex items-center gap-1.5 text-[#dce3dc] hover:text-lime transition-colors"
                href="/cinemas"
              >
                Gerenciar <Icon name="arrow" className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-3 max-sm:flex max-sm:overflow-auto max-sm:no-scrollbar gap-3.5">
              {favoriteCinemas.map((theater) => (
                <a
                  key={theater.id}
                  href={`/cinema/${theater.id}`}
                  className="border border-line rounded-2xl bg-surface p-4.5 min-w-0 max-sm:shrink-0 max-sm:w-[235px]"
                >
                  <strong className="block">{theater.name}</strong>
                  <small className="block text-muted text-xs mt-1.5">
                    {[theater.network, theater.city]
                      .filter(Boolean)
                      .join(' · ')}
                  </small>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <MovieSection
        title="Perto de você"
        eyebrow="Nos cinemas"
        list={nowShowing}
        morePath="/filmes"
        id="nearby"
      />
      <MovieSection
        title="Pré-venda"
        eyebrow="Venda antecipada"
        list={preMovies(content)}
        morePath="/filmes?status=presale"
        id="presale"
      />
      <MovieSection
        title="Top 10"
        eyebrow="Na sua cidade"
        list={nowShowing}
        rank
        id="top10"
      />
      <MovieSection title="Ainda dá tempo" list={lastChance} id="lastchance" />
      <MovieSection
        title="O que vem aí"
        eyebrow="Próximas estreias"
        list={soonMovies(content)}
        morePath="/em-breve"
        id="future"
      />
      <NewsSection items={NEWS.slice(0, 3)} title="Notícias" />

      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <section className="my-7 mb-10.5 max-sm:my-3.5 max-sm:mb-8 p-7 max-sm:p-5.5 border border-line rounded-[22px] bg-gradient-to-[120deg] from-lime-soft to-transparent flex items-center justify-between gap-6 max-sm:block">
          <div>
            <h2 className="text-[30px] max-sm:text-[26px] -tracking-[0.04em] mb-1.5">
              Sua próxima ida começa aqui.
            </h2>
            <p className="m-0 text-muted text-sm max-sm:mb-4.5">
              Guarde filmes e cinemas para encontrar depois.
            </p>
          </div>
          <Button primary onClick={accountAction}>
            {logged ? 'Minha Grozze' : 'Criar minha conta'}{' '}
            <Icon name="arrow" className="w-4 h-4" />
          </Button>
        </section>
      </div>
    </>
  );
}
