import { NextRequest, NextResponse } from 'next/server';

// Gemini API Client
async function callGemini(
  messages: Array<{ role: 'system' | 'user' | 'model'; content: string }>,
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in environment variables.');
  }

  const model = 'gemini-2.5-flash';
  
  // Convert messages to Gemini format
  const systemParts: { text: string }[] = [];
  const contents: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      systemParts.push({ text: msg.content });
    } else {
      contents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  const request = {
    contents,
    systemInstruction: systemParts.length > 0 ? { parts: systemParts } : undefined,
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      // No maxOutputTokens limit - let Gemini respond fully
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('Empty response from Gemini');
  }

  return content;
}

// Sample context for demo
const sampleContext = `
[Communication]
When interacting with Alex, be collaborative and supportive. Alex values thorough explanations and appreciates context before recommendations. Use examples to illustrate points.

[Expertise]
Alex is a creative professional with experience in design and content creation. They understand visual concepts and storytelling, preferring practical examples over theory.

[Goals]
Alex is building a personal brand and online presence. They're looking for actionable advice on content strategy and audience engagement.
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
      // Without context
      callGemini([
        { role: 'system', content: 'You are a helpful AI assistant. Provide thoughtful, balanced advice.' },
        { role: 'user', content: question },
      ], { temperature: 0.7, max_tokens: 800 }),

      // With context
      callGemini([
        { 
          role: 'system', 
          content: `You are a helpful AI assistant with deep knowledge of your user's context.

Here is what you know about your user:
${useContext}

Use this context to personalize your response. Be specific to their situation, reference their expertise level, and align with their stated goals and communication preferences. Make your advice actionable and relevant to their context.`
        },
        { role: 'user', content: question },
      ], { temperature: 0.7, max_tokens: 800 }),
    ]);

    return NextResponse.json({ withoutContext, withContext });
  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}
