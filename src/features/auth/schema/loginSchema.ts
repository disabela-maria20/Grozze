import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .max(254, 'O e-mail deve possuir no máximo 254 caracteres.')
    .email('Digite um e-mail válido.'),
  password: z
    .string()
    .min(1, 'Informe sua senha.')
    .max(128, 'A senha deve possuir no máximo 128 caracteres.'),
});

export type LoginValues = z.input<typeof loginSchema>;
