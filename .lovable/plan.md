

# Phase 3: Insights, Analytics & Enhanced User Experience

With the core features complete (dashboard, AI chat, mood logging), Phase 3 focuses on giving users actionable insights from their data and improving the overall experience.

---

## What We'll Build

### 1. Mood Insights & Analytics Page
A dedicated page showing users their emotional patterns over time:
- **Weekly mood chart** with line/bar visualization
- **Monthly mood calendar** with color-coded days
- **Average mood score** with trend indicators (improving, stable, declining)
- **Mood distribution** pie chart showing frequency of each mood level
- **Streak tracking** for consecutive mood logging days

### 2. Personalized Onboarding Flow
First-time user experience to personalize their journey:
- **Welcome screen** introducing Flourish
- **Goals selection** (managing anxiety, improving mood, building habits, better relationships)
- **Communication style preference** (gentle encouragement, direct feedback, structured guidance)
- **Display name** input for personalized greetings
- Saves preferences to the profiles table

### 3. Chat History Sidebar
Allow users to revisit past conversations:
- **Sidebar drawer** listing previous chat sessions
- **Session titles** auto-generated from first message
- **Load previous conversations** with full message history
- **Delete old sessions** option

### 4. Enhanced Navigation
Proper navigation between all app sections:
- **Persistent sidebar** or **bottom navigation** for mobile
- Quick access to Dashboard, Chat, Insights, and Settings
- Visual indicator for current page

### 5. Settings Page
User account management:
- **Edit display name**
- **Update goals and communication style**
- **Delete account** option
- **Sign out** button

---

## New Pages & Components

| Page/Component | Purpose |
|----------------|---------|
| `Insights.tsx` | Mood charts, trends, and analytics |
| `Onboarding.tsx` | First-time user setup flow |
| `Settings.tsx` | Account and preferences management |
| `ChatHistory.tsx` | Sidebar with past conversations |
| `MoodChart.tsx` | Weekly/monthly mood visualization |
| `MoodCalendar.tsx` | Color-coded monthly calendar view |
| `AppSidebar.tsx` | Navigation sidebar component |

---

## Visual Features

```text
Insights Page Layout
+---------------------------+
|  📊 Your Mood Insights    |
+---------------------------+
|  [Weekly Chart - 7 days]  |
|  ─────────────────────    |
|  📈 Trend: Improving      |
|  📅 Streak: 5 days        |
+---------------------------+
|  [Monthly Calendar]       |
|  Color-coded mood days    |
+---------------------------+
|  [Mood Distribution]      |
|  Pie chart breakdown      |
+---------------------------+
```

---

## Implementation Order

1. **Onboarding Flow** - Create multi-step onboarding for new users with goals and preferences
2. **App Navigation** - Add sidebar/bottom nav for seamless page switching
3. **Insights Page** - Build mood analytics with charts using Recharts (already installed)
4. **Chat History** - Add sidebar to load past conversations
5. **Settings Page** - User account management
6. **Polish** - Animations, loading states, empty states

---

## Technical Details

### Chart Library
Using **Recharts** (already in dependencies) for mood visualizations:
- Line charts for weekly trends
- Bar charts for mood distribution
- Custom tooltips showing mood details

### Onboarding Logic
- Check `onboarding_completed` flag in profiles table
- Redirect new users to onboarding after first login
- Update profile with goals, communication style, and display name
- Set `onboarding_completed = true` when finished

### Chat History Loading
- Query `chat_sessions` table ordered by `updated_at`
- Load all `messages` for a session when selected
- Auto-generate session titles from first user message

### Navigation Approach
- **Desktop**: Left sidebar with icons and labels
- **Mobile**: Bottom navigation bar with icons
- Use React Router for page transitions

---

## Database Usage

No new tables needed - leveraging existing structure:
- `profiles.goals` - Array of user's selected goals
- `profiles.communication_style` - User preference
- `profiles.onboarding_completed` - Boolean flag
- `mood_entries` - For charts and calendar
- `chat_sessions` + `messages` - For history

---

## What You'll Have After This Phase

- Beautiful mood analytics showing weekly and monthly patterns
- Personalized onboarding that captures user preferences
- Access to all past therapy conversations
- Easy navigation between all app features
- Settings page for account management
- A polished, complete wellness app ready for Phase 4 (advanced features)

