# Firebase Setup Instructions

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "flowin-app" (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication
1. In your Firebase project, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Optionally enable "Google" provider for social login

## 3. Setup Firestore Database
1. Go to "Firestore Database" > "Create database"
2. Choose "Start in test mode" (for development)
3. Select your preferred location
4. Once created, go to "Rules" tab and replace with the content from `firestore.rules`

## 4. Configure Web App
1. Go to Project Settings (gear icon) > "General" tab
2. In "Your apps" section, click "Web" app icon (<//>)
3. Register your app with nickname "flowin-web"
4. Copy the configuration object
5. Replace the configuration in `src/lib/firebase.ts`

## 5. Setup Firebase Hosting (Optional)
1. Go to "Hosting" in Firebase console
2. Click "Get started"
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Run `firebase login` to authenticate
5. Run `firebase init` in your project directory
6. Select "Hosting" and follow the prompts
7. Set public directory to "dist"
8. Configure as single-page app: Yes
9. Set up automatic builds with GitHub: Optional

## 6. Environment Variables (Optional)
For better security in production, you can use environment variables:

Create `.env` file:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

Then update `firebase.ts` to use these variables.

## 7. Security Rules
The included `firestore.rules` file provides:
- Users can only access their own data
- Project-based access control
- Task access based on project membership
- Secure comment system

Make sure to deploy these rules to your Firestore database.