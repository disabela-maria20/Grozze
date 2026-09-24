"use client";

import { useState } from "react";
import { useAppStore } from "@/shared/store/store";
import { Button, Field, TextLink, inputClass } from "@/shared/ui/ui";

export function AuthDialog({ signup: initialSignup }: { signup?: boolean }) {
  const [signup, setSignup] = useState(!!initialSignup);
  const completeLogin = useAppStore((s) => s.completeLogin);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    completeLogin(signup ? name : "", email, signup, consent);
  };

  const demoLogin = () => {
    completeLogin("Henrique", "henrique@grozze.demo");
  };

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">{signup ? "Criar minha conta" : "Entrar"}</h2>
      <p className="text-sm text-muted leading-relaxed">
        {signup ? "Guarde seus filmes e cinemas favoritos." : "Continue de onde parou."}
      </p>
      <div className="grid grid-cols-2 gap-2.5 my-5">
        <Button disabled title="Integração não conectada nesta homologação">
          Google
        </Button>
        <Button disabled title="Integração não conectada nesta homologação">
          Apple
        </Button>
      </div>
      <p className="text-xs text-faint leading-relaxed mb-4">
        Identificação de teste. Google e Apple ainda não estão conectados; não use credenciais reais.
      </p>
      <form onSubmit={submit}>
        {signup && (
          <Field label="Nome">
            <input className={inputClass} name="name" required maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        )}
        <Field label="E-mail">
          <input
            className={inputClass}
            name="email"
            type="email"
            placeholder="nome@exemplo.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {!signup && (
          <Field label="Senha de teste">
            <input className={inputClass} name="password" type="password" defaultValue="demonstracao" autoComplete="off" />
            <small className="text-xs text-faint">A senha não é validada nem armazenada.</small>
          </Field>
        )}
        {signup && (
          <label className="flex items-start gap-2.5 text-[13px] mb-4">
            <input type="checkbox" className="accent-lime w-[18px] h-[18px] shrink-0 mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>Quero receber novidades (opcional).</span>
          </label>
        )}
        <Button primary full type="submit">
          {signup ? "Criar conta de teste" : "Entrar na homologação"}
        </Button>
      </form>
      <div className="mt-3">
        <Button full onClick={demoLogin}>
          Entrar como usuário de teste
        </Button>
      </div>
      <div className="text-[11px] text-faint text-center my-4 tracking-[0.12em]">{signup ? "Já tem conta?" : "Ainda não tem conta?"}</div>
      <TextLink full onClick={() => setSignup((v) => !v)}>
        {signup ? "Entrar" : "Criar minha conta"}
      </TextLink>
    </div>
  );
}
