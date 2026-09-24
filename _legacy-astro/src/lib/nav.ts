export const NAV: [string, string][] = [
  ["inicio", "Início"],
  ["filmes", "Filmes"],
  ["cinemas", "Cinemas"],
  ["em-breve", "Em breve"],
  ["noticias", "Notícias"],
];

export const SECONDARY_NAV: [string, string][] = [
  ["sobre", "Sobre"],
  ["faq", "Perguntas frequentes"],
  ["contato", "Contato"],
  ["privacidade", "Privacidade"],
  ["termos", "Termos de uso"],
];

export function pathFor(root: string): string {
  return root === "inicio" ? "/" : `/${root}`;
}
