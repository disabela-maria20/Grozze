import { z } from 'zod';

/** Zod fields reused by forms across features. */

export const nameField = z
  .string()
  .trim()
  .min(1, 'Informe seu nome.')
  .max(80, 'Use até 80 caracteres.');
