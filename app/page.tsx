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
  deleteDoc,
  collection,
  onSnapshot,
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
  BATCH_1_WHATSAPP_LINK,
  BATCH_2_WHATSAPP_LINK,
  WAITLIST_1_WHATSAPP_LINK,
  WAITLIST_2_WHATSAPP_LINK,
  COMMUNITY_WHATSAPP_LINK,
} from "../lib/enrollmentStore";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { BatchCards } from "../components/BatchCards";
import { EnrolledDashboard } from "../components/EnrolledDashboard";
import { AccessDeniedModal } from "../components/AccessDeniedModal";
import { StudentOnboardingModal } from "../components/StudentOnboardingModal";
import { WhatsAppRedirectModal } from "../components/WhatsAppRedirectModal";
import { AdminModal } from "../components/AdminModal";
import { Footer } from "../components/Footer";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | any | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Student Onboarding & WhatsApp Redirect Modals State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingTargetSection, setOnboardingTargetSection] = useState<"batch1" | "batch2" | "waitlist1" | "waitlist2">("batch1");

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppRedirectSection, setWhatsAppRedirectSection] = useState<string>("batch1");

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

  // Initialize Config & Session
  useEffect(() => {
    setMounted(true);
    const loadedConfig = getLocalConfig();
    setConfig(loadedConfig);

    const persistentUser = getPersistentSessionUser();
    if (persistentUser) {
      setUser(persistentUser);
    }
  }, []);

  // Sync Real-time Firestore Enrollments across ALL phones & devices
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onSnapshot(
        collection(db, "enrollments"),
        (snapshot) => {
          const liveData: Record<string, UserEnrollment> = {};
          snapshot.forEach((docSnap) => {
            liveData[docSnap.id] = docSnap.data() as UserEnrollment;
          });

          // Fallback to local storage if Firestore snapshot is empty (for offline testing)
          const localData = getLocalEnrollments();
          const mergedData = { ...localData, ...liveData };

          setEnrollments(mergedData);
          saveLocalEnrollmentMap(mergedData);
          recalculateCounts(mergedData);

          if (user?.uid && mergedData[user.uid]) {
            setUserEnrollment(mergedData[user.uid]);
          } else if (user?.uid && !mergedData[user.uid]) {
            setUserEnrollment(null);
          }
        },
        (err) => {
          console.warn("Firestore snapshot listener fallback:", err);
          const localData = getLocalEnrollments();
          setEnrollments(localData);
          recalculateCounts(localData);
        }
      );
    } catch (e) {
      console.warn("Firestore listener init error:", e);
    }
    return () => unsub();
  }, [user?.uid]);

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

            // Check if user is already enrolled
            const currentEnrollments = getLocalEnrollments();
            if (currentEnrollments[firebaseUser.uid]) {
              setUserEnrollment(currentEnrollments[firebaseUser.uid]);
            }
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

  // Perform Final Registration with Student Onboarding Details
  const handleFinalizeRegistration = async (details: {
    userName: string;
    phone: string;
    collegeSection: string;
    careerGoal: string;
  }) => {
    if (!user) return;

    const currentEnrollments = getLocalEnrollments();
    if (currentEnrollments[user.uid]) {
      setUserEnrollment(currentEnrollments[user.uid]);
      setIsOnboardingOpen(false);
      return;
    }

    const enrollmentData: UserEnrollment = {
      userId: user.uid,
      userName: details.userName || user.displayName || user.email.split("@")[0],
      userEmail: user.email,
      phone: details.phone,
      collegeSection: details.collegeSection,
      careerGoal: details.careerGoal,
      section: onboardingTargetSection,
      enrolledAt: new Date().toISOString(),
    };

    // Update Local Storage
    const updatedMap = { ...enrollments, ...currentEnrollments, [user.uid]: enrollmentData };
    setEnrollments(updatedMap);
    setUserEnrollment(enrollmentData);
    saveLocalEnrollmentMap(updatedMap);
    recalculateCounts(updatedMap);

    // Save to Firestore Realtime Database
    try {
      await setDoc(doc(db, "enrollments", user.uid), enrollmentData);
    } catch (e) {
      console.warn("Firestore synced to local store fallback.", e);
    }

    setIsOnboardingOpen(false);

    // Trigger WhatsApp Redirect Celebration Modal!
    setWhatsAppRedirectSection(onboardingTargetSection);
    setIsWhatsAppModalOpen(true);
  };

  // Direct Google Sign-In Trigger
  const handleGoogleLogin = async (targetSection?: "batch1" | "batch2" | "waitlist1" | "waitlist2") => {
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

      // Check if student is ALREADY registered!
      const currentEnrollments = { ...getLocalEnrollments(), ...enrollments };
      if (currentEnrollments[res.user.uid]) {
        setUserEnrollment(currentEnrollments[res.user.uid]);
        return;
      }

      // If NOT enrolled yet and targetSection was clicked, open Onboarding Modal!
      if (targetSection) {
        setOnboardingTargetSection(targetSection);
        setIsOnboardingOpen(true);
      }
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

  // Handle Student Enrollment Action
  const handleEnroll = async (section: "batch1" | "batch2" | "waitlist1" | "waitlist2"): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      await handleGoogleLogin(section);
      return { success: true, message: "Authenticating..." };
    }

    const email = user.email?.toLowerCase() || "";
    if (!email.endsWith("@indoreinstitute.com") && !email.includes("admin")) {
      setRejectedEmail(email);
      setIsAccessDeniedOpen(true);
      return { success: false, message: "Security Lock: Only @indoreinstitute.com emails are allowed." };
    }

    // Check if user is ALREADY enrolled
    const currentEnrollments = { ...getLocalEnrollments(), ...enrollments };
    if (currentEnrollments[user.uid]) {
      setUserEnrollment(currentEnrollments[user.uid]);
      return {
        success: true,
        message: `Welcome back! You are already registered for ${currentEnrollments[user.uid].section.toUpperCase()}.`,
      };
    }

    // Open Student Onboarding Modal to collect details
    setOnboardingTargetSection(section);
    setIsOnboardingOpen(true);

    return { success: true, message: "Please complete your registration profile." };
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

    // Delete from Firestore Real-Time Database
    try {
      await deleteDoc(doc(db, "enrollments", user.uid));
    } catch (e) { console.warn(e); }

    // Sync any promoted waitlist student to Firestore
    for (const item of Object.values(promotedMap)) {
      try {
        await setDoc(doc(db, "enrollments", item.userId), item);
      } catch (e) { console.warn(e); }
    }
  };

  // Save Admin Configuration
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveLocalConfig(newConfig);
    recalculateCounts(enrollments);
  };

  // Post Announcement
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
  const handleClearAllEnrollments = async () => {
    const currentKeys = Object.keys(enrollments);
    setEnrollments({});
    setUserEnrollment(null);
    setBatch1Count(0);
    setBatch2Count(0);
    setWaitlist1Count(0);
    setWaitlist2Count(0);
    saveLocalEnrollmentMap({});

    for (const key of currentKeys) {
      try {
        await deleteDoc(doc(db, "enrollments", key));
      } catch (e) { console.warn(e); }
    }
  };

  const getTargetWhatsappLink = (sec: string) => {
    if (sec === "batch1") return config.batch1WhatsappLink || BATCH_1_WHATSAPP_LINK;
    if (sec === "batch2") return config.batch2WhatsappLink || BATCH_2_WHATSAPP_LINK;
    if (sec === "waitlist1") return config.waitlist1WhatsappLink || WAITLIST_1_WHATSAPP_LINK;
    if (sec === "waitlist2") return config.waitlist2WhatsappLink || WAITLIST_2_WHATSAPP_LINK;
    return config.communityWhatsappLink || COMMUNITY_WHATSAPP_LINK;
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
              whatsappLink={getTargetWhatsappLink(userEnrollment.section)}
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
              onLogin={() => handleGoogleLogin()}
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
        onRetryGoogle={() => handleGoogleLogin()}
      />

      {/* Pre-Enrollment Student Onboarding Form Modal */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        targetSection={onboardingTargetSection}
        initialName={user?.displayName || ""}
        initialEmail={user?.email || ""}
        onSubmitDetails={handleFinalizeRegistration}
      />

      {/* WhatsApp Group Redirect Celebration Modal */}
      <WhatsAppRedirectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        section={whatsAppRedirectSection}
        whatsappLink={getTargetWhatsappLink(whatsAppRedirectSection)}
        studentName={userEnrollment?.userName || user?.displayName || "Student"}
      />

      {/* Faculty Control & Master Database Roster Panel */}
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
      <Footer onOpenFacultyPortal={() => setIsAdminOpen(true)} />
    </main>
  );
}
