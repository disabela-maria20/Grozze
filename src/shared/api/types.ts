/**
 * Contratos (payloads e respostas) da API do Grozze.
 */
import type {
  AuditEntry,
  ConsentState,
  ContentState,
  Lead,
  MovieOverride,
  Preferences,
  Profile,
} from '@/shared/lib/types';

export type {
  AuditEntry,
  ConsentState,
  ContentState,
  Lead,
  MovieOverride,
  Preferences,
  Profile,
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Corpo de erro padrão retornado pela API. */
export interface ApiErrorBody {
  error: { code: string; message: string };
}

/* Autenticação, conta e favoritos: ver `./grozze/grozzeTypes` (API real). */

/* ---------- Leads e contato ---------- */

export type LeadSource = 'Contato' | 'Newsletter' | 'Cadastro';

export interface CreateLeadRequest {
  source: LeadSource;
  name: string;
  email: string;
  message?: string;
  marketingConsent?: boolean;
  scope?: string;
}

/** Payload da API SendMail já existente (ver api-sendmail.md). */
export interface SendMailRequest {
  to: string;
  from_email: string;
  from_name: string;
  assunto: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
}

/* ---------- Consentimento ---------- */

export type CreateConsentRequest = ConsentState;

/* ---------- CMS ---------- */

/** Campos aceitos pelo editor do CMS. `cast` pode vir como lista ou texto separado por vírgulas. */
export type MovieOverrideInput = Partial<
  Record<Exclude<keyof MovieOverride, 'cast'>, string>
> & {
  cast?: string[] | string;
};
