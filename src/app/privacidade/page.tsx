import type { Metadata } from 'next';
import { CookiePreferencesButton } from '@/features/shell';

export const metadata: Metadata = { title: 'Privacidade' };

export default function Page() {
  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <article className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <h1 className="text-[46px] max-sm:text-[35px] leading-[1.1] -tracking-[0.045em] mb-5">
          Política de Privacidade
        </h1>
        <h2 className="text-2xl mt-7 mb-2.5">Dados armazenados</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          Nome, e-mail, favoritos, preferências e formulários enviados são
          guardados neste navegador. Não há cadastro em servidor nem envio
          automático a um CRM.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">Localização</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          A localização exata só é solicitada ao selecionar a opção de
          geolocalização. Ela é usada na sessão para calcular proximidade dos
          cinemas; não é enviada a um servidor da Grozze nesta versão.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">Serviços externos</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          Imagens remotas podem ser carregadas dos endereços existentes no
          catálogo. O player de trailer e o mapa são carregados apenas quando
          acionados e utilizam serviços externos, sujeitos às políticas dos
          respectivos provedores.
        </p>
        <h2 className="text-2xl mt-7 mb-2.5">Preferências e controle</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75] mb-4">
          Você pode rever a escolha de cookies no painel abaixo. Não há
          ferramentas de publicidade ou analytics ativas. Limpar os dados do
          site no navegador remove o armazenamento local.
        </p>
        <CookiePreferencesButton />
        <h2 className="text-2xl mt-7 mb-2.5">Contato</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          As mensagens enviadas pelo formulário de contato ficam armazenadas
          neste navegador.
        </p>
      </article>
    </div>
  );
}
