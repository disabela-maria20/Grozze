/**
 * Contratos (payloads e respostas) da API do Grozze.
 * Os mesmos tipos valem para o mock (`./mock`) e para o backend real.
 */
import type { AuditEntry, ConsentState, ContentState, Lead, MovieOverride, Preferences, Profile } from "@/shared/lib/types";

export type { AuditEntry, ConsentState, ContentState, Lead, MovieOverride, Preferences, Profile };

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Corpo de erro padrão retornado pela API. */
export interface ApiErrorBody {
  error: { code: string; message: string };
}

/* ---------- Autenticação ---------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  marketingConsent: boolean;
}

export interface AuthResponse {
  token: string;
  user: Profile;
}

/* ---------- Conta ---------- */

export type AvatarId = Profile["avatar"];

export interface UpdateMeRequest {
  name?: string;
  avatar?: AvatarId;
  preferences?: Preferences;
}

export type FavoriteKind = "movies" | "cinemas";

export interface FavoritesResponse {
  savedMovies: string[];
  savedCinemas: string[];
}

/* ---------- Leads e contato ---------- */

export type LeadSource = "Contato" | "Newsletter" | "Cadastro";

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
export type MovieOverrideInput = Partial<Record<Exclude<keyof MovieOverride, "cast">, string>> & {
  cast?: string[] | string;
};
