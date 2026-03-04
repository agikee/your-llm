import { NextRequest, NextResponse } from 'next/server';
import { glmClient } from '@/lib/ai/glm-client';

// Sample context for demo purposes
const sampleContext = `
[Communication]
When interacting with Alex, be collaborative and supportive. Alex values thorough explanations and appreciates context before recommendations. Use examples to illustrate points.

[Expertise]
Alex is a creative professional with experience in design and content creation. They understand visual concepts and storytelling, preferring practical examples over theory.

[Goals]
Alex is building a personal brand and online presence. They're looking for actionable advice on content strategy and audience engagement.
`;

// Fallback responses when GLM API fails
const fallbackResponses = {
  withoutContext: `I'd recommend taking a balanced approach. Consider your priorities, available resources, and timeline. Start by breaking down your goal into smaller, manageable steps. It's often helpful to seek advice from others who have faced similar challenges.

Without knowing more specifics about your situation, I can offer general guidance: focus on what matters most to you, be patient with the process, and don't hesitate to adjust your approach as you learn more.`,

  withContext: `Based on your creative background and focus on building a personal brand, here's my tailored advice:

1. **Leverage your visual storytelling skills** - Your experience in design gives you a unique advantage. Create visually compelling content that tells your story and showcases your expertise.

2. **Start with consistent content creation** - Pick one platform (I'd suggest the one where your target audience already spends time) and commit to posting regularly. Quality and consistency beat quantity.

3. **Build in public** - Share your journey, including the challenges. Your authentic approach will resonate with others building their own brands.

4. **Connect with your community** - Engage with others in your niche. Comment thoughtfully, collaborate when possible, and build genuine relationships.

Would you like me to elaborate on any of these points or discuss specific strategies for your content creation?`,
};

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
      ], { temperature: 0.7, max_tokens: 800 }).catch(() => {
        console.log('GLM API failed for withoutContext, using fallback');
        return null;
      }),

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
      ], { temperature: 0.7, max_tokens: 800 }).catch(() => {
        console.log('GLM API failed for withContext, using fallback');
        return null;
      })
    ]);

    return NextResponse.json({
      withoutContext: withoutContext || fallbackResponses.withoutContext,
      withContext: withContext || fallbackResponses.withContext
    });
  } catch (error) {
    console.error('Compare API error:', error);
    // Return fallback responses instead of error
    return NextResponse.json({
      withoutContext: fallbackResponses.withoutContext,
      withContext: fallbackResponses.withContext
    });
  }
}
