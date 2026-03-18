import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

export const configuredAdminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseConfig = {
  apiKey: envConfig.apiKey || "AIzaSyDzWAex1ulipCrIIbMIoMALcOj4pNvcNXg",
  authDomain: envConfig.authDomain || "potfulio.firebaseapp.com",
  projectId: envConfig.projectId || "potfulio",
  storageBucket: envConfig.storageBucket || "potfulio.firebasestorage.app",
  messagingSenderId: envConfig.messagingSenderId || "469816338057",
  appId: envConfig.appId || "1:469816338057:web:86d220fe1a6462eb218858",
  measurementId: envConfig.measurementId || "G-V6BFKQCYP9",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

let analyticsInstance: Analytics | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;

  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  analyticsInstance = getAnalytics(firebaseApp);
  return analyticsInstance;
};

export const trackFirebaseEvent = async (eventName: string, params?: Record<string, unknown>) => {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
};

export const bootstrapFirebase = async () => {
  const usingFallback = Object.values(envConfig).some((value) => !value);
  if (usingFallback) {
    console.warn("[firebase] One or more env values are missing. Using fallback config.");
  }
  console.info(`[firebase] Project: ${firebaseConfig.projectId} | Auth domain: ${firebaseConfig.authDomain}`);

  await setPersistence(auth, browserLocalPersistence).catch(() => undefined);
  await getFirebaseAnalytics();
};

export const signInAdmin = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signOutAdmin = () => signOut(auth);

export const isAllowedAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  if (!configuredAdminEmail) return true;
  return String(user.email || "").trim().toLowerCase() === configuredAdminEmail;
};

export const waitForAuthReady = () =>
  new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
