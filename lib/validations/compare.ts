/**
 * Compare API Validation Schemas
 */

import { z } from 'zod';

// Compare request schema
export const compareRequestSchema = z.object({
  question: z.string()
    .min(1, 'Question is required')
    .max(2000, 'Question must be 2000 characters or less'),
  context: z.string()
    .max(10000, 'Context must be 10000 characters or less')
    .optional(),
});

export type CompareRequest = z.infer<typeof compareRequestSchema>;
