import { z } from 'zod';

/** Zod fields reused by forms across features. */

export const nameField = z
  .string()
  .trim()
  .min(1, 'Informe seu nome.')
  .max(80, 'Use até 80 caracteres.');

export const emailField = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .max(254, 'O e-mail deve possuir no máximo 254 caracteres.')
  .pipe(z.email('Informe um e-mail válido.'));

/**
 * Same rule as the Grozze API. The 72 limit counts bytes (accents take two)
 * because bcrypt ignores anything after the 72nd byte.
 */
export const newPasswordField = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    'A senha deve possuir no máximo 72 caracteres.'
  );
