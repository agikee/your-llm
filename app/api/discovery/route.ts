/**
 * Discovery API Route
 * 
 * Handles Compass agent conversation via API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCompassAgent, type ConversationPhase } from '@/lib/ai/compass-agent';

// In-memory session storage (use database in production)
const sessions = new Map<string, ReturnType<typeof createCompassAgent>>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, message } = body;

    // Get or create session
    let agent = sessions.get(sessionId);
    if (!agent) {
      agent = createCompassAgent();
      sessions.set(sessionId, agent);
    }

    let response: { message: string; phase: ConversationPhase; isComplete: boolean };

    switch (action) {
      case 'start':
        const welcomeMessage = await agent.getNextMessage();
        response = {
          message: welcomeMessage,
          phase: agent.getPhase(),
          isComplete: false,
        };
        break;

      case 'respond':
        if (!message) {
          return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }
        await agent.processUserResponse(message);
        const nextMessage = await agent.getNextMessage();
        const phase = agent.getPhase();
        response = {
          message: nextMessage,
          phase,
          isComplete: phase === 'complete',
        };
        break;

      case 'status':
        const state = agent.getState();
        response = {
          message: '',
          phase: state.phase,
          isComplete: state.phase === 'complete',
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Discovery API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
