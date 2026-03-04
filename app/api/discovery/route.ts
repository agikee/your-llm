/**
 * Discovery API Route
 * 
 * Handles Compass agent conversation via API using Gemini
 */

import { NextRequest, NextResponse } from 'next/server';

// Gemini API Client
async function callGemini(
  messages: Array<{ role: 'system' | 'user' | 'model'; content: string }>,
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = 'gemini-2.5-flash-preview-05-20';
  
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
      maxOutputTokens: options?.max_tokens ?? 500,
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

export type ConversationPhase = 
  | 'introduction'
  | 'compass'
  | 'engine' 
  | 'toolkit'
  | 'proof'
  | 'synthesis'
  | 'complete';

const SYSTEM_PROMPT = `You are Compass, a skilled interviewer and personal insight guide.

Your role: Help people uncover their core identity through guided conversation about:
- Compass: Values and purpose (what matters to them)
- Engine: Passions and motivations (their "beautiful problem")
- Toolkit: Strengths and instincts (how they naturally operate)

Communication style:
- Warm and conversational
- Genuinely curious
- Patient and encouraging
- Use natural language
- Ask ONE follow-up question at a time
- Be concise - 2-3 sentences max per response

IMPORTANT: 
- Keep responses SHORT (2-3 sentences)
- Ask only ONE question per response
- Reference what the user just said before asking your next question
- Be warm but efficient`;

function getPhasePrompt(phase: ConversationPhase, userJustSaid: string): string {
  switch (phase) {
    case 'introduction':
      return `Welcome the user warmly and ask: "What change or contribution would you be most proud to make in your life?" Keep it brief and inviting.`;
    
    case 'compass':
      return `The user just shared: "${userJustSaid.slice(0, 150)}". Acknowledge this, then ask ONE follow-up: "What does that look like in practice? Who benefits most?"`;
    
    case 'engine':
      return `The user shared about their passions. Acknowledge it, then ask: "What type of challenge or problem energizes you most? What about the process of tackling it excites you?"`;
    
    case 'toolkit':
      return `Acknowledge their response, then ask: "In an unfamiliar situation, what's your go-to approach or tool? Why does that feel natural?"`;
    
    case 'proof':
      return `Acknowledge their response, then ask: "Tell me about an accomplishment where you felt at your absolute best. What made it special?"`;
    
    case 'synthesis':
      return `Synthesize what you've learned about their values, passions, and strengths. Show how they connect. Ask: "Does this resonate with you?"`;
    
    case 'complete':
      return `Thank them warmly. Say their context has been captured and they can use it with any AI.`;
    
    default:
      return `Ask a thoughtful follow-up question.`;
  }
}

function determineNextPhase(currentPhase: ConversationPhase, userResponse: string): ConversationPhase {
  const phases: ConversationPhase[] = ['introduction', 'compass', 'engine', 'toolkit', 'proof', 'synthesis', 'complete'];
  const currentIndex = phases.indexOf(currentPhase);
  
  // If user gave a substantial response (10+ words), advance phase
  const wordCount = userResponse.trim().split(/\s+/).length;
  if (wordCount >= 10 && currentIndex < phases.length - 1) {
    return phases[currentIndex + 1];
  }
  
  return currentPhase;
}

function getFallbackMessage(phase: ConversationPhase): string {
  const fallbacks: Record<ConversationPhase, string> = {
    introduction: "Hey there! I'm Compass. Let's discover what makes you uniquely you. What change or contribution would you be most proud to make?",
    compass: "That's meaningful. What does that look like in practice? Who benefits most?",
    engine: "What type of challenge energizes you most? What about the process excites you?",
    toolkit: "In a new situation, what's your go-to approach? Why does that feel natural?",
    proof: "Tell me about an accomplishment where you felt at your best. What made it special?",
    synthesis: "I see a pattern in your answers. Does your path feel clear now?",
    complete: "Thank you for sharing! Your context has been captured.",
  };
  return fallbacks[phase];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, currentPhase, conversationHistory } = body;

    if (action === 'start') {
      const phase: ConversationPhase = 'introduction';
      
      try {
        const response = await callGemini([
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: getPhasePrompt(phase, '') },
        ], { temperature: 0.8, max_tokens: 200 });
        
        return NextResponse.json({ message: response, phase });
      } catch (error) {
        console.error('Gemini error:', error);
        return NextResponse.json({ message: getFallbackMessage(phase), phase });
      }
    }
    
    if (action === 'respond') {
      if (!message || !currentPhase) {
        return NextResponse.json({ error: 'Message and currentPhase required' }, { status: 400 });
      }
      
      // Determine next phase based on user response
      const nextPhase = determineNextPhase(currentPhase as ConversationPhase, message);
      
      // Build conversation context
      const history = conversationHistory || [];
      const conversationText = history
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join('\n\n');
      
      try {
        const response = await callGemini([
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `Conversation so far:\n${conversationText}\n\nUser just said: "${message}"\n\nCurrent phase: ${nextPhase}\n\n${getPhasePrompt(nextPhase, message)}` 
          },
        ], { temperature: 0.8, max_tokens: 200 });
        
        return NextResponse.json({ message: response, phase: nextPhase });
      } catch (error) {
        console.error('Gemini error:', error);
        return NextResponse.json({ message: getFallbackMessage(nextPhase), phase: nextPhase });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Discovery API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
