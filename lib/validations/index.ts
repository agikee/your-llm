/**
 * Validation Schemas Index
 *
 * Central export for all Zod validation schemas
 */

export * from './discovery';
export * from './compare';
export * from './context';
export * from './auth';

// Utility function to safely parse and return typed result or error
import { z } from 'zod';

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format error messages
  const errorMessages = result.error.issues.map(issue => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });

  return { success: false, error: errorMessages.join('; ') };
}
