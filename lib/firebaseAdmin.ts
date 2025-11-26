import admin from 'firebase-admin';

declare global {
  // eslint-disable-next-line no-var
  var __firebaseAdminApp: admin.app.App | undefined;
}

export function getAdminApp(): admin.app.App {
  if (global.__firebaseAdminApp) return global.__firebaseAdminApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not set in environment (server-only).');
  }

  const serviceAccount = typeof serviceAccountJson === 'string'
    ? JSON.parse(serviceAccountJson)
    : serviceAccountJson;

  global.__firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  return global.__firebaseAdminApp;
}