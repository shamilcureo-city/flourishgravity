

# On-Demand Psychologist Consultation Module

## Overview

This module adds professional psychologist consultations to your Flourish wellness app, enabling clients to book appointments with licensed psychologists and conduct sessions via video call or chat.

---

## Complete Feature List

### For Clients (Regular Users)

1. **Browse Psychologists**
   - View list of available psychologists with profiles
   - Filter by specialization (anxiety, depression, relationships, etc.)
   - See availability, ratings, and hourly rates
   - Read bio and credentials

2. **Booking System**
   - View psychologist's available time slots (calendar view)
   - Book 30-min or 60-min sessions
   - Reschedule or cancel appointments (with cancellation policy)
   - Receive booking confirmations and reminders

3. **Consultation Sessions**
   - Video call integration for live sessions
   - Text chat option for messaging-based consultations
   - Session timer and automatic end
   - Option to extend session if psychologist approves

4. **Session History**
   - View past and upcoming appointments
   - Access session notes (shared by psychologist)
   - Rate and review completed sessions

5. **Payments** (optional/future)
   - Pay for sessions via Stripe
   - View payment history and receipts

---

### For Psychologists

1. **Separate Login/Registration**
   - Dedicated psychologist signup with credential verification
   - Profile setup with specializations, bio, and photo
   - Set hourly rate and session durations

2. **Availability Management**
   - Set weekly availability schedule
   - Block specific dates/times
   - Set buffer time between sessions

3. **Client Management**
   - View upcoming appointments
   - Access client profiles and history
   - Accept or decline booking requests (optional)

4. **Consultation Tools**
   - Join video calls with clients
   - In-session chat for sharing resources
   - Session notes (private or shared with client)
   - Timer and session controls

5. **Dashboard**
   - Overview of today's schedule
   - Earnings summary
   - Client reviews and ratings

---

### Shared Features

1. **Real-time Notifications**
   - Booking confirmations
   - Session reminders (15 min before)
   - Cancellation alerts

2. **Video Calling**
   - WebRTC-based video calls (using Daily.co, Twilio, or similar)
   - Audio-only option
   - Screen sharing for resources

3. **In-App Messaging**
   - Async chat between sessions
   - File/resource sharing
   - Message history

---

## Database Schema

### New Tables Required

```text
+------------------+     +-------------------+     +------------------+
|  psychologists   |     |   appointments    |     |  availability    |
+------------------+     +-------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)     |     | id (uuid, PK)    |
| user_id (FK)     |<----| psychologist_id   |     | psychologist_id  |
| license_number   |     | client_id (FK)    |     | day_of_week      |
| specializations[]|     | start_time        |     | start_time       |
| bio              |     | end_time          |     | end_time         |
| hourly_rate      |     | status            |     | is_active        |
| profile_photo_url|     | type (video/chat) |     +------------------+
| is_verified      |     | session_notes     |
| rating_avg       |     | room_id           |
| created_at       |     | created_at        |
+------------------+     +-------------------+

+------------------+     +-------------------+
|  session_chats   |     |     reviews       |
+------------------+     +-------------------+
| id (uuid, PK)    |     | id (uuid, PK)     |
| appointment_id   |     | appointment_id    |
| sender_id        |     | client_id         |
| content          |     | psychologist_id   |
| created_at       |     | rating (1-5)      |
+------------------+     | comment           |
                         | created_at        |
                         +-------------------+

+------------------+
|   user_roles     |
+------------------+
| id (uuid, PK)    |
| user_id (FK)     |
| role (enum)      |
+------------------+
```

### Role System

Using secure role management (as per security guidelines):
- `user_roles` table with `app_role` enum: `'client'`, `'psychologist'`, `'admin'`
- Security definer function `has_role()` to check roles without RLS recursion

---

## Pages to Create

| Page | Route | Purpose |
|------|-------|---------|
| Psychologist Login | `/psychologist/login` | Separate login for psychologists |
| Psychologist Signup | `/psychologist/signup` | Registration with credentials |
| Psychologist Dashboard | `/psychologist/dashboard` | Overview, today's schedule |
| Psychologist Schedule | `/psychologist/schedule` | Manage availability |
| Psychologist Clients | `/psychologist/clients` | View client list and history |
| Find Psychologists | `/consultations` | Client browse & book |
| My Appointments | `/appointments` | Client view bookings |
| Video Room | `/session/:id` | Video call interface |
| Session Chat | `/session/:id/chat` | Text-based session |

