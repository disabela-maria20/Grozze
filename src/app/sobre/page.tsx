import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sobre' };

export default function Page() {
  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <article className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <h1 className="text-[clamp(42px,6vw,72px)]! max-w-[820px] leading-[1.05] -tracking-[0.04em] mb-4">
          Menos procura.
          <br />
          <em className="not-italic text-lime">Mais cinema.</em>
        </h1>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          A Grozze reúne filmes, cinemas e sessões para ajudar você a encontrar
          sua próxima ida ao cinema.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">Do filme ao horário.</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          Descubra o que está em cartaz, acompanhe as próximas estreias e
          compare as sessões. A compra é concluída com o parceiro responsável
          pela venda.
        </p>
        <div className="flex items-center gap-2.5 flex-wrap mt-5">
          <Link
            className="min-h-[46px] px-5 py-2.5 rounded-full bg-lime text-[#081004] font-extrabold inline-flex items-center gap-2 text-sm"
            href="/filmes"
          >
            Explorar filmes
          </Link>
          <Link
            className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold"
            href="/cinemas"
          >
            Encontrar cinemas
          </Link>
        </div>
      </article>
    </div>
  );
}
