/**
 * Context Generation API Route
 * 
 * Generates AI context modules from discovery session data
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateContextModules, 
  extractResponsesFromState,
  type DiscoveryResponses,
  type ContextModules 
} from '@/lib/ai/context-generator';

// In-memory storage for generated contexts (use database in production)
const generatedContexts = new Map<string, ContextModules>();

// Import the sessions map from discovery route (in production, use shared database)
// For now, we'll accept the discovery data directly in the request

export interface GenerateRequest {
  sessionId: string;
  discoveryData?: DiscoveryResponses;
}

export interface GenerateResponse {
  success: boolean;
  modules?: ContextModules;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body = await request.json() as GenerateRequest;
    const { sessionId, discoveryData } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Check if we already generated context for this session
    const existing = generatedContexts.get(sessionId);
    if (existing) {
      return NextResponse.json({
        success: true,
        modules: existing,
      });
    }

    // We need discovery data to generate context
    if (!discoveryData) {
      return NextResponse.json(
        { success: false, error: 'Discovery data required' },
        { status: 400 }
      );
    }

    // Validate minimum required data
    const { compass, engine, toolkit } = discoveryData;
    if (!compass?.value || !engine?.beautifulProblem || !toolkit?.instinct) {
      return NextResponse.json(
        { success: false, error: 'Incomplete discovery data. Please complete the discovery conversation first.' },
        { status: 400 }
      );
    }

    // Generate context modules
    const modules = await generateContextModules(discoveryData);

    // Store for future retrieval
    generatedContexts.set(sessionId, modules);

    return NextResponse.json({
      success: true,
      modules,
    });

  } catch (error) {
    console.error('Context generation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate context modules' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Session ID required' },
      { status: 400 }
    );
  }

  const modules = generatedContexts.get(sessionId);
  if (!modules) {
    return NextResponse.json(
      { success: false, error: 'No context found for this session' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    modules,
  });
}
