/**
 * Discovery API Route
 * 
 * Handles Compass agent conversation via API using Gemini
 */

import { NextRequest, NextResponse } from 'next/server';

// Gemini API Client
async function callGemini(
  messages: Array<{ role: 'system' | 'user' | 'model'; content: string }>,
  options?: { temperature?: number }
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
      temperature: options?.temperature ?? 0.8,
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

export type ConversationPhase = 
  | 'introduction'
  | 'compass'
  | 'engine' 
  | 'toolkit'
  | 'proof'
  | 'synthesis'
  | 'complete';

const SYSTEM_PROMPT = `You are Compass, a warm and insightful personal discovery guide. You help people uncover their core identity through meaningful conversation.

Your conversation has three phases:
1. COMPASS - Explore their values and what matters to them
2. ENGINE - Discover their passions and what energizes them  
3. TOOLKIT - Understand their natural strengths and approaches

Guidelines:
- Be warm, curious, and encouraging
- Reference what they just said before asking your next question
- Ask ONE thoughtful follow-up question at a time
- Keep responses SHORT (1-2 sentences max, be concise)
- Show genuine interest in their answers
- Help them discover insights about themselves

Start by welcoming them warmly and asking about what change they'd be proud to make in the world.`;

function getPhasePrompt(phase: ConversationPhase, userResponse: string): string {
  switch (phase) {
    case 'introduction':
      return `Welcome the user warmly and ask: "What change or contribution would you be most proud to make in the world?" Be inviting and warm.`;
    
    case 'compass':
      return `The user shared: "${userResponse}". Acknowledge what they said with genuine interest. Then ask ONE follow-up to go deeper: "That's beautiful - what does that actually look like in practice? And who benefits most from this?"`;
    
    case 'engine':
      return `Now explore their passions. The user shared about their values. Acknowledge it, then ask: "Every person has a 'beautiful problem' - a type of challenge they're naturally drawn to. What's yours? And what about the PROCESS of working on it energizes you?"`;
    
    case 'toolkit':
      return `Now explore their strengths. Acknowledge their previous answer, then ask: "Imagine you're dropped into a completely new situation with no playbook. What's the VERY FIRST approach or tool you reach for? Why does that feel natural to you?"`;
    
    case 'proof':
      return `Now ask for a story. Say: "I'd love to hear about a moment where you felt 'yeah, THAT'S me at my best.' Tell me what happened, what you did, and why it was meaningful to you."`;
    
    case 'synthesis':
      return `Synthesize what you've learned. Connect their values, passions, and strengths. Say something like: "Based on our conversation, I see that [reference their values], you're energized by [reference their passions], and you naturally approach things by [reference their strengths]. These connect because... Does this resonate with you?"`;
    
    case 'complete':
      return `Thank them warmly. Say their personal context has been captured and they can use it with any AI for more personalized conversations.`;
    
    default:
      return `Ask a thoughtful follow-up question based on what they shared.`;
  }
}

function determineNextPhase(currentPhase: ConversationPhase, userResponse: string): ConversationPhase {
  const phases: ConversationPhase[] = ['introduction', 'compass', 'engine', 'toolkit', 'proof', 'synthesis', 'complete'];
  const currentIndex = phases.indexOf(currentPhase);
  
  // Advance phase if user gave a meaningful response (5+ words)
  const wordCount = userResponse.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 5 && currentIndex < phases.length - 1) {
    return phases[currentIndex + 1];
  }
  
  return currentPhase;
}

function getFallbackMessage(phase: ConversationPhase): string {
  const fallbacks: Record<ConversationPhase, string> = {
    introduction: "Hey there! I'm Compass, and I'm here to help you discover what makes you uniquely you. Let's start with something meaningful: What change or contribution would you be most proud to make in the world?",
    compass: "That's really meaningful. Tell me more - what does that actually look like in practice? And who benefits most from this?",
    engine: "Fascinating. Now I'm curious - what type of challenge or problem energizes you most? What about working on it excites you?",
    toolkit: "Great insights! Now imagine you're in a completely new situation with no playbook. What's your go-to approach? Why does that feel natural?",
    proof: "I'd love to hear about a moment where you felt at your absolute best. What happened, what did you do, and why was it meaningful?",
    synthesis: "Based on everything you've shared, I see a beautiful pattern emerging in your values, passions, and natural strengths. Does this journey feel clear to you now?",
    complete: "Thank you so much for sharing! Your personal context has been captured. You can now use it with any AI for more personalized, meaningful conversations.",
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
        // Build proper message array for Gemini
        const messages: Array<{ role: 'system' | 'user' | 'model'; content: string }> = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: getPhasePrompt(phase, '') },
        ];
        
        const response = await callGemini(messages, { temperature: 0.8 });
        
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
      
      // Build conversation history in proper format
      const messages: Array<{ role: 'system' | 'user' | 'model'; content: string }> = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];
      
      // Add conversation history
      if (conversationHistory && Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role === 'agent' ? 'model' : 'user',
            content: msg.content,
          });
        }
      }
      
      // Add current user message
      messages.push({ role: 'user', content: message });
      
      // Add phase instruction
      messages.push({ 
        role: 'user', 
        content: `[Now respond as Compass in the ${nextPhase} phase. ${getPhasePrompt(nextPhase, message)}]` 
      });
      
      try {
        const response = await callGemini(messages, { temperature: 0.8 });
        
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
