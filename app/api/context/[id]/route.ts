/**
 * Context by ID API Route
 *
 * Retrieves a specific context by ID for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ContextModules } from '@/lib/ai/context-generator';

export interface ContextDetailResponse {
  success: boolean;
  context?: {
    id: string;
    createdAt: string;
    isActive: boolean;
    modules: ContextModules;
    fullContext: string;
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ContextDetailResponse>> {
  try {
    // Get authenticated user ID from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch the specific context
    const userContext = await prisma.userContext.findFirst({
      where: {
        id,
        userId, // Ensure the context belongs to the user
      },
    });

    if (!userContext) {
      return NextResponse.json(
        { success: false, error: 'Context not found' },
        { status: 404 }
      );
    }

    // Reconstruct modules from database
    // Note: personalityContext stores 'communication' from ContextModules
    const modules: ContextModules = {
      communication: userContext.personalityContext || '',
      expertise: userContext.expertiseContext || '',
      goals: userContext.goalsContext || '',
      comprehensive: userContext.fullContext || '',
    };

    return NextResponse.json({
      success: true,
      context: {
        id: userContext.id,
        createdAt: userContext.createdAt.toISOString(),
        isActive: userContext.isActive,
        modules,
        fullContext: userContext.fullContext || '',
      },
    });

  } catch (error) {
    console.error('Context detail API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve context' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    // Get authenticated user ID from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership before deleting
    const existingContext = await prisma.userContext.findFirst({
      where: { id, userId },
    });

    if (!existingContext) {
      return NextResponse.json(
        { success: false, error: 'Context not found' },
        { status: 404 }
      );
    }

    // Delete the context
    await prisma.userContext.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Context delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete context' },
      { status: 500 }
    );
  }
}
