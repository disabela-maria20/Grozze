export function NotFound() {
  return (
    <div className="page pt-[120px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] mx-auto border border-line rounded-app p-6 bg-surface text-muted">
        <h1 className="text-app-text text-[23px] tracking-tight m-0 mb-2">Página não encontrada</h1>
        <p>Este conteúdo não está disponível neste endereço.</p>
        <a
          className="min-h-[46px] px-5 py-2.5 rounded-full border border-line bg-white/[0.035] inline-flex items-center justify-center gap-2 text-sm font-semibold hover:bg-lime-soft hover:border-lime/40 transition-colors"
          href="/"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
