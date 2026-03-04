/**
 * Core TypeScript Types
 * 
 * Type definitions based on the Your LLM product brief
 */

// ============================================================================
// User & Profile Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Context & Discovery Types
// ============================================================================

export type DimensionType = 'personality' | 'expertise' | 'goals';

export interface Dimension {
  id: DimensionType;
  name: string;
  description: string;
  order: number;
}

export interface DiscoveryProgress {
  dimension: DimensionType;
  completed: boolean;
  completedAt?: Date;
  responses: QuestionResponse[];
}

export interface QuestionResponse {
  questionId: string;
  answer: string | string[];
  timestamp: Date;
}

export interface UserContext {
  id: string;
  userId: string;
  personalityContext: string | null;
  expertiseContext: string | null;
  goalsContext: string | null;
  fullContext: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AI & API Types
// ============================================================================

export interface GLMResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ContextGenerationRequest {
  dimension: DimensionType;
  responses: QuestionResponse[];
  existingContext?: string;
}

export interface ContextGenerationResponse {
  context: string;
  insights: string[];
  recommendations: string[];
}

// ============================================================================
// Before/After Comparison Types
// ============================================================================

export interface ComparisonRequest {
  userQuery: string;
  userContextId?: string;
}

export interface ComparisonResponse {
  withoutContext: string;
  withContext: string;
  improvementMetrics: {
    relevance: number;
    specificity: number;
    actionability: number;
    overall: number;
  };
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}
