import { z } from 'zod';

export const emailField = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .max(254, 'O e-mail deve possuir no máximo 254 caracteres.')
  .pipe(z.email('Informe um e-mail válido.'));
