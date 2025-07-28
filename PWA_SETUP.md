# PWA Setup Guide for Essentials

This guide will help you set up Progressive Web App (PWA) functionality for your Essentials fitness app.

## Prerequisites

1. Make sure you have Node.js installed
2. Your app should be served over HTTPS (required for PWA features)

## Environment Variables

**IMPORTANT**: You must add these environment variables to your `.env.local` file for PWA functionality to work:

```bash
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BG1fxdFYT--nwC0lTblJhOiosnHQDbdWTFSxQg62Zy6xC9eJz5XHXjKPIJ3Gc9TDPziP7OGASlBV-7zCaWcFfxw"
VAPID_PRIVATE_KEY="BC8GYheZ8nPidOfbyWWSbng7lFXzBVynQBlXRZus-vE"
```

**Quick Setup**:
1. Create a `.env.local` file in your project root
2. Copy the VAPID keys above into the file
3. Restart your development server

## Generating VAPID Keys

1. Install web-push globally (if not already installed):
   ```bash
   npm install -g web-push
   ```

2. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```

3. Copy the generated keys to your `.env.local` file:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Use the "Public Key" value
   - `VAPID_PRIVATE_KEY`: Use the "Private Key" value

4. Update the email in `src/app/actions.ts`:
   ```typescript
   webpush.setVapidDetails(
     'mailto:your-email@example.com', // Replace with your email
     process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
     process.env.VAPID_PRIVATE_KEY!
   )
   ```

## Features Implemented

### 1. Web App Manifest
- App name, description, and icons
- Standalone display mode
- Theme colors and orientation
- Categories for app stores

### 2. Service Worker
- Offline caching for core pages
- Push notification handling
- Background sync support
- Cache management

### 3. Push Notifications
- User subscription management
- Server-side notification sending
- Custom notification actions
- Workout reminders and progress updates

### 4. Install Prompt
- Automatic install prompts for supported browsers
- iOS-specific instructions for home screen installation
- Cross-platform compatibility

### 5. Security Headers
- Content Security Policy
- X-Frame-Options protection
- Referrer Policy
- Cache control for service worker

## Testing Locally

1. Start your development server with HTTPS:
   ```bash
   npm run dev -- --experimental-https
   ```

2. Open your browser and navigate to the app

3. Check browser developer tools:
   - Application tab → Service Workers (should show registered)
   - Application tab → Manifest (should show PWA details)
   - Console (should show service worker registration)

4. Test push notifications:
   - Go to Profile → App Settings
   - Click "Subscribe to Notifications"
   - Accept browser permission prompt
   - Test sending a notification

## Production Deployment

1. Ensure your domain is served over HTTPS
2. Verify all environment variables are set
3. Test PWA functionality on mobile devices
4. Check that the manifest.json is accessible at `/manifest.json`
5. Verify service worker is registered and working

## Troubleshooting

### Push Notifications Not Working
- Check that VAPID keys are correctly set
- Ensure HTTPS is enabled
- Verify browser permissions are granted
- Check browser console for errors

### Service Worker Not Registering
- Ensure HTTPS is enabled
- Check that `/sw.js` is accessible
- Verify Content Security Policy allows service worker

### Install Prompt Not Showing
- Check that manifest.json is valid
- Ensure HTTPS is enabled
- Verify app meets installability criteria
- Test on different browsers/devices

## Browser Support

- **Chrome/Edge**: Full PWA support
- **Firefox**: Full PWA support
- **Safari**: Limited PWA support (no install prompt, but home screen installation works)
- **Mobile browsers**: Varies by platform

## Next Steps

1. **Database Integration**: Store push subscriptions in your database for persistence
2. **Offline Support**: Implement more sophisticated caching strategies
3. **Background Sync**: Add offline action queuing and sync
4. **Analytics**: Track PWA usage and engagement
5. **App Store**: Consider submitting to app stores using tools like Bubblewrap or PWA Builder 