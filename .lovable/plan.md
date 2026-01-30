
# Phase 2: Building the Functional Flourish Dashboard & AI Chat

Now that authentication is working, it's time to bring Flourish to life with the core features. This phase will transform the placeholder dashboard into a fully functional wellness hub.

---

## What We'll Build

### 1. User Profiles Table (Database Setup)
Store user preferences and onboarding data so the AI can personalize conversations.

**Data stored:**
- Display name
- Mental health goals (anxiety, mood, habits, relationships)
- Preferred communication style
- Onboarding completion status

### 2. Functional Dashboard
Replace the "coming soon" message with a real wellness dashboard featuring:
- **Welcome section** with user's name and daily greeting
- **Quick actions** - Start AI Chat, Log Mood, View Insights
- **Today's mood** (if logged) or prompt to log
- **Recent activity** summary
- **Daily motivational quote**

### 3. AI Therapy Chat Interface
The central feature - a full-screen chat with the evidence-based AI therapist:
- Clean, calming chat interface
- Message bubbles with typing indicators
- Streaming AI responses for natural conversation feel
- System prompts using CBT, DBT, and ACT techniques
- Conversation history saved per session

### 4. Conversation Storage (Database)
Save chat sessions so users can revisit past conversations:
- Chat sessions table (title, created date, user)
- Messages table (content, role, timestamp)

### 5. Basic Mood Logging
Quick mood check-in feature:
- Emoji-based mood selection (1-5 scale)
- Optional notes field
- Store in database for future charting

---

## New Pages & Components

| Page/Component | Purpose |
|----------------|---------|
| `Dashboard.tsx` | Updated with widgets, quick actions, greeting |
| `Chat.tsx` | Full-screen AI therapy conversation |
| `MoodLogger.tsx` | Modal/page for logging daily mood |
| `ChatMessage.tsx` | Individual message bubble component |
| `QuickActions.tsx` | Dashboard widget with action buttons |
| `MoodWidget.tsx` | Dashboard widget showing today's mood |

---

## Database Tables

```text
profiles
├── id (uuid, references auth.users)
├── display_name (text)
├── goals (text array)
├── communication_style (text)
├── onboarding_completed (boolean)
├── created_at / updated_at

chat_sessions
├── id (uuid)
├── user_id (references profiles)
├── title (text)
├── created_at / updated_at

messages
├── id (uuid)
├── session_id (references chat_sessions)
├── role (enum: user/assistant)
├── content (text)
├── created_at

mood_entries
├── id (uuid)
├── user_id (references profiles)
├── mood_score (integer 1-5)
├── notes (text, optional)
├── created_at
```

---

## Implementation Order

1. **Database Setup** - Create profiles, chat_sessions, messages, and mood_entries tables with RLS policies
2. **Profile Creation** - Auto-create profile on signup via database trigger
3. **Dashboard Upgrade** - Build the functional dashboard with widgets
4. **Chat Interface** - Create the AI therapy chat page with streaming responses
5. **AI Integration** - Connect to Lovable AI with evidence-based therapy prompts
6. **Mood Logging** - Add quick mood check-in functionality
7. **Navigation** - Add sidebar or header nav between dashboard, chat, and mood pages

---

## Technical Details

### AI Therapy System Prompt
The AI will be configured with a therapeutic persona using evidence-based techniques:
- **CBT (Cognitive Behavioral Therapy)**: Identify thought patterns, challenge cognitive distortions
- **DBT (Dialectical Behavior Therapy)**: Emotional regulation, distress tolerance
- **ACT (Acceptance and Commitment Therapy)**: Mindfulness, values-based action

### Security (RLS Policies)
- Users can only read/write their own profiles
- Users can only access their own chat sessions and messages
- Users can only view/create their own mood entries

### Streaming Responses
AI responses will stream word-by-word for a natural, engaging conversation feel using an edge function connected to Lovable AI.

---

## What You'll Have After This Phase

- A personalized dashboard that greets you by name
- Working AI therapy chat with evidence-based responses
- Ability to log and view your daily mood
- All data securely stored and private to each user
- Foundation ready for Phase 3 (charts, insights, trends)

