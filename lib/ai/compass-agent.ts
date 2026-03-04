/**
 * Compass Discovery Agent
 * 
 * Implements the Compass-Engine-Toolkit discovery conversation flow
 */

import { glmClient } from './glm-client';

export type ConversationPhase = 
  | 'introduction'
  | 'compass'
  | 'engine' 
  | 'toolkit'
  | 'proof'
  | 'synthesis'
  | 'complete';

export interface ConversationMessage {
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
  phase: ConversationPhase;
}

export interface DiscoveryState {
  phase: ConversationPhase;
  messages: ConversationMessage[];
  capturedContext: {
    compass?: { value: string; beneficiaries: string; emotionalLanguage?: string[] };
    engine?: { beautifulProblem: string; processDriver: string };
    toolkit?: { instinct: string; reasoning: string };
    proof?: { accomplishment: string; process: string; meaning: string; obstacles?: string[] };
  };
  startedAt: Date;
  completedAt?: Date;
}

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
- Probe with follow-up questions
- Be concise - 2-3 sentences max per response

IMPORTANT: Keep your responses SHORT (2-3 sentences). Ask ONE question at a time. Be warm but efficient.`;

const PHASE_PROMPTS: Record<ConversationPhase, string> = {
  introduction: `Welcome the user warmly. Say: "Hey there! I'm Compass, and I'm here to help you discover what makes you uniquely you.

In about 15 minutes, we'll explore what matters to you, what energizes you, and how you naturally operate.

Let's start with something meaningful: Imagine looking back on your life from a place of fulfillment. What change or contribution would you be most proud to have made?"`,

  compass: `Ask about their values. Say: "That's beautiful. When you imagine making things better, what does that actually look like in practice? Who benefits most?"`,

  engine: `Ask about their passions. Say: "Every person has a 'beautiful problem' - a type of challenge they're drawn to instinctively. What's yours? What about the PROCESS of tackling it energizes you?"`,

  toolkit: `Ask about their strengths. Say: "Imagine you're in an unfamiliar situation with no playbook. What's the FIRST tool you reach for in your mental utility belt? Why that approach?"`,

  proof: `Ask for their proof story. Say: "Tell me about an accomplishment where you felt 'yeah, THAT'S me at my best.' What happened, what did you do, and why was it meaningful?"`,

  synthesis: `Deliver synthesis. Say: "Let me show you what I'm seeing: Your values point toward [reference their answers], your passion is [reference], and your strength is [reference]. These align because [synthesis]. Does that resonate?"`,

  complete: `Say: "Thank you for sharing! Your context is being generated. You can use it with any AI to get more personalized responses."`
};

export class CompassAgent {
  private state: DiscoveryState;

  constructor() {
    this.state = {
      phase: 'introduction',
      messages: [],
      capturedContext: {},
      startedAt: new Date(),
    };
  }

  async getNextMessage(): Promise<string> {
    const conversationHistory = this.state.messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');

    const phasePrompt = PHASE_PROMPTS[this.state.phase];
    
    try {
      const response = await glmClient.chat(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Conversation:\n${conversationHistory}\n\nPhase: ${this.state.phase}\n\n${phasePrompt}` },
        ],
        { temperature: 0.8, max_tokens: 300 }
      );

      this.state.messages.push({
        role: 'agent',
        content: response,
        timestamp: new Date(),
        phase: this.state.phase,
      });

      return response;
    } catch (error) {
      console.error('GLM API error:', error);
      // Return fallback message based on phase
      return this.getFallbackMessage();
    }
  }

  private getFallbackMessage(): string {
    const fallbacks: Record<ConversationPhase, string> = {
      introduction: "Hey there! I'm Compass. Let's discover what makes you uniquely you. Tell me - what change or contribution would you be most proud to make?",
      compass: "That's meaningful. What does that look like in practice? Who benefits most?",
      engine: "What type of challenge energizes you most? Why that particular puzzle?",
      toolkit: "In a new situation, what's your go-to approach? Why does that feel natural?",
      proof: "Tell me about an accomplishment where you felt at your best. What made it special?",
      synthesis: "I see a pattern in your answers. Does your path feel clear to you now?",
      complete: "Thank you for sharing! Your personal context has been captured.",
    };
    return fallbacks[this.state.phase];
  }

  async processUserResponse(response: string): Promise<void> {
    this.state.messages.push({
      role: 'user',
      content: response,
      timestamp: new Date(),
      phase: this.state.phase,
    });

    // Extract context (simplified)
    this.extractContext(this.state.phase, response);

    // Advance phase if response is substantial
    if (this.shouldAdvancePhase(response)) {
      this.advancePhase();
    }
  }

  private extractContext(phase: ConversationPhase, response: string): void {
    switch (phase) {
      case 'compass':
        this.state.capturedContext.compass = {
          value: response.slice(0, 200),
          beneficiaries: '',
          emotionalLanguage: [],
        };
        break;
      case 'engine':
        this.state.capturedContext.engine = {
          beautifulProblem: response.slice(0, 200),
          processDriver: '',
        };
        break;
      case 'toolkit':
        this.state.capturedContext.toolkit = {
          instinct: response.slice(0, 200),
          reasoning: '',
        };
        break;
      case 'proof':
        this.state.capturedContext.proof = {
          accomplishment: response.slice(0, 200),
          process: '',
          meaning: '',
          obstacles: [],
        };
        break;
    }
  }

  private shouldAdvancePhase(response: string): boolean {
    return response.split(' ').length >= 10;
  }

  private advancePhase(): void {
    const phases: ConversationPhase[] = [
      'introduction', 'compass', 'engine', 'toolkit', 'proof', 'synthesis', 'complete'
    ];
    const currentIndex = phases.indexOf(this.state.phase);
    if (currentIndex < phases.length - 1) {
      this.state.phase = phases[currentIndex + 1];
    }
    if (this.state.phase === 'complete') {
      this.state.completedAt = new Date();
    }
  }

  getState(): DiscoveryState {
    return { ...this.state };
  }

  getPhase(): ConversationPhase {
    return this.state.phase;
  }
}

export function createCompassAgent(): CompassAgent {
  return new CompassAgent();
}
