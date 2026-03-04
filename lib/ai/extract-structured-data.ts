/**
 * Extract structured data from user responses using LLM
 * 
 * Replaces simple truncation with meaningful extraction of:
 * - value: The main value/purpose (1-2 sentences)
 * - beneficiaries: Who benefits from this
 * - emotionalLanguage: Array of emotional keywords
 */

import { glmClient } from './glm-client';

export interface ExtractedCompassData {
  value: string;
  beneficiaries: string;
  emotionalLanguage: string[];
}

export interface ExtractedEngineData {
  beautifulProblem: string;
  processDriver: string;
}

export interface ExtractedToolkitData {
  instinct: string;
  reasoning: string;
}

export interface ExtractedProofData {
  accomplishment: string;
  process: string;
  meaning: string;
  obstacles?: string[];
}

const EXTRACTION_PROMPTS = {
  compass: `Extract the core value/purpose and who benefits from this response.
Return ONLY a JSON object with these fields:
- value: The main value or purpose in 1-2 concise sentences (max 200 chars)
- beneficiaries: Who benefits from this (comma-separated if multiple)
- emotionalLanguage: Array of emotional/meaningful keywords from the response

Response to analyze:`,

  engine: `Extract the "beautiful problem" and process driver from this response.
Return ONLY a JSON object with these fields:
- beautifulProblem: The type of challenge they're drawn to (1-2 sentences, max 200 chars)
- processDriver: What energizes them about the PROCESS (1 sentence)

Response to analyze:`,

  toolkit: `Extract the instinct and reasoning from this response.
Return ONLY a JSON object with these fields:
- instinct: Their go-to approach or tool (1-2 sentences, max 200 chars)
- reasoning: Why they reach for that approach (1 sentence)

Response to analyze:`,

  proof: `Extract accomplishment details from this response.
Return ONLY a JSON object with these fields:
- accomplishment: What they did (1-2 sentences, max 200 chars)
- process: How they approached it (1 sentence)
- meaning: Why it was meaningful (1 sentence)
- obstacles: Array of obstacles mentioned (if any)

Response to analyze:`,
};

/**
 * Extract compass data (values/purpose) from user response
 */
export async function extractCompassData(response: string): Promise<ExtractedCompassData> {
  const fallback: ExtractedCompassData = {
    value: response.slice(0, 200),
    beneficiaries: '',
    emotionalLanguage: [],
  };

  try {
    const result = await glmClient.chat(
      [
        { role: 'system', content: EXTRACTION_PROMPTS.compass },
        { role: 'user', content: response },
      ],
      { temperature: 0.3, max_tokens: 200 }
    );

    const parsed = JSON.parse(cleanJsonResponse(result));
    return {
      value: parsed.value?.slice(0, 200) || fallback.value,
      beneficiaries: parsed.beneficiaries || '',
      emotionalLanguage: Array.isArray(parsed.emotionalLanguage) ? parsed.emotionalLanguage : [],
    };
  } catch (error) {
    console.error('Compass extraction error:', error);
    return fallback;
  }
}

/**
 * Extract engine data (passions/motivations) from user response
 */
export async function extractEngineData(response: string): Promise<ExtractedEngineData> {
  const fallback: ExtractedEngineData = {
    beautifulProblem: response.slice(0, 200),
    processDriver: '',
  };

  try {
    const result = await glmClient.chat(
      [
        { role: 'system', content: EXTRACTION_PROMPTS.engine },
        { role: 'user', content: response },
      ],
      { temperature: 0.3, max_tokens: 200 }
    );

    const parsed = JSON.parse(cleanJsonResponse(result));
    return {
      beautifulProblem: parsed.beautifulProblem?.slice(0, 200) || fallback.beautifulProblem,
      processDriver: parsed.processDriver || '',
    };
  } catch (error) {
    console.error('Engine extraction error:', error);
    return fallback;
  }
}

/**
 * Extract toolkit data (strengths/instincts) from user response
 */
export async function extractToolkitData(response: string): Promise<ExtractedToolkitData> {
  const fallback: ExtractedToolkitData = {
    instinct: response.slice(0, 200),
    reasoning: '',
  };

  try {
    const result = await glmClient.chat(
      [
        { role: 'system', content: EXTRACTION_PROMPTS.toolkit },
        { role: 'user', content: response },
      ],
      { temperature: 0.3, max_tokens: 200 }
    );

    const parsed = JSON.parse(cleanJsonResponse(result));
    return {
      instinct: parsed.instinct?.slice(0, 200) || fallback.instinct,
      reasoning: parsed.reasoning || '',
    };
  } catch (error) {
    console.error('Toolkit extraction error:', error);
    return fallback;
  }
}

/**
 * Extract proof data (accomplishment story) from user response
 */
export async function extractProofData(response: string): Promise<ExtractedProofData> {
  const fallback: ExtractedProofData = {
    accomplishment: response.slice(0, 200),
    process: '',
    meaning: '',
    obstacles: [],
  };

  try {
    const result = await glmClient.chat(
      [
        { role: 'system', content: EXTRACTION_PROMPTS.proof },
        { role: 'user', content: response },
      ],
      { temperature: 0.3, max_tokens: 250 }
    );

    const parsed = JSON.parse(cleanJsonResponse(result));
    return {
      accomplishment: parsed.accomplishment?.slice(0, 200) || fallback.accomplishment,
      process: parsed.process || '',
      meaning: parsed.meaning || '',
      obstacles: Array.isArray(parsed.obstacles) ? parsed.obstacles : [],
    };
  } catch (error) {
    console.error('Proof extraction error:', error);
    return fallback;
  }
}

/**
 * Clean JSON response by removing markdown code blocks if present
 */
function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}
