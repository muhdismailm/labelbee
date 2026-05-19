import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountStr) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin SDK not initialized.");
    } else {
      const serviceAccount = JSON.parse(serviceAccountStr);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
  }
}

const adminDb = admin.apps.length ? admin.firestore() : null;

export { admin, adminDb };
