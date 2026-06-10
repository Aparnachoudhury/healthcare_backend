import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
export default db;
