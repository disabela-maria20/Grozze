import { z } from 'zod';

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
