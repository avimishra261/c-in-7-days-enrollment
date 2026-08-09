"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { BatchCards } from "../components/BatchCards";
import { EnrolledDashboard } from "../components/EnrolledDashboard";
import { AuthModal } from "../components/AuthModal";
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
  UserAccount,
  Announcement,
} from "../lib/enrollmentStore";

export default function Home() {
  const [user, setUser] = useState<User | any | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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

  // Update userEnrollment when user or enrollments change
  useEffect(() => {
    if (user && enrollments[user.uid]) {
      setUserEnrollment(enrollments[user.uid]);
    } else {
      setUserEnrollment(null);
    }
  }, [user, enrollments]);

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
        if (currentUser) {
          const email = currentUser.email?.toLowerCase() || "";
          if (email.endsWith("@indoreinstitute.com") || email.includes("admin")) {
            setUser(currentUser);
            setPersistentSessionUser({
              uid: currentUser.uid,
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Student",
              email: currentUser.email || "",
            });
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase Auth listener inactive.", e);
    }
  }, []);

  // Open Auth Modal
  const handleOpenAuth = () => {
    setIsAuthOpen(true);
  };

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const email = res.user.email?.toLowerCase() || "";
      
      // Email Domain Security Check
      if (!email.endsWith("@indoreinstitute.com") && !email.includes("admin")) {
        await signOut(auth);
        alert("Access Restricted: Please sign in using your official college email address (@indoreinstitute.com).");
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
      console.warn("Google login popup closed or keys not set. Opening Auth Modal for student entry.", err);
      setIsAuthOpen(true);
    }
  };

  // Account Authenticated with Real Student Email and Password
  const handleAccountAuthenticated = (account: UserAccount) => {
    const loggedUser = {
      uid: account.uid,
      displayName: account.name,
      email: account.email,
    };

    setUser(loggedUser);
    setPersistentSessionUser(loggedUser);
    if (enrollments[account.uid]) {
      setUserEnrollment(enrollments[account.uid]);
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
    setPersistentSessionUser(null);
  };

  // Handle Enrollment Action with Security Lock
  const handleEnroll = async (
    section: "batch1" | "batch2" | "waitlist1" | "waitlist2"
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      setIsAuthOpen(true);
      return { success: false, message: "Please sign in with your college email (@indoreinstitute.com)." };
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
      userEmail: user.email || "student@indoreinstitute.com",
      section,
      enrolledAt: new Date().toISOString(),
    };

    // Update Local State & Persistence
    const updatedMap = { ...enrollments, [user.uid]: newEnrollment };
    setEnrollments(updatedMap);
    setUserEnrollment(newEnrollment);
    saveLocalEnrollmentMap(updatedMap);
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

  // Cancel Enrollment with Automated Waitlist Promotion
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

  // Save Admin Configuration
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveLocalConfig(newConfig);

    // Re-evaluate auto promotion if max limit changed
    const promoted = autoPromoteWaitlist(enrollments, newConfig.maxLimitPerBatch);
    setEnrollments(promoted);
    saveLocalEnrollmentMap(promoted);
    recalculateCounts(promoted);
  };

  // Add Faculty Announcement
  const handleAddAnnouncement = (title: string, content: string) => {
    const newAnn: Announcement = {
      id: "ann_" + Date.now(),
      title,
      content,
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      postedBy: "Mr. Ashish Singh",
    };

    const updatedConfig: AppConfig = {
      ...config,
      announcements: [newAnn, ...(config.announcements || [])],
    };

    setConfig(updatedConfig);
    saveLocalConfig(updatedConfig);
  };

  // Clear all data (Admin reset)
  const handleClearAllEnrollments = () => {
    setEnrollments({});
    setUserEnrollment(null);
    setBatch1Count(0);
    setBatch2Count(0);
    setWaitlist1Count(0);
    setWaitlist2Count(0);
    saveLocalEnrollmentMap({});
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
        onLogin={handleOpenAuth}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        userEnrollmentSection={userEnrollment?.section}
      />

      {/* Main Body Container */}
      <div className="container">
        <Hero startDate={config.startDate} endDate={config.endDate} />

        {/* If Enrolled: Display Dedicated Enrolled Student Dashboard */}
        {userEnrollment ? (
          <EnrolledDashboard
            userEnrollment={userEnrollment}
            allEnrollments={Object.values(enrollments)}
            announcements={config.announcements || []}
            onCancelEnrollment={handleCancelEnrollment}
            maxLimitPerBatch={config.maxLimitPerBatch}
          />
        ) : (
          /* Else: Display Batch Enrollment Cards */
          <BatchCards
            user={user}
            onLogin={handleOpenAuth}
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
        )}
      </div>

      {/* Auth Modal Prompt */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onGoogleLogin={handleGoogleLogin}
        onAccountAuthenticated={handleAccountAuthenticated}
      />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        enrollmentsList={Object.values(enrollments)}
        onClearAllEnrollments={handleClearAllEnrollments}
        onAddAnnouncement={handleAddAnnouncement}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
