/**
 * Context Generation API Validation Schemas
 */

import { z } from 'zod';

// Compass response schema
export const compassResponseSchema = z.object({
  value: z.string().min(1).max(2000),
}).optional();

// Engine response schema
export const engineResponseSchema = z.object({
  beautifulProblem: z.string().min(1).max(2000),
  energizers: z.string().optional(),
}).optional();

// Toolkit response schema
export const toolkitResponseSchema = z.object({
  instinct: z.string().min(1).max(2000),
  tools: z.string().optional(),
}).optional();

// Proof response schema
export const proofResponseSchema = z.object({
  story: z.string().min(1).max(5000),
}).optional();

// Discovery data schema
export const discoveryDataSchema = z.object({
  compass: compassResponseSchema,
  engine: engineResponseSchema,
  toolkit: toolkitResponseSchema,
  proof: proofResponseSchema.optional(),
}).optional();

// Context generation request schema
export const contextGenerateRequestSchema = z.object({
  sessionId: z.string()
    .min(1, 'Session ID is required')
    .max(100, 'Session ID must be 100 characters or less'),
  discoveryData: discoveryDataSchema,
});

// Context retrieval request schema (for query params)
export const contextGetRequestSchema = z.object({
  contextId: z.string()
    .max(100, 'Context ID must be 100 characters or less')
    .optional(),
});

export type DiscoveryData = z.infer<typeof discoveryDataSchema>;
export type ContextGenerateRequest = z.infer<typeof contextGenerateRequestSchema>;
export type ContextGetRequest = z.infer<typeof contextGetRequestSchema>;
