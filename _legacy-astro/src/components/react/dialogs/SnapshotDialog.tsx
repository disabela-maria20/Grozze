import { META, SESSIONS, allBaseMovieIds, allCinemas } from "../../../lib/catalog";

export function SnapshotDialog() {
  return (
    <div>
      <h2 className="text-[28px] m-0 mb-3 pr-10">Sobre esta homologação</h2>
      <p className="text-sm text-muted leading-relaxed mb-5">{META.caveat}</p>
      <dl className="grid grid-cols-2 gap-4 mb-5">
        {[
          ["Catálogo unificado", `${allBaseMovieIds().length} filmes`],
          ["Programação", `${SESSIONS.length} sessões na amostra`],
          ["Cinemas", `${allCinemas().length} em São Paulo`],
          ["Integração ao vivo", "Não conectada"],
        ].map(([dt, dd]) => (
          <div key={dt}>
            <dt className="text-[11px] uppercase text-faint tracking-wide">{dt}</dt>
            <dd className="mt-1 text-base font-semibold">{dd}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-faint leading-relaxed">
        Autenticação, CMS e leads funcionam localmente para testes. Checkout, entrega de e-mails, atualização automática e controle
        administrativo seguro dependem de backend. Dados de IMDb, artes e vídeos foram preservados do arquivo de origem e não
        revalidados nesta revisão.
      </p>
    </div>
  );
}
