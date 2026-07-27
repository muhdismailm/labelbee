import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountStr) {
      console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin SDK not initialized.");
    } else {
      let rawJson = serviceAccountStr;
      // Handle base64 encoded string if provided
      if (!rawJson.trim().startsWith("{")) {
        try {
          rawJson = Buffer.from(rawJson, "base64").toString("utf-8");
        } catch {
          // If not base64, proceed with original string
        }
      }
      const serviceAccount = JSON.parse(rawJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const adminDb = admin.apps.length ? admin.firestore() : null;

export { admin, adminDb };
