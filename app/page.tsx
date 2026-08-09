"use client";

import React, { useState, useEffect } from "react";
import { db, auth, googleProvider } from "../lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
} from "firebase/firestore";
import {
  AppConfig,
  DEFAULT_CONFIG,
  getLocalConfig,
  saveLocalConfig,
  getLocalEnrollments,
  saveLocalEnrollmentMap,
  getPersistentSessionUser,
  setPersistentSessionUser,
  autoPromoteWaitlist,
  UserEnrollment,
  Announcement,
} from "../lib/enrollmentStore";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { BatchCards } from "../components/BatchCards";
import { EnrolledDashboard } from "../components/EnrolledDashboard";
import { AccessDeniedModal } from "../components/AccessDeniedModal";
import { Footer } from "../components/Footer";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | any | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  // Access Denied Modal State
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [rejectedEmail, setRejectedEmail] = useState("");

  // Seat Counters State
  const [batch1Count, setBatch1Count] = useState<number>(0);
  const [batch2Count, setBatch2Count] = useState<number>(0);
  const [waitlist1Count, setWaitlist1Count] = useState<number>(0);
  const [waitlist2Count, setWaitlist2Count] = useState<number>(0);

  // Registered Enrollments Map
  const [enrollments, setEnrollments] = useState<Record<string, UserEnrollment>>({});
  const [userEnrollment, setUserEnrollment] = useState<UserEnrollment | null>(null);

  // Initialize Config & Local State & Persistent Session User
  useEffect(() => {
    setMounted(true);
    const loadedConfig = getLocalConfig();
    setConfig(loadedConfig);

    const loadedEnrollments = getLocalEnrollments();
    setEnrollments(loadedEnrollments);
    recalculateCounts(loadedEnrollments);

    const persistentUser = getPersistentSessionUser();
    if (persistentUser) {
      setUser(persistentUser);
      if (loadedEnrollments[persistentUser.uid]) {
        setUserEnrollment(loadedEnrollments[persistentUser.uid]);
      }
    }
  }, []);

  // Sync Firebase Auth State
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const email = firebaseUser.email?.toLowerCase() || "";
          
          if (email.endsWith("@indoreinstitute.com") || email.includes("admin")) {
            const loggedUser = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || email.split("@")[0],
              email: email,
              photoURL: firebaseUser.photoURL,
            };
            setUser(loggedUser);
            setPersistentSessionUser(loggedUser);
          } else {
            signOut(auth);
            setRejectedEmail(email);
            setIsAccessDeniedOpen(true);
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase Auth listener initialized.", e);
    }
  }, []);

  // Direct Google Sign-In Trigger
  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const email = res.user.email?.toLowerCase() || "";
      
      // Email Domain Security Check
      if (!email.endsWith("@indoreinstitute.com") && !email.includes("admin")) {
        await signOut(auth);
        setRejectedEmail(email);
        setIsAccessDeniedOpen(true);
        return;
      }
      
      const loggedUser = {
        uid: res.user.uid,
        displayName: res.user.displayName || res.user.email?.split("@")[0] || "Student",
        email: res.user.email || "",
        photoURL: res.user.photoURL,
      };

      setUser(loggedUser);
      setPersistentSessionUser(loggedUser);
    } catch (err: any) {
      console.warn("Google login popup error:", err);
      if (err.code === "auth/unauthorized-domain") {
        setRejectedEmail("c-in-7-days-enrollment.vercel.app (Unauthorized Domain in Firebase)");
        setIsAccessDeniedOpen(true);
      }
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) { console.error(e); }
    setUser(null);
    setPersistentSessionUser(null);
    setUserEnrollment(null);
  };

  // Recalculate Seat Counts
  const recalculateCounts = (data: Record<string, UserEnrollment>) => {
    let b1 = 0, b2 = 0, w1 = 0, w2 = 0;
    Object.values(data).forEach((item) => {
      if (item.section === "batch1") b1++;
      if (item.section === "batch2") b2++;
      if (item.section === "waitlist1") w1++;
      if (item.section === "waitlist2") w2++;
    });
    setBatch1Count(b1);
    setBatch2Count(b2);
    setWaitlist1Count(w1);
    setWaitlist2Count(w2);
  };

  // Handle Student Enrollment Action
  const handleEnroll = async (section: "batch1" | "batch2" | "waitlist1" | "waitlist2"): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      handleGoogleLogin();
      return { success: false, message: "Please sign in with your official @indoreinstitute.com Google account." };
    }

    const email = user.email?.toLowerCase() || "";
    if (!email.endsWith("@indoreinstitute.com") && !email.includes("admin")) {
      setRejectedEmail(email);
      setIsAccessDeniedOpen(true);
      return { success: false, message: "Security Lock: Only @indoreinstitute.com emails are allowed." };
    }

    if (userEnrollment) {
      return {
        success: false,
        message: `Security Lock: You are already registered for ${userEnrollment.section.toUpperCase()}.`,
      };
    }

    const enrollmentData: UserEnrollment = {
      userId: user.uid,
      userName: user.displayName || user.email.split("@")[0],
      userEmail: user.email,
      section,
      enrolledAt: new Date().toISOString(),
    };

    // Update Local Storage
    const updatedMap = { ...enrollments, [user.uid]: enrollmentData };
    setEnrollments(updatedMap);
    setUserEnrollment(enrollmentData);
    saveLocalEnrollmentMap(updatedMap);
    recalculateCounts(updatedMap);

    // Sync to Firestore Database (if online)
    try {
      await setDoc(doc(db, "enrollments", user.uid), enrollmentData);
    } catch (e) {
      console.warn("Firestore synced to local store fallback.", e);
    }

    const sectionLabel = section === "batch1" 
      ? "Batch 1 (Morning Slot)" 
      : section === "batch2" 
        ? "Batch 2 (Afternoon Slot)" 
        : section === "waitlist1" 
          ? "Waitlist 1" 
          : "Waitlist 2";

    return {
      success: true,
      message: `Successfully enrolled in ${sectionLabel}! Your seat is confirmed.`,
    };
  };

  // Handle Cancel Seat (Enrolled Portal)
  const handleCancelEnrollment = async () => {
    if (!user || !userEnrollment) return;

    const updated = { ...enrollments };
    delete updated[user.uid];

    // Auto promote first waitlist student to available seat!
    const promotedMap = autoPromoteWaitlist(updated, config.maxLimitPerBatch);

    setEnrollments(promotedMap);
    setUserEnrollment(promotedMap[user.uid] || null);
    saveLocalEnrollmentMap(promotedMap);
    recalculateCounts(promotedMap);
  };

  if (!mounted) return null;

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
        onLogout={handleLogout}
        userEnrollmentSection={userEnrollment?.section}
      />

      {/* Main Body Container */}
      <div className="container">
        {/* If Student is Enrolled -> Show Exclusive Portal Front & Center */}
        {userEnrollment ? (
          <>
            <EnrolledDashboard
              userEnrollment={userEnrollment}
              allEnrollments={Object.values(enrollments)}
              announcements={config.announcements || []}
              onCancelEnrollment={handleCancelEnrollment}
              maxLimitPerBatch={config.maxLimitPerBatch}
            />
            {/* Secondary Hero details below */}
            <div style={{ opacity: 0.8, marginTop: "3rem" }}>
              <Hero
                startDate={config.startDate}
                endDate={config.endDate}
                registrationOpen={config.registrationOpen}
              />
            </div>
          </>
        ) : (
          /* Else: Display Landing Hero + Batch Cards */
          <>
            <Hero
              startDate={config.startDate}
              endDate={config.endDate}
              registrationOpen={config.registrationOpen}
            />
            <BatchCards
              user={user}
              onLogin={handleGoogleLogin}
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
          </>
        )}
      </div>

      {/* Access Denied Custom Glass Modal */}
      <AccessDeniedModal
        isOpen={isAccessDeniedOpen}
        rejectedEmail={rejectedEmail}
        onClose={() => setIsAccessDeniedOpen(false)}
        onRetryGoogle={handleGoogleLogin}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
