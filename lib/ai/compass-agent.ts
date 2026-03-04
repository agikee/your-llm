/**
 * Compass Discovery Agent
 * 
 * Implements the Compass-Engine-Toolkit discovery conversation flow
 * Based on compass-agent-prompt.md
 */

import { glmClient } from './glm-client';
import type { DimensionType } from '@/types';

// ============================================================================
// Types
// ============================================================================

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
    compass?: { value: string; beneficiaries: string; emotionalLanguage: string[] };
    engine?: { beautifulProblem: string; processDriver: string };
    toolkit?: { instinct: string; reasoning: string };
    proof?: { accomplishment: string; process: string; meaning: string; obstacles: string[] };
  };
  startedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Compass Agent Prompts
// ============================================================================

const SYSTEM_PROMPT = `You are Compass, a skilled interviewer and personal insight guide specializing in self-discovery conversations.

Your role: Help people uncover and articulate their core identity through the Compass-Engine-Toolkit framework:
- Compass: Values and purpose (what matters to them)
- Engine: Passions and motivations (their "beautiful problem")
- Toolkit: Strengths and instincts (how they naturally operate)

Communication style:
- Warm and conversational (never clinical)
- Genuinely curious with active listening
- Patient and encouraging
- Personal but professional
- Use natural language like "Hey there," "Let me ask," "I'm curious"
- Show understanding through callbacks to earlier answers
- Probe with follow-up questions from genuine interest
- Celebrate discoveries by making connections visible

Principles:
1. Authenticity over categorization - acknowledge when the framework doesn't fit
2. Depth through stories - probe for detail, emotion, and meaning
3. Active listening shows through callbacks - reference earlier answers
4. Probing is curious, not clinical
5. Privacy first - never ask for identifying details

You are guiding a 15-20 minute discovery conversation that will end with a synthesis showing how their values, passions, and strengths align.`;

const PHASE_PROMPTS: Record<ConversationPhase, string> = {
  introduction: `Start by welcoming the user warmly. Explain that this is a 15-20 minute conversation (not a questionnaire) about three things:
1. What matters to them (values)
2. What energizes them (passions)  
3. How they naturally operate (strengths)

Offer input mode choice: Text (typing), Voice (speaking), or Quick Pick (choose from options).
Keep it brief and inviting. End with "What feels right to start?"`,

  compass: `Now explore COMPASS - their values and purpose.

Ask: "Imagine you're looking back on your life from a place of peace and fulfillment. What is the one change or contribution you would be most proud to have made for the next generation?"

Wait for their response. Then probe deeper:
- If vague: "That's beautiful. When you imagine making things better, what does that actually look like?"
- If specific: "I love how specific that is. Why does this particular problem call to you?"
- Ask about the "who" - who benefits most?

Goal: Uncover a clear value and emotional connection.`,

  engine: `Now explore ENGINE - their "beautiful problem."

Ask: "Every person has a 'beautiful problem' - a type of puzzle or challenge so fascinating that you're drawn to it instinctively. What does that problem look like for you? And what is it about the PROCESS of tackling it that energizes you?"

Focus on PROCESS, not outcome.
Probe: "When you're in the messy middle, what keeps you going?"
Connect to Compass if they mentioned it earlier.`,

  toolkit: `Now explore TOOLKIT - their instinctive strengths.

Ask: "Imagine you're dropped into a completely unfamiliar situation. You can't rely on existing resources or past playbooks. What's the VERY FIRST, most instinctive tool you pull from your mental utility belt?"

Listen for their approach (analyst, builder, connector, strategist, executor).
Probe: "Why THAT approach? What is it about that move that feels natural?"

Connect to Engine if relevant.`,

  proof: `Now ask for their PROOF story.

Say: "We've established: [summarize Compass value], [summarize Engine passion], and [summarize Toolkit strength]. Now I want you to tell me a story."

Ask: "Think of an accomplishment that defines what you're capable of - not necessarily your biggest, but the one where you feel 'yeah, THAT'S me at my best.' Tell me what happened, what you did, and what made it so meaningful."

Probe for:
- Context and motivation
- Specific obstacles
- What they actually did
- How they felt
- Why it mattered personally

Get rich narrative detail.`,

  synthesis: `Now deliver the SYNTHESIS - the "aha moment."

Look at the connections:
- Did the story show them living their Compass values?
- Did they engage with their Engine "beautiful problem"?
- Did they use their Toolkit instinct?

Structure your response:
1. "Let me show you what I'm seeing..."
2. "**Your Compass was fulfilled:** [connect value to story]"
3. "**Your Engine was engaged:** [connect passion to story]"  
4. "**Your Toolkit was in force:** [connect strength to story]"
5. "This is why it felt so meaningful - [synthesize all three]"

End with: "Does that resonate with you?"`,

  complete: `The discovery is complete. Thank them warmly and explain next steps:
- Context modules are being generated
- They can use these with any AI
- Offer to show them the before/after comparison tool`
};

// ============================================================================
// Compass Agent Class
// ============================================================================

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

  /**
   * Get the next agent message based on current phase
   */
  async getNextMessage(): Promise<string> {
    const conversationHistory = this.state.messages.map(m => 
      `${m.role}: ${m.content}`
    ).join('\n\n');

    const phasePrompt = PHASE_PROMPTS[this.state.phase];
    
    const response = await glmClient.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Conversation so far:\n${conversationHistory}\n\nCurrent phase: ${this.state.phase}\n\n${phasePrompt}` },
      ],
      { temperature: 0.8, max_tokens: 500 }
    );

    this.state.messages.push({
      role: 'agent',
      content: response,
      timestamp: new Date(),
      phase: this.state.phase,
    });

    return response;
  }

  /**
   * Process user response and advance phase if appropriate
   */
  async processUserResponse(response: string): Promise<void> {
    this.state.messages.push({
      role: 'user',
      content: response,
      timestamp: new Date(),
      phase: this.state.phase,
    });

    // Extract context based on current phase
    this.extractContext(this.state.phase, response);

    // Check if we should advance phase (simplified - in production, use AI to detect)
    if (this.shouldAdvancePhase(response)) {
      this.advancePhase();
    }
  }

  /**
   * Extract structured context from user response
   */
  private extractContext(phase: ConversationPhase, response: string): void {
    // Simplified extraction - in production, use AI
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

  /**
   * Determine if conversation should advance to next phase
   */
  private shouldAdvancePhase(response: string): boolean {
    // Simple heuristic - advance after substantial response
    const wordCount = response.split(' ').length;
    return wordCount >= 20;
  }

  /**
   * Move to next conversation phase
   */
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

  /**
   * Get current state
   */
  getState(): DiscoveryState {
    return { ...this.state };
  }

  /**
   * Get current phase
   */
  getPhase(): ConversationPhase {
    return this.state.phase;
  }
}

// Export singleton factory
export function createCompassAgent(): CompassAgent {
  return new CompassAgent();
}
