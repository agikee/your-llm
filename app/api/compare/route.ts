import { NextRequest, NextResponse } from 'next/server';
import { glmClient } from '@/lib/ai/glm-client';

// Sample context for demo purposes
const sampleContext = `
[Communication]
When interacting with Jeff, be direct and action-oriented. He values efficiency and dislikes fluff. Use concrete examples and avoid abstract concepts.

[Expertise]
Jeff is a product leader with 10+ years experience in B2B SaaS. He understands technical concepts but prefers business-focused discussions.

[Goals]
Jeff is building an AI-powered platform. He's looking for practical implementation advice, not theoretical discussions.
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, context } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const useContext = context || sampleContext;

    // Make both API calls in parallel
    const [withoutContext, withContext] = await Promise.all([
      // Call 1: Without context - just the question
      glmClient.chat([
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide thoughtful, balanced advice.'
        },
        { role: 'user', content: question }
      ], { temperature: 0.7, max_tokens: 1000 }),

      // Call 2: With context - question + user context
      glmClient.chat([
        {
          role: 'system',
          content: `You are a helpful AI assistant with deep knowledge of your user's context.

Here is what you know about your user:
${useContext}

Use this context to personalize your response. Be specific to their situation, reference their expertise level, and align with their stated goals and communication preferences. Make your advice actionable and relevant to their context.`
        },
        { role: 'user', content: question }
      ], { temperature: 0.7, max_tokens: 1000 })
    ]);

    return NextResponse.json({
      withoutContext,
      withContext
    });
  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}
