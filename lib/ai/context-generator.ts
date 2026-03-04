/**
 * Context Generator
 * 
 * Generates AI-ready context modules from discovery responses
 */

import { glmClient } from './glm-client';

// ============================================================================
// Types
// ============================================================================

export interface DiscoveryResponses {
  compass: { value: string; beneficiaries: string; emotionalLanguage?: string[] };
  engine: { beautifulProblem: string; processDriver: string };
  toolkit: { instinct: string; reasoning: string };
  proof?: { accomplishment: string; process: string; meaning: string; obstacles?: string[] };
}

export interface ContextModules {
  communication: string;   // How to communicate with this person
  expertise: string;       // Their background and skills
  goals: string;           // What they're working toward
  comprehensive: string;   // All combined (400-600 words)
}

// ============================================================================
// Generation Prompts
// ============================================================================

const COMMUNICATION_PROMPT = `You are creating a communication context module for an AI assistant.

Based on this person's discovery responses, write a brief guide (100-150 words) on how to best communicate with them.

Discovery Data:
- Compass (Values): {compass}
- Engine (Passions): {engine}
- Toolkit (Strengths): {toolkit}

Write in second person ("When interacting with..."), focusing on:
- Preferred communication style and tone
- What they value in conversations
- How to build rapport with them
- Topics that resonate most

Keep it practical and actionable. Write naturally without section headers.`;

const EXPERTISE_PROMPT = `You are creating an expertise context module for an AI assistant.

Based on this person's discovery responses, write a brief summary (100-150 words) of their expertise and unique perspective.

Discovery Data:
- Compass (Values): {compass}
- Engine (Passions): {engine}
- Toolkit (Strengths): {toolkit}
- Proof (Accomplishment): {proof}

Write in third person, focusing on:
- Their domains of expertise (inferred from their passions)
- Unique perspective they bring
- How they approach problems
- What makes their thinking distinctive

Keep it insightful without over-claiming. Write naturally without section headers.`;

const GOALS_PROMPT = `You are creating a goals context module for an AI assistant.

Based on this person's discovery responses, write a brief summary (100-150 words) of what they're working toward.

Discovery Data:
- Compass (Values): {compass}
- Engine (Passions): {engine}
- Toolkit (Strengths): {toolkit}

Write in third person, focusing on:
- Their driving purpose and aspirations
- What motivates them at a deep level
- What they're seeking to accomplish
- How they want to make an impact

Be inspiring but grounded in what they shared. Write naturally without section headers.`;

const COMPREHENSIVE_PROMPT = `You are creating a comprehensive context module for an AI assistant.

Based on this person's discovery responses, write a unified context document (400-600 words) that captures their essence.

Discovery Data:
- Compass (Values & Purpose): {compass}
- Engine (Passions & "Beautiful Problem"): {engine}
- Toolkit (Strengths & Approach): {toolkit}
- Proof (Defining Accomplishment): {proof}

Write a cohesive narrative that:
1. Opens with their core identity - who they are at their best
2. Explains their values and what matters most to them
3. Describes what energizes them and why
4. Details their natural strengths and approach
5. Connects everything to their aspirations

The goal: Give any AI a complete picture of this person so interactions feel personal, relevant, and aligned with who they truly are.

Write in a warm, professional tone. Use natural paragraphs without section headers. Make it read like a thoughtful profile, not a list of facts.`;

// ============================================================================
// Helper Functions
// ============================================================================

function formatDiscoveryForPrompt(responses: DiscoveryResponses): string {
  const compass = `Value: ${responses.compass.value}
Beneficiaries: ${responses.compass.beneficiaries || 'Not specified'}
Emotional language: ${responses.compass.emotionalLanguage?.join(', ') || 'Natural conversation'}`;

  const engine = `Beautiful Problem: ${responses.engine.beautifulProblem}
Process Driver: ${responses.engine.processDriver}`;

  const toolkit = `Instinctive Strength: ${responses.toolkit.instinct}
Reasoning: ${responses.toolkit.reasoning}`;

  const proof = responses.proof 
    ? `Accomplishment: ${responses.proof.accomplishment}
Process: ${responses.proof.process}
Meaning: ${responses.proof.meaning}`
    : 'No specific accomplishment shared';

  return `COMPASS (Values & Purpose):
${compass}

ENGINE (Passions):
${engine}

TOOLKIT (Strengths):
${toolkit}

PROOF (Defining Story):
${proof}`;
}

// ============================================================================
// Main Generator Function
// ============================================================================

/**
 * Generate all context modules from discovery responses
 */
export async function generateContextModules(responses: DiscoveryResponses): Promise<ContextModules> {
  const formattedDiscovery = formatDiscoveryForPrompt(responses);

  // Generate all modules in parallel for speed
  const [communication, expertise, goals, comprehensive] = await Promise.all([
    generateModule(COMMUNICATION_PROMPT, formattedDiscovery),
    generateModule(EXPERTISE_PROMPT, formattedDiscovery),
    generateModule(GOALS_PROMPT, formattedDiscovery),
    generateModule(COMPREHENSIVE_PROMPT, formattedDiscovery),
  ]);

  return {
    communication,
    expertise,
    goals,
    comprehensive,
  };
}

/**
 * Generate a single module using GLM
 */
async function generateModule(promptTemplate: string, discoveryData: string): Promise<string> {
  const prompt = promptTemplate.replace('{compass}', discoveryData)
    .replace('{engine}', discoveryData)
    .replace('{toolkit}', discoveryData)
    .replace('{proof}', discoveryData);

  try {
    const response = await glmClient.chat(
      [
        { role: 'system', content: 'You are an expert at synthesizing personal insights into clear, actionable context for AI assistants. Write naturally and concisely.' },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.7, max_tokens: 800 }
    );

    return response.trim();
  } catch (error) {
    console.error('Context generation error:', error);
    // Return a fallback message
    return 'Unable to generate this context module. Please try again.';
  }
}

/**
 * Extract discovery responses from agent state's captured context
 */
export function extractResponsesFromState(state: {
  capturedContext: DiscoveryResponses;
}): DiscoveryResponses | null {
  const { compass, engine, toolkit } = state.capturedContext;

  // Ensure we have minimum required data
  if (!compass?.value || !engine?.beautifulProblem || !toolkit?.instinct) {
    return null;
  }

  return {
    compass: {
      value: compass.value,
      beneficiaries: compass.beneficiaries || '',
      emotionalLanguage: compass.emotionalLanguage || [],
    },
    engine: {
      beautifulProblem: engine.beautifulProblem,
      processDriver: engine.processDriver || '',
    },
    toolkit: {
      instinct: toolkit.instinct,
      reasoning: toolkit.reasoning || '',
    },
    proof: state.capturedContext.proof,
  };
}
