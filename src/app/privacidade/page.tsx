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
        <div className="border-l-[3px] border-lime p-3.5 px-4.5 bg-lime-soft rounded-r-xl text-sm mb-5.5">
          Informações desta homologação. A política de produção precisa
          identificar o controlador, os canais de atendimento, os prazos de
          retenção e as integrações efetivamente utilizadas antes da publicação.
        </div>
        <h2 className="text-2xl mt-7 mb-2.5">Dados neste protótipo</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          Nome, e-mail, favoritos, preferências e formulários enviados são
          guardados neste navegador. Não há cadastro em servidor nem envio
          automático a um CRM. Não use dados sensíveis ou credenciais reais para
          testar.
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
          Você pode rever a escolha de cookies no painel abaixo. Neste
          protótipo, não há ferramentas de publicidade ou analytics ativas.
          Limpar os dados do site no navegador remove o armazenamento local.
        </p>
        <CookiePreferencesButton />
        <h2 className="text-2xl mt-7 mb-2.5">Contato</h2>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">
          O formulário de contato registra apenas uma mensagem local para
          homologação. O atendimento real e o canal do controlador devem ser
          configurados antes da operação pública.
        </p>
      </article>
    </div>
  );
}
