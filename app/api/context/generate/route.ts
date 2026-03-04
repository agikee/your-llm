/**
 * Context Generation API Route
 *
 * Generates AI context modules from discovery session data
 * Stores contexts in database associated with authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateContextModules,
  extractResponsesFromState,
  type DiscoveryResponses,
  type ContextModules
} from '@/lib/ai/context-generator';
import { prisma } from '@/lib/db/prisma';
import { validate, contextGenerateRequestSchema, contextGetRequestSchema } from '@/lib/validations';

export interface GenerateRequest {
  sessionId: string;
  discoveryData?: DiscoveryResponses;
}

export interface GenerateResponse {
  success: boolean;
  modules?: ContextModules;
  contextId?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    // Get authenticated user ID from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request
    const validationResult = validate(contextGenerateRequestSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    const { sessionId, discoveryData } = validationResult.data;

    // Check if we already generated context for this session
    const existingContext = await prisma.userContext.findFirst({
      where: {
        userId,
        fullContext: { contains: sessionId },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingContext && existingContext.personalityContext && existingContext.expertiseContext && existingContext.goalsContext) {
      // Reconstruct modules from database
      // Note: personalityContext stores 'communication' from ContextModules
      const modules: ContextModules = {
        communication: existingContext.personalityContext,
        expertise: existingContext.expertiseContext,
        goals: existingContext.goalsContext,
        comprehensive: existingContext.fullContext || '',
      };

      return NextResponse.json({
        success: true,
        modules,
        contextId: existingContext.id,
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
    const modules = await generateContextModules(discoveryData as DiscoveryResponses);

    // Build full context string
    const fullContext = `[Session: ${sessionId}]

[Communication]
${modules.communication}

[Expertise]
${modules.expertise}

[Goals]
${modules.goals}

[Comprehensive]
${modules.comprehensive}`;

    // Deactivate previous contexts for this user
    await prisma.userContext.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Store in database
    // Note: personalityContext stores 'communication' from ContextModules
    const userContext = await prisma.userContext.create({
      data: {
        userId,
        personalityContext: modules.communication,
        expertiseContext: modules.expertise,
        goalsContext: modules.goals,
        fullContext,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      modules,
      contextId: userContext.id,
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
  try {
    // Get authenticated user ID from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = { contextId: searchParams.get('contextId') || undefined };

    // Validate query params
    const validationResult = validate(contextGetRequestSchema, queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    const { contextId } = validationResult.data;

    // If contextId provided, get specific context
    if (contextId) {
      const userContext = await prisma.userContext.findFirst({
        where: {
          id: contextId,
          userId,
        },
      });

      if (!userContext) {
        return NextResponse.json(
          { success: false, error: 'Context not found' },
          { status: 404 }
        );
      }

      // Note: personalityContext stores 'communication' from ContextModules
      const modules: ContextModules = {
        communication: userContext.personalityContext || '',
        expertise: userContext.expertiseContext || '',
        goals: userContext.goalsContext || '',
        comprehensive: userContext.fullContext || '',
      };

      return NextResponse.json({
        success: true,
        modules,
        contextId: userContext.id,
      });
    }

    // Otherwise, get the active context for the user
    const activeContext = await prisma.userContext.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeContext) {
      return NextResponse.json(
        { success: false, error: 'No active context found. Please complete discovery first.' },
        { status: 404 }
      );
    }

    // Note: personalityContext stores 'communication' from ContextModules
    const modules: ContextModules = {
      communication: activeContext.personalityContext || '',
      expertise: activeContext.expertiseContext || '',
      goals: activeContext.goalsContext || '',
      comprehensive: activeContext.fullContext || '',
    };

    return NextResponse.json({
      success: true,
      modules,
      contextId: activeContext.id,
    });

  } catch (error) {
    console.error('Context retrieval API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve context' },
      { status: 500 }
    );
  }
}
