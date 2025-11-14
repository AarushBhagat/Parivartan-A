/**
 * Debug utility functions
 */
import { auth, getLastTokenRefreshTime } from '../firebase';

/**
 * Log the current user state to console for debugging purposes
 */
export const debugUserState = async (source: string = 'Unknown') => {
  const currentUser = auth.currentUser;
  
  console.log('=== Debug User State ===');
  console.log(`Source: ${source}`);
  console.log(`Current Time: ${new Date().toISOString()}`);
  
  if (currentUser) {
    console.log('Firebase Auth User:');
    console.log(`- UID: ${currentUser.uid}`);
    console.log(`- Display Name: ${currentUser.displayName}`);
    console.log(`- Email: ${currentUser.email}`);
    console.log(`- Email Verified: ${currentUser.emailVerified}`);
    console.log(`- Photo URL: ${currentUser.photoURL}`);
    console.log(`- Phone Number: ${currentUser.phoneNumber}`);
    console.log(`- Metadata: ${JSON.stringify({
      creationTime: currentUser.metadata.creationTime,
      lastSignInTime: currentUser.metadata.lastSignInTime
    })}`);
    
    // Get token claims (this can show additional user data)
    try {
      const token = await currentUser.getIdTokenResult();
      console.log('Token Claims:', JSON.stringify(token.claims, null, 2));
    } catch (err) {
      console.error('Error getting token claims:', err);
    }
    
    // Show when the token was last refreshed
    try {
      const lastRefreshTime = await getLastTokenRefreshTime();
      if (lastRefreshTime) {
        console.log(`Last Token Refresh: ${lastRefreshTime.toISOString()}`);
      } else {
        console.log('Could not determine last token refresh time');
      }
    } catch (err) {
      console.log('Could not determine last token refresh time');
    }
  } else {
    console.log('No Firebase Auth User is logged in');
  }
  
  console.log('=====================');
};

export default { debugUserState };