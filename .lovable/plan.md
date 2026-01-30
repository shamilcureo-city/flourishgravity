

# Phase 4: Advanced Features, Personalization & Polish

With the core wellness platform complete (dashboard, AI chat, mood logging, insights, onboarding, settings), Phase 4 focuses on making Flourish smarter, more personalized, and production-ready.

---

## What We'll Build

### 1. Personalized AI Responses
Make the AI therapist aware of the user's profile:
- **Inject user goals** into the system prompt (e.g., if user selected "anxiety", AI emphasizes anxiety coping techniques)
- **Adapt communication style** based on preference (supportive, direct, or structured)
- **Reference display name** for personalized greetings
- **Mood context** - AI can see recent mood trends to inform conversations

### 2. Guided Exercises & Tools
Interactive therapeutic exercises beyond chat:
- **Breathing exercises** with animated visual guide (4-7-8, box breathing)
- **Grounding techniques** (5-4-3-2-1 sensory exercise)
- **Gratitude journaling** with prompts
- **Thought reframing** worksheet (CBT technique)
- Exercises stored and tracked in a new `exercises` table

### 3. Daily Check-in Reminders
Help users build consistent habits:
- **Morning check-in prompt** on dashboard
- **Streak encouragement** with achievements
- **Gentle nudges** when user hasn't logged mood in X days
- Optional push notification support (future enhancement)

### 4. Dark Mode Toggle
Complete theme switching:
- **Toggle in settings** and header
- Uses `next-themes` (already installed)
- Respects system preference by default
- Persists user choice

### 5. Export & Data Privacy
Give users control over their data:
- **Export all data** as JSON (moods, conversations, profile)
- **Delete all data** option in settings
- **Privacy-focused design** with clear data usage info

### 6. Enhanced Chat Experience
Polish the AI chat interface:
- **Suggested prompts** for new users ("I'm feeling anxious", "Help me sleep better")
- **Session summaries** - AI generates a brief summary after each session
- **Quick reactions** - emoji feedback on AI responses
- **Copy message** button

---

## New Pages & Components

| Page/Component | Purpose |
|----------------|---------|
| `Exercises.tsx` | Library of guided wellness exercises |
| `BreathingExercise.tsx` | Animated breathing guide |
| `GroundingExercise.tsx` | 5-4-3-2-1 sensory grounding |
| `GratitudeJournal.tsx` | Daily gratitude prompts |
| `ThemeToggle.tsx` | Dark/light mode switcher |
| `DataExport.tsx` | Export user data component |
| `SuggestedPrompts.tsx` | Chat starter suggestions |

---

## Database Changes

New table for tracking exercise completions:

```text
exercise_completions
+--------------------+
| id (uuid)          |
| user_id (uuid)     |
| exercise_type      |
| completed_at       |
| duration_seconds   |
| notes (optional)   |
+--------------------+
```

---

## Visual Features

```text
Exercises Page Layout
+---------------------------+
|  Wellness Toolkit         |
+---------------------------+
|  [Breathing Card]         |
|  4-7-8 Breathing          |
|  Calm your nervous system |
+---------------------------+
|  [Grounding Card]         |
|  5-4-3-2-1 Technique      |
|  Anchor to the present    |
+---------------------------+
|  [Gratitude Card]         |
|  Daily Gratitude          |
|  Shift your perspective   |
+---------------------------+

Breathing Exercise Screen
+---------------------------+
|      Breathe In           |
|         (4s)              |
|                           |
|    [ Expanding Circle ]   |
|                           |
|      Hold (7s)            |
|      Breathe Out (8s)     |
+---------------------------+
```

---

## Implementation Order

1. **Dark Mode** - Add theme toggle using next-themes
2. **Personalized AI** - Update edge function to use profile data
3. **Breathing Exercise** - Create animated breathing guide
4. **Grounding Exercise** - Build 5-4-3-2-1 sensory exercise
5. **Gratitude Journal** - Add gratitude entry feature
6. **Exercises Page** - Create navigation to all exercises
7. **Chat Enhancements** - Add suggested prompts and reactions
8. **Data Export** - Build export functionality in settings

---

## Technical Details

### Dark Mode Implementation
Using `next-themes` (already installed):
- Wrap app in `ThemeProvider`
- Add toggle component in header and settings
- CSS variables already defined in index.css for dark mode

### Personalized AI Prompts
Update the Edge Function to:
1. Accept user profile data from frontend
2. Dynamically build system prompt with user's goals
3. Adjust tone based on communication style preference
4. Include recent mood context if available

Example personalized prompt addition:
```text
User Profile:
- Name: Sarah
- Goals: Managing Anxiety, Better Sleep
- Style: Gentle & Supportive
- Recent mood: Average 3.2/5 (slightly low)

Adjust your approach accordingly...
```

### Breathing Animation
Use CSS keyframes and React state:
- Circle expands during inhale
- Holds at peak
- Contracts during exhale
- Count-down timer display
- Configurable patterns (4-7-8, box breathing, custom)

### Exercise Tracking
- Log completions to `exercise_completions` table
- Show completion history on exercises page
- Track total exercises completed in insights

---

## What You'll Have After This Phase

- AI therapist that knows your goals and adapts its approach
- Interactive breathing and grounding exercises
- Dark mode for comfortable night-time use
- Gratitude journaling for positive psychology benefits
- Full data export and privacy controls
- A polished, feature-rich wellness app ready for users

---

## Future Considerations (Phase 5+)

- Push notifications for reminders
- Social features (anonymous support groups)
- Integration with health apps
- Audio-guided meditations
- AI-generated weekly wellness reports
- Multi-language support

