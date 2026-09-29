import { z } from 'zod';

export const consentSchema = z.object({ optional: z.boolean() });

export type ConsentValues = z.input<typeof consentSchema>;
