# Parivartan Citizen App

## Google Authentication Implementation

This application uses Expo's `expo-auth-session` for Google authentication, which is compatible with the Expo managed workflow.

### Authentication Flow

1. The app uses `expo-auth-session/providers/google` to initiate the Google authentication process
2. Upon successful authentication, the OAuth2 access token is obtained and passed to Firebase for authentication
3. Firebase verifies the token and creates or authenticates the user
4. The auth state is managed through the AuthContext

### Setup Instructions

#### 1. Google Cloud Console Configuration

In the [Google Cloud Console](https://console.cloud.google.com/):

1. Create a project (or use existing one)
2. Navigate to "APIs & Services" > "OAuth consent screen"
   - Configure the app name, support email, and developer contact information
   - Add necessary scopes (email, profile)
   - Add test users during development
3. Navigate to "APIs & Services" > "Credentials"
   - Create an OAuth 2.0 Client ID (Web application)
   - Create an OAuth 2.0 Client ID (Android)
   - Create an OAuth 2.0 Client ID (iOS)
4. Add authorized redirect URIs:
   - `parivartan://oauth` (for native mobile)
   - `https://auth.expo.io/@username/app-slug` (for Expo Go development)
   - `https://localhost:19006` (for web development)

#### 2. App Configuration

1. In `app.json`:
   ```json
   {
     "expo": {
       "scheme": "parivartan",
       "oauth": {
         "redirectUrl": "parivartan://oauth"
       }
     }
   }
   ```

2. In your authentication screens:
   ```typescript
   import * as WebBrowser from 'expo-web-browser';
   import * as Google from 'expo-auth-session/providers/google';
   import { makeRedirectUri } from 'expo-auth-session';
   
   // Initialize WebBrowser
   WebBrowser.maybeCompleteAuthSession();
   
   // Configure Google auth
   const [request, response, promptAsync] = Google.useAuthRequest({
     clientId: 'YOUR_WEB_CLIENT_ID', // Web client ID from Google Cloud
     androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Android client ID
     iosClientId: 'YOUR_IOS_CLIENT_ID', // iOS client ID
     scopes: ['profile', 'email'],
     redirectUri: makeRedirectUri({
       scheme: 'parivartan',
       path: 'oauth'
     }),
     usePKCE: true
   });
   ```

3. Handle the sign-in flow:
   ```typescript
   // Trigger sign-in
   const handleGoogleSignIn = async () => {
     await promptAsync();
   };
   
   // Handle the response
   React.useEffect(() => {
     if (response?.type === 'success') {
       const { authentication } = response;
       // Use the accessToken to sign in with Firebase
       googleSignIn(authentication.accessToken);
     }
   }, [response]);
   ```

### Authentication Dependencies

- `expo-auth-session` - For OAuth flow
- `expo-web-browser` - For handling auth redirects
- Firebase Authentication - Backend authentication

### Troubleshooting

#### Common Issues

1. **Authorization Error**: Typically caused by mismatched redirect URIs in Google Cloud Console
2. **Invalid Client ID**: Ensure client IDs are correctly configured for each platform
3. **Native Module Error**: If using `@react-native-google-signin/google-signin` in Expo managed workflow

#### Solutions

- Native modules like `@react-native-google-signin/google-signin` are NOT compatible with Expo managed workflow without ejection or using development builds with custom native code
- Always use `expo-auth-session` for OAuth flows in Expo managed apps
- After making changes to Google Cloud Console, wait a few minutes for changes to propagate
- Use the correct client ID for each platform (web, Android, iOS)
- For detailed troubleshooting, see `GOOGLE_AUTH_SETUP.md`
