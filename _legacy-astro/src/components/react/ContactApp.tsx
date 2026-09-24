import { useState } from "react";
import { useAppStore } from "../../lib/store";
import { Button, Field, inputClass } from "./ui";

export function ContactApp({ newsletter = false }: { newsletter?: boolean }) {
  const captureLead = useAppStore((s) => s.captureLead);
  const toast = useAppStore((s) => s.toast);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    captureLead({
      source: newsletter ? "Newsletter" : "Contato",
      name,
      email,
      message,
      marketingConsent: consent,
    });
    setName("");
    setEmail("");
    setMessage("");
    setConsent(false);
    setSent((s) => s + 1);
    toast("Registro salvo para homologação. Nenhum e-mail foi enviado.");
  };

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">{newsletter ? "Fique por dentro" : "Fale com a Grozze"}</h1>
          <p className="text-muted text-[15px]">{newsletter ? "Estreias e novidades que você quer acompanhar." : "Deixe sua mensagem."}</p>
        </header>
        <form key={sent} className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app" onSubmit={submit}>
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4.5">
            <Field label="Nome">
              <input className={inputClass} required maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="E-mail">
              <input className={inputClass} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>
          {!newsletter && (
            <Field label="Mensagem">
              <textarea
                className={`${inputClass} min-h-[110px] resize-y`}
                maxLength={3000}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
          )}
          <label className="flex items-start gap-2.5 text-[13px] mb-4.5">
            <input type="checkbox" required={newsletter} checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-lime w-[18px] h-[18px] shrink-0 mt-0.5" />
            <span>
              {newsletter ? "Autorizo o recebimento da newsletter." : "Desejo receber novidades por e-mail (opcional)."}{" "}
              <a className="underline hover:text-lime" href="/privacidade">
                Política de Privacidade
              </a>
              .
            </span>
          </label>
          <p className="text-xs text-faint mb-4">Formulário de homologação: o envio é registrado localmente, sem mensagem real.</p>
          <Button primary type="submit">
            {newsletter ? "Cadastrar" : "Enviar mensagem"}
          </Button>
        </form>
      </div>
    </div>
  );
}
