import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Termos de uso' };

export default function Page() {
  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <article className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <h1 className="text-[46px] max-sm:text-[35px] leading-[1.1] -tracking-[0.045em] mb-5">
          Termos de Uso
        </h1>
        <h2 className="text-2xl mt-7 mb-2.5">Consulta de filmes e sessões</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          As informações exibidas correspondem a uma amostra congelada da
          agenda. Parte das datas foi replicada para testar a experiência.
          Consulte a disponibilidade atual e os valores no canal responsável
          pela venda antes de comprar.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">
          Compra e responsabilidade pelo ingresso
        </h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          A confirmação desta interface não emite, reserva ou compra ingressos.
          Regras de preço, taxas, cancelamento, meia-entrada e acesso devem ser
          verificadas junto ao parceiro vendedor.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">Conta e favoritos</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          Favoritos e preferências da conta ficam armazenados neste navegador.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">
          Conteúdo e material promocional
        </h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          As artes e referências permanecem associadas aos titulares originais.
          A publicação comercial depende de autorização e das condições de uso
          de cada fonte.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">Privacidade</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75] mb-4">
          Consulte a Política de Privacidade para conhecer o uso de
          armazenamento e serviços externos nesta versão.
        </p>
        <a
          className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold"
          href="/privacidade"
        >
          Política de Privacidade
        </a>
      </article>
    </div>
  );
}
