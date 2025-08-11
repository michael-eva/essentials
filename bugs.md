in dashboard/your-plan - it seems you have to refresh after deleting a workout to be able to see the changes (workout removed)
when clicking take a break, it shows the confirmation modal, i confirm and then it loads old data and then the "take a break" doesn't change to "continue plan". I think the UI changes, but the database doesn't get updated

With "take a break" and "continue plan", I can see that when I click "take a break", the db is updated correctly by adding a paused_at time in the database, but I refresh the browser and it erroneously reverts back to the active state instead of paused state (paused state will have a "paused_at" value in the workout_plan table thats not null). This only happens in prod and not in dev

in the AIInteractionSection - I clear the chat, the chat gets removed from the database and the UI. I then refresh (on mobile) and the chat thread reappears in the UI but not in the database. Why is it appearing again? It should be removed

Important, the above only happens in vercel prod but not when running locally. These are the vercel error logs when doing the pause / continue workouts:

Aug 11 07:13:32.08
GET
200
essentials-lac.vercel.app
/dashboard/your-plan
Aug 11 07:13:26.07
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.pauseWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:13:24.04
GET
200
essentials-lac.vercel.app
/auth
Aug 11 07:13:23.05
GET
200
essentials-lac.vercel.app
/dashboard/your-plan
Aug 11 07:12:29.48
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.pauseWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:10:18.07
GET
200
essentials-lac.vercel.app
/dashboard/your-plan
Aug 11 07:09:52.99
GET
200
essentials-lac.vercel.app
/api/trpc/notifications.getNotificationSubscriptionStatus
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:09:36.32
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:09:30.57
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.pauseWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:09:20.86
GET
200
essentials-lac.vercel.app
/dashboard/your-plan
Aug 11 07:09:13.90
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.pauseWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:09:09.03
GET
200
essentials-lac.vercel.app
/dashboard/your-plan
Aug 11 07:09:05.55
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
2
Error resuming workout plan: Error [TRPCError]: Plan is not paused at <unknown> (.next/server/app/api/trpc/[trpc]/route.js:223:9532) at async to.middlewares (.next/server/app/api/trpc/[trpc]/route.js:99:6111) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async t (.next/server/app/api/trpc/[trpc]/route.js:99:6312) at async (.next/server/app/api/trpc/[trpc]/route.js:95:35701) at async (.next/server/app/api/trpc/[trpc]/route.js:99:1173) { cause: undefined, code: 'BAD_REQUEST' }
Aug 11 07:08:56.62
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
2
Error resuming workout plan: Error [TRPCError]: Plan is not paused at <unknown> (.next/server/app/api/trpc/[trpc]/route.js:223:9532) at async to.middlewares (.next/server/app/api/trpc/[trpc]/route.js:99:6111) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async t (.next/server/app/api/trpc/[trpc]/route.js:99:6312) at async (.next/server/app/api/trpc/[trpc]/route.js:95:35701) at async (.next/server/app/api/trpc/[trpc]/route.js:99:1173) { cause: undefined, code: 'BAD_REQUEST' }
Aug 11 07:08:56.08
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
2
Error resuming workout plan: Error [TRPCError]: Plan is not paused at <unknown> (.next/server/app/api/trpc/[trpc]/route.js:223:9532) at async to.middlewares (.next/server/app/api/trpc/[trpc]/route.js:99:6111) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async t (.next/server/app/api/trpc/[trpc]/route.js:99:6312) at async (.next/server/app/api/trpc/[trpc]/route.js:95:35701) at async (.next/server/app/api/trpc/[trpc]/route.js:99:1173) { cause: undefined, code: 'BAD_REQUEST' }
Aug 11 07:08:55.34
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:08:54.00
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:08:47.82
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.pauseWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Aug 11 07:06:12.08
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
2
Error resuming workout plan: Error [TRPCError]: Plan is not paused at <unknown> (.next/server/app/api/trpc/[trpc]/route.js:223:9532) at async to.middlewares (.next/server/app/api/trpc/[trpc]/route.js:99:6111) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async td (.next/server/app/api/trpc/[trpc]/route.js:102:69) at async t (.next/server/app/api/trpc/[trpc]/route.js:99:6312) at async (.next/server/app/api/trpc/[trpc]/route.js:95:35701) at async (.next/server/app/api/trpc/[trpc]/route.js:99:1173) { cause: undefined, code: 'BAD_REQUEST' }
Aug 11 07:06:07.50
POST
200
essentials-lac.vercel.app
/api/trpc/workoutPlan.resumeWorkoutPlan
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
