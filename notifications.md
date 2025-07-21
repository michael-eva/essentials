Flow for generating notifications:
1. User subscribes in UI - subscriptions table row is created
2. Cron jobs runs every night the /api/schedule/route.ts which does the following:
- Loops through all users who have onboarded, have subscribes to notifications and has no upcoming notifications
- For each user, Runs generateAiNotification from services/ai-notifications.ts
- This inserts a notification into the table with a given scheduledTime
3. Postgres cron job that runs every minute gets all notifications with a scheduled_time < now() and sends a POST request to /api/send-to-user:
- Recieves {userId, title. message} in HTTP body - which is got from the notification table
- Runs sendNotification from actions.ts  - which notifies the user