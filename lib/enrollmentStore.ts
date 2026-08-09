import { db, auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, runTransaction } from "firebase/firestore";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  postedBy: string;
}

export interface AppConfig {
  startDate: string;
  endDate: string;
  maxLimitPerBatch: number;
  registrationOpen: boolean;
  announcements: Announcement[];
}

export interface UserEnrollment {
  userId: string;
  userName: string;
  userEmail: string;
  section: "batch1" | "batch2" | "waitlist1" | "waitlist2";
  enrolledAt: string;
}

// Initial Default Settings & Announcements
export const DEFAULT_CONFIG: AppConfig = {
  startDate: "2026-08-10T09:00",
  endDate: "2026-08-17T23:59",
  maxLimitPerBatch: 4, // Initial test limit requested in Idea.txt
  registrationOpen: true,
  announcements: [
    {
      id: "ann_1",
      title: "Welcome to C in 7 Days Bootcamp!",
      content: "All registered students please make sure you have GCC compiler or Code::Blocks installed on your laptops before Day 1. Class timings for Batch 1 and Batch 2 will be shared shortly.",
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      postedBy: "Mr. Ashish Singh",
    },
  ],
};

const STORAGE_KEY = "c_in_7_days_enrollments_v2";
const CONFIG_KEY = "c_in_7_days_config_v2";
const SESSION_USER_KEY = "c_in_7_days_session_user_v2";

export function getLocalConfig(): AppConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch (e) { console.error(e); }
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

export function saveLocalEnrollmentMap(map: Record<string, UserEnrollment>) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }
}

// Persistent Test User Session (to prevent session ID changing randomly)
export function getPersistentSessionUser(): { uid: string; displayName: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(SESSION_USER_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return null;
}

export function setPersistentSessionUser(user: { uid: string; displayName: string; email: string } | null) {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_USER_KEY);
    }
  }
}

// Auto-Promote First Student from Waitlist when a Batch seat frees up!
export function autoPromoteWaitlist(
  enrollmentsMap: Record<string, UserEnrollment>,
  maxLimitPerBatch: number
): Record<string, UserEnrollment> {
  const updated = { ...enrollmentsMap };

  // Calculate current counts
  let batch1Count = 0;
  let batch2Count = 0;

  Object.values(updated).forEach((item) => {
    if (item.section === "batch1") batch1Count++;
    if (item.section === "batch2") batch2Count++;
  });

  // Promote Waitlist 1 -> Batch 1 if space opens up
  if (batch1Count < maxLimitPerBatch) {
    const waitlist1Students = Object.values(updated)
      .filter((item) => item.section === "waitlist1")
      .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());

    if (waitlist1Students.length > 0) {
      const firstInWaitlist = waitlist1Students[0];
      updated[firstInWaitlist.userId] = {
        ...firstInWaitlist,
        section: "batch1",
      };
      console.log(`[Auto-Promoted] ${firstInWaitlist.userName} from Waitlist 1 to Batch 1`);
    }
  }

  // Promote Waitlist 2 -> Batch 2 if space opens up
  if (batch2Count < maxLimitPerBatch) {
    const waitlist2Students = Object.values(updated)
      .filter((item) => item.section === "waitlist2")
      .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());

    if (waitlist2Students.length > 0) {
      const firstInWaitlist = waitlist2Students[0];
      updated[firstInWaitlist.userId] = {
        ...firstInWaitlist,
        section: "batch2",
      };
      console.log(`[Auto-Promoted] ${firstInWaitlist.userName} from Waitlist 2 to Batch 2`);
    }
  }

  return updated;
}
