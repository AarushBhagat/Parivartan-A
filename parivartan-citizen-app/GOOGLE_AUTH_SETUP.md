# Google Sign-In Troubleshooting Guide

## Current Error
```
Error 400: invalid_request
Request details: redirect_uri=exp://192.168.115.153:8081/--/oauth flowName=GeneralOAuthFlow
```

## How to Fix

### 1. Update Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find and edit your OAuth 2.0 Client ID used for this app
4. Add the following to the **Authorized redirect URIs**:
   - `parivartan://oauth` (for standalone app/production)
   - `exp://192.168.115.153:8081/--/oauth` (for Expo development - use EXACTLY this URL)
   - `https://auth.expo.io/@harshraj001/citizen-app-expo` (for Expo Go published app)
   - `https://localhost:19006/oauth` (for web development)
5. Also add the following to the **Authorized JavaScript origins**:
   - `https://localhost:19006`
   - `https://auth.expo.io`
   - `exp://192.168.115.153:8081`
6. Save your changes

### 2. Verify Project Configuration

1. Make sure your **app.json** has the correct OAuth configuration:
```json
"oauth": {
  "redirectUrl": "parivartan://oauth"
}
```

2. Verify your **scheme** is properly set:
```json
"scheme": "parivartan"
```

### 3. Verify Client IDs

Ensure the client IDs in your code match exactly with those in the Google Cloud Console:

- **Web Client ID**: '656712268788-m9ljjubdsde7vr6s6j20ecpbb28tffb8.apps.googleusercontent.com'
- **Android Client ID**: '656712268788-lup21roadq9cl1sl5nq74l62br1d2vl2.apps.googleusercontent.com'
- **iOS Client ID**: '656712268788-c0sjvosg5rke7t90gq830o69l7bfuk8n.apps.googleusercontent.com'

### 4. Enable Google Sign-In API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Library"
3. Search for "Google Identity" and enable the API if it's not already enabled

### 5. Verify OAuth Consent Screen

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "OAuth consent screen"
3. Ensure it's properly configured with:
   - App information (name, email, etc.)
   - Scopes (email, profile)
   - Test users (during development)
4. Make sure the app is in the appropriate status (testing or production)

### 6. Testing Tips

1. For testing in Expo Go (development), you **MUST** add the exact development URL to your Google Cloud Console:
   ```
   exp://192.168.115.153:8081/--/oauth
   ```
   
   Note: This URL will change if your development server IP changes. You can find the current URL in the console logs.

2. For production/standalone app, use:
   ```
   parivartan://oauth
   ```

### 7. Debugging Redirect URIs

Add this code to log the exact redirect URI being used:

```typescript
// Add this at the component level
React.useEffect(() => {
  const redirectUrl = makeRedirectUri({
    scheme: 'parivartan',
    path: 'oauth'
  });
  console.log('Current redirect URI:', redirectUrl);
}, []);
```

### 8. Common Issues

- **"invalid_request" error**: The redirect URI doesn't match what's configured in the Google Cloud Console
- **"Error 400: invalid_request"**: The development URL isn't added to authorized redirect URIs
- **"unsupported_response_type" error**: The Google Identity API isn't enabled 
- **"access_denied" error**: User denied permission or the app doesn't have proper permissions configured

## After Configuration Changes

Once you've made these changes:

1. Wait a few minutes for Google Cloud changes to propagate
2. Restart your Expo development server: `npx expo start --clear`
3. Try the Google Sign-In process again