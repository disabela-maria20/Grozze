import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Perguntas frequentes' };

const ITEMS: [string, string][] = [
  [
    'A Grozze vende ingressos?',
    'A Grozze ajuda a encontrar a sessão. A compra e o atendimento do ingresso são realizados pelo parceiro de venda.',
  ],
  [
    'Preciso de uma conta para buscar sessões?',
    'Não. Filmes, cinemas, horários e informações públicas podem ser consultados sem login. A conta permite guardar favoritos.',
  ],
  [
    'Onde encontro meus favoritos?',
    'Em Minha Grozze, nas abas Filmes favoritos e Cinemas favoritos. Eles aparecem apenas quando você está identificado.',
  ],
  [
    'Como altero minha localização?',
    'Use o botão de localização no topo. A geolocalização é opcional e depende da sua autorização no navegador.',
  ],
  [
    'Posso mudar minhas preferências de cookies?',
    'Sim. O botão Preferências de cookies no rodapé e na sua conta abre o mesmo painel.',
  ],
  [
    'O que são horários simulados?',
    'Esta versão usa uma agenda de setembro de 2026. Parte das datas foi replicada para testar a navegação; a confirmação da sessão informa essa condição.',
  ],
];

export default function Page() {
  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <article className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <h1 className="text-[46px] max-sm:text-[35px] leading-[1.1] -tracking-[0.045em] mb-5">
          Perguntas frequentes
        </h1>
        <div className="divide-y divide-line">
          {ITEMS.map(([q, a]) => (
            <details key={q} className="py-4.5">
              <summary className="cursor-pointer text-xl">{q}</summary>
              <p className="text-[15px] text-[#c0cbc2] leading-relaxed mt-3">
                {a}
              </p>
            </details>
          ))}
        </div>
      </article>
    </div>
  );
}
