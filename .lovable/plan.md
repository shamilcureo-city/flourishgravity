# On-Demand Psychologist Consultation Module

## Status: Phase 1 & 2 Complete ✅

---

## Completed

### Phase 1: Foundation ✅
- [x] Created `app_role` enum ('client', 'psychologist', 'admin')
- [x] Created `user_roles` table with secure `has_role()` function
- [x] Created `psychologists` table with profile info
- [x] Created `availability` table for weekly schedules
- [x] Created `appointments` table with status tracking
- [x] Created `session_chats` table for real-time messaging
- [x] Created `reviews` table with automatic rating aggregation
- [x] RLS policies for all tables
- [x] Psychologist login/signup pages
- [x] Psychologist dashboard with stats
- [x] Psychologist schedule management

### Phase 2: Booking System ✅
- [x] Browse psychologists page with filtering
- [x] Booking calendar component
- [x] Appointment confirmation flow
- [x] My Appointments page for clients
- [x] Cancel appointment functionality

---

## Files Created

### Hooks
- `src/hooks/useUserRole.ts` - Role checking hook
- `src/hooks/usePsychologists.ts` - Psychologist data hooks
- `src/hooks/useAppointments.ts` - Appointment management hooks

### Psychologist Portal
- `src/pages/psychologist/PsychologistLogin.tsx`
- `src/pages/psychologist/PsychologistSignup.tsx`
- `src/pages/psychologist/PsychologistDashboard.tsx`
- `src/pages/psychologist/PsychologistSchedule.tsx`
- `src/pages/psychologist/PsychologistClients.tsx`
- `src/pages/psychologist/PsychologistSettings.tsx`
- `src/components/psychologist/PsychologistLayout.tsx`

### Client Consultation Pages
- `src/pages/consultations/FindPsychologists.tsx`
- `src/pages/consultations/BookAppointment.tsx`
- `src/pages/consultations/MyAppointments.tsx`

---

## Routes

### Client Routes
| Route | Description |
|-------|-------------|
| `/consultations` | Browse psychologists |
| `/consultations/book/:id` | Book appointment |
| `/appointments` | View my appointments |

### Psychologist Routes
| Route | Description |
|-------|-------------|
| `/psychologist/login` | Psychologist login |
| `/psychologist/signup` | Psychologist registration |
| `/psychologist/dashboard` | Dashboard overview |
| `/psychologist/schedule` | Manage availability |
| `/psychologist/clients` | View clients |
| `/psychologist/settings` | Profile settings |

---

## Remaining Phases

### Phase 3: Video Sessions (Next)
- [ ] Integrate Daily.co for video calls
- [ ] Create video room component at `/session/:id`
- [ ] Session controls (mute, camera, end)
- [ ] Session timer
- [ ] Session notes for psychologists

### Phase 4: Messaging & Polish
- [ ] Real-time chat during sessions
- [ ] Async messaging between sessions
- [ ] Review system after completed sessions
- [ ] Email/push notifications

### Phase 5: Payments (Future)
- [ ] Stripe integration for session payments
- [ ] Psychologist payouts
- [ ] Receipt generation

---

## How to Use

### For Clients
1. Navigate to **Consultations** in the sidebar
2. Browse verified psychologists by specialty
3. Click **Video** or **Chat** to book
4. Select date, time, and duration
5. View bookings in **Appointments**

### For Psychologists
1. Register at `/psychologist/signup`
2. Fill credentials and professional info
3. Verify email, wait for admin approval
4. Login at `/psychologist/login`
5. Set availability in **Schedule**
6. View appointments in **Dashboard**

### Admin: Verify a Psychologist
```sql
UPDATE psychologists SET is_verified = true WHERE license_number = 'PSY-XXXXX';
```
