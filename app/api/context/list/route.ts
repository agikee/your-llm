/**
 * Context List API Route
 *
 * Lists all saved contexts for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export interface ContextListItem {
  id: string;
  createdAt: string;
  isActive: boolean;
  preview: string;
}

export interface ContextListResponse {
  success: boolean;
  contexts?: ContextListItem[];
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ContextListResponse>> {
  try {
    // Get authenticated user ID from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch all contexts for the user
    const contexts = await prisma.userContext.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        isActive: true,
        fullContext: true,
      },
    });

    // Format response with previews
    const formattedContexts: ContextListItem[] = contexts.map(ctx => ({
      id: ctx.id,
      createdAt: ctx.createdAt.toISOString(),
      isActive: ctx.isActive,
      preview: ctx.fullContext?.slice(0, 200) || '',
    }));

    return NextResponse.json({
      success: true,
      contexts: formattedContexts,
    });

  } catch (error) {
    console.error('Context list API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve contexts' },
      { status: 500 }
    );
  }
}
