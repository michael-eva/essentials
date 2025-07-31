# Notification System TL;DR

## Overview
AI-powered notification system with user preferences, smart type detection, and delivery tracking.

## Key Features
- **Daily Limit**: Max 3 notifications per user per day (was 1)
- **7 Notification Types**: workout_reminder, progress_celebration, motivation_boost, goal_check_in, accountability_nudge, streak_celebration, recovery_reminder
- **5 Tone Options**: motivational, gentle, challenging, friendly, professional
- **Smart Type Detection**: AI chooses notification type based on user activity (recent workouts, streaks, etc.)
- **Full Delivery Tracking**: sent_at timestamps, delivery_status enum (pending/sent/failed/expired)

## Database Tables

### notifications
- `type`: notification_type enum (determines message focus)
- `sent`: boolean flag
- `sentAt`: delivery timestamp
- `deliveryStatus`: pending/sent/failed/expired
- `scheduledTime`: when to send

### notification_preferences (NEW)
- `enabledTypes`: JSON array of notification types user wants
- `tone`: communication style (motivational/gentle/challenging/friendly/professional)  
- `preferredTimes`: JSON array ["morning", "afternoon", "evening"]
- `focusAreas`: JSON array ["accountability", "encouragement", "goal_tracking"]
- `frequency`: "daily"/"every_other_day"/"weekly"
- `quietHours`: {start: "22:00", end: "07:00"}

## Flow

1. **User Subscription**: UI → push_subscriptions table
2. **AI Generation**: `/api/notifications/schedule` (nightly cron)
   - Checks daily limit (3/day vs unlimited before)
   - Fetches user preferences from notification_preferences table
   - Analyzes user activity: `userContext.recentActivity.recentWorkouts` & `consistency.streak`
   - AI determines notification type based on activity + enabled preferences
   - Generates personalized message with user's preferred tone/focus
   - Inserts to notifications table with type + scheduledTime
3. **Delivery**: Postgres cron (every minute)
   - Finds notifications with `sent=false` and `scheduled_time <= NOW()`
   - POSTs to `/api/notifications/send-to-user` with WEBHOOK_API_KEY
   - Marks as `sent=true`, `sentAt=timestamp`, `deliveryStatus=sent/failed`

## Smart Type Selection Logic
```typescript
// Examples of how AI chooses notification type:
if (recentWorkouts.length === 0) → "accountability_nudge"
if (streak >= 3) → "streak_celebration"  
if (recentWorkouts.length > 0) → "progress_celebration"
// Falls back to "workout_reminder" or "motivation_boost"
```

## API Endpoints
- `POST /api/notifications/schedule` - Generate AI notifications (cron job)
- `POST /api/notifications/send-to-user` - Send push notification (cron job + manual)

## User Customization
Users can configure notification_preferences to control:
- Which types they receive (workout reminders vs progress celebrations)
- Communication tone (energetic vs gentle vs challenging)
- Focus areas (accountability vs encouragement vs goal tracking)
- Preferred times and quiet hours

The AI generates completely different messages based on these preferences, making notifications highly personalized.