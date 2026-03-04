# Discovery Chat UI Task

Build the Discovery Chat UI for Your LLM. Create a full-screen, immersive conversational experience.

## Files to Create:

### 1. app/globals.css
Create global styles with CSS variables for dark/light mode:
- Use warm amber/gold accents
- Define HSL variables for the Tailwind color system
- Support dark mode with [data-theme='dark'] selector
- Add custom utilities for text gradients and animations

### 2. app/layout.tsx
Root layout with:
- Import Inter and Cal Sans fonts
- Dark mode by default (set data-theme='dark' on html)
- Include globals.css
- Simple, minimal layout

### 3. app/discover/page.tsx
Main discovery page with:
- Full-screen immersive layout (h-screen, no scroll bars)
- State for: current phase (compass/engine/toolkit), messages array, current response
- Mock conversation flow through 3 phases
- Integrate all discovery components
- Dark, warm aesthetic
- Center-aligned content

### 4. components/discovery/ConversationView.tsx
Beautiful conversation display:
- Agent messages with large, warm typography (text-2xl, text-3xl)
- User responses shown subtly (smaller, muted, right-aligned)
- Framer Motion fade-in animations for messages
- Animated typing indicator (3 bouncing dots)
- Agent avatar/icon (compass or warm circle)
- Smooth scroll to latest message

### 5. components/discovery/ResponseInput.tsx
Large, friendly input:
- Big textarea (text-lg, min-height 80px)
- Submit on Enter (Shift+Enter for newline)
- Subtle character count
- 'Skip' button for optional questions
- Warm amber focus ring
- Smooth transitions

### 6. components/discovery/ProgressIndicator.tsx
Minimal progress display:
- 3 dots representing Compass/Engine/Toolkit phases
- Current phase highlighted with warm amber/gold
- Completed phases subtly marked (checkmark or filled)
- No percentages or clinical numbers
- Small, unobtrusive (top of screen)

## Design Requirements:
- NOT a typical chat UI - immersive, personal, intimate
- Full screen with minimal chrome
- Large, readable fonts (text-xl to text-3xl for messages)
- Warm color palette (amber-500, warm-600, compass-gold)
- Dark mode friendly (bg-slate-950, slate-900)
- Lots of whitespace and padding
- Premium, refined feel
- Framer Motion for all animations

## State Structure:
Use React useState for MVP. Keep components clean and focused. The experience should feel like a personal conversation with a wise guide, not a clinical form.

Phase types: compass, engine, toolkit
Message has: id, role (agent/user), content, phase
