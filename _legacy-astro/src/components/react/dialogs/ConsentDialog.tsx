import { useState } from "react";
import { useAppStore } from "../../../lib/store";
import { Button } from "../ui";

export function ConsentDialog() {
  const consent = useAppStore((s) => s.consent);
  const saveConsent = useAppStore((s) => s.saveConsent);
  const [optional, setOptional] = useState(!!consent?.preferences);

  return (
    <div>
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">Privacidade</p>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">Preferências de cookies</h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Este é o mesmo controle usado no primeiro acesso. Não há publicidade ou analytics ativos nesta homologação.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveConsent(optional);
        }}
      >
        <div className="grid gap-3 my-5">
          <label className="flex gap-3.5 justify-between border border-line p-3.5 rounded-[13px]">
            <span>
              <strong className="block text-base">Necessários</strong>
              <small className="text-xs text-muted mt-1 block">Funcionamento e escolhas solicitadas por você.</small>
            </span>
            <input type="checkbox" checked disabled className="accent-lime w-5 h-5 shrink-0" />
          </label>
          <label className="flex gap-3.5 justify-between border border-line p-3.5 rounded-[13px]">
            <span>
              <strong className="block text-base">Preferências opcionais</strong>
              <small className="text-xs text-muted mt-1 block">Autorizar armazenamento de preferências adicionais.</small>
            </span>
            <input
              type="checkbox"
              checked={optional}
              onChange={(e) => setOptional(e.target.checked)}
              className="accent-lime w-5 h-5 shrink-0"
            />
          </label>
        </div>
        <div className="flex items-center gap-2.5">
          <Button primary type="submit">
            Salvar preferências
          </Button>
          <Button type="button" onClick={() => saveConsent(false)}>
            Somente essenciais
          </Button>
        </div>
      </form>
      <p className="text-xs text-faint mt-4.5">
        <a className="hover:text-lime" href="/privacidade">
          Política de Privacidade
        </a>{" "}
        ·{" "}
        <a className="hover:text-lime" href="/termos">
          Termos de Uso
        </a>
      </p>
    </div>
  );
}