---

## Components to Build

### Client-Side
- `PsychologistCard` - Profile card in browse list
- `BookingCalendar` - Select time slots
- `AppointmentCard` - Show booking details
- `VideoRoom` - Video call interface
- `SessionChat` - Real-time messaging
- `ReviewForm` - Rate and review

### Psychologist-Side
- `PsychologistSidebar` - Navigation for psychologist portal
- `AvailabilityEditor` - Weekly schedule manager
- `AppointmentList` - Today's and upcoming sessions
- `ClientProfile` - View client history
- `SessionNotes` - Add notes during/after session

---

## Technical Implementation

### Video Calling Options

| Provider | Pros | Cons |
|----------|------|------|
| **Daily.co** | Easy integration, HIPAA-compliant option | Paid after free tier |
| **Twilio Video** | Robust, scalable | More complex setup |
| **Jitsi (self-hosted)** | Free, open-source | Requires hosting |
| **100ms** | Modern API, React SDK | Newer service |

**Recommendation:** Daily.co for fastest implementation with good React support.

### Real-time Messaging
- Use existing Supabase Realtime on `session_chats` table
- Subscribe to changes during active session

### Authentication Flow
1. Single auth system (Supabase Auth)
2. Role stored in `user_roles` table
3. Psychologists flagged with `is_verified` after admin review
4. Route guards check role to show appropriate dashboard

---

## Security Considerations

1. **RLS Policies**
   - Clients can only see verified psychologists
   - Clients can only access their own appointments
   - Psychologists can only see their own clients/appointments
   - Session notes protected by appointment ownership

2. **Psychologist Verification**
   - `is_verified` flag set by admin after credential check
   - Unverified psychologists cannot appear in listings or accept bookings

3. **HIPAA Considerations** (if applicable)
   - Use HIPAA-compliant video provider
   - Encrypt session notes at rest
   - Audit logging for data access

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Create `user_roles`, `psychologists`, and `availability` tables
- Build role-based routing and guards
- Psychologist registration and profile setup
- Availability management UI

### Phase 2: Booking System (Week 2-3)
- Create `appointments` table
- Browse psychologists page
- Booking calendar component
- Appointment confirmation flow
- My Appointments page for clients

### Phase 3: Video Sessions (Week 3-4)
- Integrate video calling provider (Daily.co)
- Video room component
- Session controls (mute, end, timer)
- Session notes for psychologists

### Phase 4: Messaging & Polish (Week 4-5)
- Real-time chat during sessions
- Async messaging between sessions
- Review system
- Email/push notifications
- Mobile responsiveness

### Phase 5: Payments (Future)
- Stripe integration for session payments
- Psychologist payouts
- Receipt generation

---

## Files to Create/Modify Summary

### New Files
- `src/pages/consultations/*` - Client consultation pages
- `src/pages/psychologist/*` - Psychologist portal pages
- `src/components/consultations/*` - Booking and session components
- `src/components/psychologist/*` - Psychologist dashboard components
- `src/hooks/usePsychologists.ts` - Fetch psychologist data
- `src/hooks/useAppointments.ts` - Manage bookings
- `supabase/functions/create-video-room/index.ts` - Generate video room

### Modified Files
- `src/App.tsx` - Add new routes
- `src/components/layout/AppSidebar.tsx` - Add "Consultations" link
- `src/components/layout/MobileNav.tsx` - Add consultations nav item

### Database Migrations
- Create `app_role` enum
- Create `user_roles` table with `has_role()` function
- Create `psychologists` table
- Create `availability` table
- Create `appointments` table
- Create `session_chats` table
- Create `reviews` table
- RLS policies for all tables

---

## Next Steps

Would you like me to proceed with implementing this module? I'll start with:

1. Setting up the database schema (roles, psychologists, availability, appointments)
2. Creating the psychologist registration and login flow
3. Building the browse/book flow for clients

Let me know which phase to start with or if you'd like to adjust any features!

