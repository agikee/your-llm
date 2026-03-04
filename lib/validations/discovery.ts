/**
 * Discovery API Validation Schemas
 */

import { z } from 'zod';

// Conversation phases
export const conversationPhaseSchema = z.enum([
  'introduction',
  'compass',
  'engine',
  'toolkit',
  'proof',
  'synthesis',
  'complete',
]);

// Conversation message schema
export const conversationMessageSchema = z.object({
  role: z.enum(['user', 'agent']),
  content: z.string().min(1).max(5000),
});

// Start action schema
export const startActionSchema = z.object({
  action: z.literal('start'),
});

// Respond action schema
export const respondActionSchema = z.object({
  action: z.literal('respond'),
  message: z.string().min(1).max(5000),
  currentPhase: conversationPhaseSchema,
  conversationHistory: z.array(conversationMessageSchema).optional(),
});

// Combined discovery request schema
export const discoveryRequestSchema = z.discriminatedUnion('action', [
  startActionSchema,
  respondActionSchema,
]);

export type ConversationPhase = z.infer<typeof conversationPhaseSchema>;
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type DiscoveryRequest = z.infer<typeof discoveryRequestSchema>;
