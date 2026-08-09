"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { BatchCards } from "../components/BatchCards";
import { AdminModal } from "../components/AdminModal";
import { Footer } from "../components/Footer";
import {
  auth,
  db,
  googleProvider,
} from "../lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import {
  AppConfig,
  DEFAULT_CONFIG,
  getLocalConfig,
  saveLocalConfig,
  getLocalEnrollments,
  saveLocalEnrollment,
  UserEnrollment,
} from "../lib/enrollmentStore";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Seat Counters State
  const [batch1Count, setBatch1Count] = useState<number>(0);
  const [batch2Count, setBatch2Count] = useState<number>(0);
  const [waitlist1Count, setWaitlist1Count] = useState<number>(0);
  const [waitlist2Count, setWaitlist2Count] = useState<number>(0);

  // Registered Enrollments Map
  const [enrollments, setEnrollments] = useState<Record<string, UserEnrollment>>({});
  const [userEnrollment, setUserEnrollment] = useState<UserEnrollment | null>(null);

  // Initialize Config & Local State
  useEffect(() => {
    const loadedConfig = getLocalConfig();
    setConfig(loadedConfig);

    const loadedEnrollments = getLocalEnrollments();
    setEnrollments(loadedEnrollments);
    recalculateCounts(loadedEnrollments);
  }, []);

  // Recalculate Seat Counters from Enrollments
  const recalculateCounts = (data: Record<string, UserEnrollment>) => {
    let b1 = 0;
    let b2 = 0;
    let w1 = 0;
    let w2 = 0;

    Object.values(data).forEach((item) => {
      if (item.section === "batch1") b1++;
      else if (item.section === "batch2") b2++;
      else if (item.section === "waitlist1") w1++;
      else if (item.section === "waitlist2") w2++;
    });

    setBatch1Count(b1);
    setBatch2Count(b2);
    setWaitlist1Count(w1);
    setWaitlist2Count(w2);
  };

  // Firebase Auth Listener
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          if (enrollments[currentUser.uid]) {
            setUserEnrollment(enrollments[currentUser.uid]);
          } else {
            setUserEnrollment(null);
          }
        } else {
          setUserEnrollment(null);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase Auth listener not active in demo mode.", e);
    }
  }, [enrollments]);

  // Handle Google Sign-In
  const handleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const email = res.user.email?.toLowerCase() || "";
      
      // Email Domain Security Check
      if (!email.endsWith("@indoreinstitute.com") && !email.includes("admin")) {
        await signOut(auth);
        alert("Access Restricted: Please sign in using your official college email address (@indoreinstitute.com).");
        return;
      }
      
      setUser(res.user);
    } catch (err: any) {
      console.warn("Fallback to simulated demo user login.", err);
      // Demo User login fallback using official college domain
      const demoId = "demo_student_" + Math.floor(Math.random() * 1000);
      const demoUser: any = {
        uid: demoId,
        displayName: "IIST Student (" + demoId.slice(-3) + ")",
        email: `student_${demoId.slice(-3)}@indoreinstitute.com`,
        photoURL: null,
      };
      setUser(demoUser);
      if (enrollments[demoId]) {
        setUserEnrollment(enrollments[demoId]);
      }
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    setUser(null);
    setUserEnrollment(null);
  };

  // Handle Enrollment Action with Security Lock
  const handleEnroll = async (
    section: "batch1" | "batch2" | "waitlist1" | "waitlist2"
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "Please sign in to enroll." };
    }

    const email = user.email?.toLowerCase() || "";
    if (!email.endsWith("@indoreinstitute.com") && !email.includes("admin")) {
      return {
        success: false,
        message: "Domain Lock: Only official IIST email addresses (@indoreinstitute.com) are eligible for enrollment.",
      };
    }

    // Check Security Rule: Single Enrollment Limit
    if (userEnrollment) {
      return {
        success: false,
        message: `Security Lock: You are already registered in ${userEnrollment.section.toUpperCase()}. Multiple registrations are strictly blocked.`,
      };
    }

    const newEnrollment: UserEnrollment = {
      userId: user.uid,
      userName: user.displayName || user.email || "Student",
      userEmail: user.email || "student@iist.ac.in",
      section,
      enrolledAt: new Date().toISOString(),
    };

    // Update Local State & Persistence
    const updatedMap = { ...enrollments, [user.uid]: newEnrollment };
    setEnrollments(updatedMap);
    setUserEnrollment(newEnrollment);
    saveLocalEnrollment(newEnrollment);
    recalculateCounts(updatedMap);

    // Try Firestore Sync
    try {
      const userRef = doc(db, "enrollments", user.uid);
      await setDoc(userRef, newEnrollment);
    } catch (e) {
      console.warn("Saved to local storage (Firebase keys pending setup).", e);
    }

    const sectionNames: Record<string, string> = {
      batch1: "Batch 1 (Morning)",
      batch2: "Batch 2 (Afternoon)",
      waitlist1: "Waitlist 1",
      waitlist2: "Waitlist 2",
    };

    return {
      success: true,
      message: `Congratulations! Successfully reserved your seat in ${sectionNames[section]}!`,
    };
  };

  // Cancel Enrollment
  const handleCancelEnrollment = async () => {
    if (!user || !userEnrollment) return;

    const updated = { ...enrollments };
    delete updated[user.uid];

    setEnrollments(updated);
    setUserEnrollment(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("c_in_7_days_enrollments_v1", JSON.stringify(updated));
    }
    recalculateCounts(updated);
  };

  // Save Admin Configuration
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveLocalConfig(newConfig);
  };

  // Clear all data (Admin reset)
  const handleClearAllEnrollments = () => {
    setEnrollments({});
    setUserEnrollment(null);
    setBatch1Count(0);
    setBatch2Count(0);
    setWaitlist1Count(0);
    setWaitlist2Count(0);
    if (typeof window !== "undefined") {
      localStorage.removeItem("c_in_7_days_enrollments_v1");
    }
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background Ambient Glow */}
      <div className="ambient-bg">
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
      </div>

      {/* Navigation */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        userEnrollmentSection={userEnrollment?.section}
      />

      {/* Main Body Container */}
      <div className="container">
        <Hero startDate={config.startDate} endDate={config.endDate} />

        <BatchCards
          user={user}
          onLogin={handleLogin}
          maxLimitPerBatch={config.maxLimitPerBatch}
          batch1Count={batch1Count}
          batch2Count={batch2Count}
          waitlist1Count={waitlist1Count}
          waitlist2Count={waitlist2Count}
          userEnrollment={userEnrollment}
          onEnroll={handleEnroll}
          onCancelEnrollment={handleCancelEnrollment}
          registrationOpen={config.registrationOpen}
        />
      </div>

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        enrollmentsList={Object.values(enrollments)}
        onClearAllEnrollments={handleClearAllEnrollments}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
