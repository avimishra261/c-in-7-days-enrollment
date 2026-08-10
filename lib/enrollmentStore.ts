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
  communityWhatsappLink: string;
  batch1WhatsappLink: string;
  batch2WhatsappLink: string;
  waitlist1WhatsappLink: string;
  waitlist2WhatsappLink: string;
}

export interface UserEnrollment {
  userId: string;
  userName: string;
  userEmail: string;
  phone?: string;
  collegeSection?: string;
  careerGoal?: string;
  section: "batch1" | "batch2" | "waitlist1" | "waitlist2";
  enrolledAt: string;
}

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

// 4 Exact WhatsApp Group Links
export const BATCH_1_WHATSAPP_LINK = "https://chat.whatsapp.com/KQGuFSxx3lAD7ONoJHAjOv";
export const BATCH_2_WHATSAPP_LINK = "https://chat.whatsapp.com/GcbDVfxJ8Zm0KL1mnwswJH";
export const WAITLIST_1_WHATSAPP_LINK = "https://chat.whatsapp.com/Lg8WrWrUzRwAhkGgDrnjFD";
export const WAITLIST_2_WHATSAPP_LINK = "https://chat.whatsapp.com/I2hiOGf0zhTHnI56IEfNBS";
export const COMMUNITY_WHATSAPP_LINK = "https://chat.whatsapp.com/LcftSfX9baA9tqH4ftmajw";

// Initial Default Settings & Announcements
export const DEFAULT_CONFIG: AppConfig = {
  startDate: "2026-08-10T09:00",
  endDate: "2026-08-17T23:59",
  maxLimitPerBatch: 4, // Initial test limit requested in Idea.txt
  registrationOpen: true,
  communityWhatsappLink: COMMUNITY_WHATSAPP_LINK,
  batch1WhatsappLink: BATCH_1_WHATSAPP_LINK,
  batch2WhatsappLink: BATCH_2_WHATSAPP_LINK,
  waitlist1WhatsappLink: WAITLIST_1_WHATSAPP_LINK,
  waitlist2WhatsappLink: WAITLIST_2_WHATSAPP_LINK,
  announcements: [
    {
      id: "ann_1",
      title: "Welcome to C in 7 Days Bootcamp!",
      content: "All registered students please make sure you join your respective batch WhatsApp group and install GCC compiler / Code::Blocks before Day 1.",
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      postedBy: "Mr. Ashish Singh",
    },
  ],
};

const STORAGE_KEY = "c_in_7_days_enrollments_v3";
const CONFIG_KEY = "c_in_7_days_config_v3";
const SESSION_USER_KEY = "c_in_7_days_session_user_v3";
const ACCOUNTS_KEY = "c_in_7_days_user_accounts_v3";

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

export function saveLocalEnrollment(enrollment: UserEnrollment) {
  const current = getLocalEnrollments();
  current[enrollment.userId] = enrollment;
  saveLocalEnrollmentMap(current);
}

// User Accounts Database Store
export function getRegisteredAccounts(): Record<string, UserAccount> {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem(ACCOUNTS_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return {};
}

export function registerUserAccount(name: string, email: string, password: string): { success: boolean; message: string; account?: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanEmail.endsWith("@indoreinstitute.com") && !cleanEmail.includes("admin")) {
    return { success: false, message: "Access Restricted: Email must end with @indoreinstitute.com" };
  }

  if (password.length < 4) {
    return { success: false, message: "Password must be at least 4 characters." };
  }

  const accounts = getRegisteredAccounts();
  if (accounts[cleanEmail]) {
    return { success: false, message: "An account with this email already exists. Please Sign In instead." };
  }

  const uid = "std_" + cleanEmail.replace(/[^a-z0-9]/g, "_");
  const newAccount: UserAccount = {
    uid,
    name: cleanName,
    email: cleanEmail,
    passwordHash: btoa(password),
    createdAt: new Date().toISOString(),
  };

  accounts[cleanEmail] = newAccount;
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  return { success: true, message: "Account registered successfully!", account: newAccount };
}

export function authenticateUserAccount(email: string, password: string): { success: boolean; message: string; account?: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  const account = accounts[cleanEmail];

  if (!account) {
    return { success: false, message: "No account found with this email. Please Sign Up first." };
  }

  if (account.passwordHash !== btoa(password)) {
    return { success: false, message: "Incorrect password. Please verify your password and try again." };
  }

  return { success: true, message: "Authentication successful!", account };
}

// Persistent User Session
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
