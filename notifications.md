Flow for generating notifications:

1. User subscribes in UI - push_subscriptions table row is created
2. Cron job runs every night hitting /api/notifications/schedule/route.ts which:
   - Requires WEBHOOK_API_KEY authentication
   - Loops through all users who have onboarded, have subscribed to notifications, and have no upcoming notifications
   - For each user, runs generateAiNotification from services/ai-notifications.ts
   - This inserts a notification into the notifications table with a scheduledTime
3. Postgres cron job runs every minute, gets all notifications with scheduled_time < now() and sends POST to /api/notifications/send-to-user:
   - Requires WEBHOOK_API_KEY authentication
   - Receives {userId, title, message} in HTTP body from the notifications table
   - Runs sendNotification from actions.ts to deliver push notifications
