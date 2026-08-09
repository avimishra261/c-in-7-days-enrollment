import { db, auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, runTransaction } from "firebase/firestore";

export interface BatchData {
  enrolledCount: number;
  maxLimit: number;
  waitlistCount: number;
}

export interface AppConfig {
  startDate: string;
  endDate: string;
  maxLimitPerBatch: number;
  registrationOpen: boolean;
}

export interface UserEnrollment {
  userId: string;
  userName: string;
  userEmail: string;
  section: "batch1" | "batch2" | "waitlist1" | "waitlist2";
  enrolledAt: string;
}

// Initial Default Settings
export const DEFAULT_CONFIG: AppConfig = {
  startDate: "2026-08-10T09:00",
  endDate: "2026-08-17T23:59",
  maxLimitPerBatch: 4, // Initial test limit requested in Idea.txt
  registrationOpen: true,
};

// Local storage fallback key for offline/demo testing
const STORAGE_KEY = "c_in_7_days_enrollments_v1";
const CONFIG_KEY = "c_in_7_days_config_v1";

export function getLocalConfig(): AppConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return DEFAULT_CONFIG;
}

export function saveLocalConfig(config: AppConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
}

export function getLocalEnrollments(): Record<string, UserEnrollment> {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return {};
}

export function saveLocalEnrollment(enrollment: UserEnrollment) {
  if (typeof window !== "undefined") {
    const current = getLocalEnrollments();
    current[enrollment.userId] = enrollment;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
}
