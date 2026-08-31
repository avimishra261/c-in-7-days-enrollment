"use client";

import React, { useState } from "react";
import { User } from "firebase/auth";
import { UserCheck, Clock, AlertTriangle, ShieldAlert, CheckCircle, ArrowRight, Lock, Users, LogIn } from "lucide-react";
import confetti from "canvas-confetti";

interface BatchCardsProps {
  user: User | null;
  onLogin: () => void;
  maxLimitPerBatch: number;
  batch1Count: number;
  batch2Count: number;
  waitlist1Count: number;
  waitlist2Count: number;
  userEnrollment: { section: string; enrolledAt: string; userName: string; userEmail: string } | null;
  onEnroll: (section: "batch1" | "batch2" | "waitlist1" | "waitlist2") => Promise<{ success: boolean; message: string }>;
  onCancelEnrollment: () => Promise<void>;
  registrationOpen: boolean;
}

export const BatchCards: React.FC<BatchCardsProps> = ({
  user,
  onLogin,
  maxLimitPerBatch,
  batch1Count,
  batch2Count,
  waitlist1Count,
  waitlist2Count,
  userEnrollment,
  onEnroll,
  onCancelEnrollment,
  registrationOpen,
}) => {
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const wlMax = maxLimitPerBatch === 10 ? 8 : 80;

  // Batch 1 Railway Logic
  const batch1Percent = Math.min(100, Math.round((batch1Count / maxLimitPerBatch) * 100));
  let b1Text = "";
  let b1Color = "";
  let b1TargetSection: "batch1" | "waitlist1" | "none" = "none";
  let b1Disabled = false;

  if (batch1Count < maxLimitPerBatch) {
    b1Text = `AVL - ${maxLimitPerBatch - batch1Count}`;
    b1Color = "#10b981"; // Emerald
    b1TargetSection = "batch1";
  } else if (waitlist1Count < wlMax) {
    b1Text = `WL - ${waitlist1Count + 1}`;
    b1Color = "#ef4444"; // Rose/Red
    b1TargetSection = "waitlist1";
  } else {
    b1Text = "REGRET";
    b1Color = "#6b7280"; // Gray
    b1TargetSection = "none";
    b1Disabled = true;
  }

  // Batch 2 Railway Logic
  const batch2Percent = Math.min(100, Math.round((batch2Count / maxLimitPerBatch) * 100));
  let b2Text = "";
  let b2Color = "";
  let b2TargetSection: "batch2" | "waitlist2" | "none" = "none";
  let b2Disabled = false;

  if (batch2Count < maxLimitPerBatch) {
    b2Text = `AVL - ${maxLimitPerBatch - batch2Count}`;
    b2Color = "#10b981"; // Emerald
    b2TargetSection = "batch2";
  } else if (waitlist2Count < wlMax) {
    b2Text = `WL - ${waitlist2Count + 1}`;
    b2Color = "#ef4444"; // Rose/Red
    b2TargetSection = "waitlist2";
  } else {
    b2Text = "REGRET";
    b2Color = "#6b7280"; // Gray
    b2TargetSection = "none";
    b2Disabled = true;
  }

  const handleEnrollClick = async (section: "batch1" | "batch2" | "waitlist1" | "waitlist2") => {
    if (!registrationOpen) {
      setFeedback({
        type: "error",
        message: "Registration Portal is currently paused by Administration.",
      });
      return;
    }

    if (userEnrollment) {
      setFeedback({
        type: "error",
        message: `Security Lock: You are already registered in ${userEnrollment.section.toUpperCase()}. Each student can only select 1 section!`,
      });
      return;
    }

    setLoadingSection(section);
    setFeedback(null);

    try {
      const res = await onEnroll(section);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) { console.error(e); }
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Enrollment failed. Please try again." });
    } finally {
      setLoadingSection(null);
    }
  };

  const sectionTitles: Record<string, string> = {
    batch1: "Batch 1 (Morning Slot)",
    batch2: "Batch 2 (Afternoon Slot)",
    waitlist1: "Waitlist 1 (Batch 1)",
    waitlist2: "Waitlist 2 (Batch 2)",
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      
      {/* Feedback Banner */}
      {feedback && (
        <div 
          className={`alert-box alert-${feedback.type === "success" ? "success" : feedback.type === "error" ? "warning" : "info"} animate-fade-in`}
          style={{ marginBottom: "2rem" }}
        >
          {feedback.type === "error" ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Active Logged In Account Banner */}
      {user && !userEnrollment && (
        <div className="glass-card animate-fade-in" style={{ background: "rgba(56, 189, 248, 0.08)", borderColor: "rgba(56, 189, 248, 0.3)", marginBottom: "2rem", padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserCheck size={20} color="var(--accent)" />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Active Student Session</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                  {user.email || user.displayName}
                </div>
              </div>
            </div>
            <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>
              Verified @indoreinstitute.com
            </span>
          </div>
        </div>
      )}

      {/* Batches Grid */}
      <div className="grid-2">
        
        {/* ================= BATCH 1 CARD ================= */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: "4px solid var(--primary)" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>Batch 01</span>
                <h2 style={{ fontSize: "1.5rem", color: "#ffffff" }}>Morning Slot</h2>
              </div>
              <span className="badge" style={{ backgroundColor: b1TargetSection === "batch1" ? "rgba(16, 185, 129, 0.15)" : b1TargetSection === "waitlist1" ? "rgba(239, 68, 68, 0.15)" : "rgba(107, 114, 128, 0.15)", color: b1Color, borderColor: b1TargetSection === "batch1" ? "rgba(16, 185, 129, 0.3)" : b1TargetSection === "waitlist1" ? "rgba(239, 68, 68, 0.3)" : "rgba(107, 114, 128, 0.3)" }}>
                Status: {b1Text}
              </span>
            </div>

            {/* Seat Progress Bar */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                <span>Occupied Seats</span>
                <span style={{ fontWeight: 600, color: "#ffffff" }}>{batch1Count} / {maxLimitPerBatch}</span>
              </div>
              <div className="progress-container">
                <div 
                  className={`progress-bar ${batch1Percent > 80 ? "progress-rose" : "progress-emerald"}`}
                  style={{ width: `${batch1Percent}%` }}
                />
              </div>
            </div>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={16} color="var(--accent)" /> Timing: 8:00 AM to 1:00 PM
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={16} color="var(--primary)" /> Seat Allocation: First-Come First-Serve
              </li>
            </ul>
          </div>

          {/* Action Button for Batch 1 */}
          <div>
            <button
              onClick={() => {
                if (b1TargetSection !== "none" && !b1Disabled) handleEnrollClick(b1TargetSection);
              }}
              disabled={b1Disabled || loadingSection === b1TargetSection || !!userEnrollment}
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "1rem",
                backgroundColor: b1Color,
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 700,
                cursor: (b1Disabled || !!userEnrollment) ? "not-allowed" : "pointer",
                opacity: (b1Disabled || !!userEnrollment) ? 0.6 : 1,
                transition: "all 0.2s ease"
              }}
            >
              {loadingSection === b1TargetSection
                ? "Processing..."
                : userEnrollment
                ? "Already Registered"
                : `Book Seat ( ${b1Text} )`}
            </button>
            {b1TargetSection === "waitlist1" && !userEnrollment && (
              <p style={{ fontSize: "0.75rem", color: "#ef4444", textAlign: "center", marginTop: "0.5rem" }}>
                *You will be added to the Waiting List.
              </p>
            )}
            {b1TargetSection === "none" && (
               <p style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "center", marginTop: "0.5rem" }}>
                *No seats available in Main or Waitlist.
              </p>
            )}
          </div>
        </div>


        {/* ================= BATCH 2 CARD ================= */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: "4px solid var(--accent)" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "0.5rem", background: "rgba(56,189,248,0.15)", color: "#7dd3fc", borderColor: "rgba(56,189,248,0.3)" }}>
                  Batch 02
                </span>
                <h2 style={{ fontSize: "1.5rem", color: "#ffffff" }}>Afternoon Slot</h2>
              </div>
              <span className="badge" style={{ backgroundColor: b2TargetSection === "batch2" ? "rgba(16, 185, 129, 0.15)" : b2TargetSection === "waitlist2" ? "rgba(239, 68, 68, 0.15)" : "rgba(107, 114, 128, 0.15)", color: b2Color, borderColor: b2TargetSection === "batch2" ? "rgba(16, 185, 129, 0.3)" : b2TargetSection === "waitlist2" ? "rgba(239, 68, 68, 0.3)" : "rgba(107, 114, 128, 0.3)" }}>
                Status: {b2Text}
              </span>
            </div>

            {/* Seat Progress Bar */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                <span>Occupied Seats</span>
                <span style={{ fontWeight: 600, color: "#ffffff" }}>{batch2Count} / {maxLimitPerBatch}</span>
              </div>
              <div className="progress-container">
                <div 
                  className={`progress-bar ${batch2Percent > 80 ? "progress-rose" : "progress-emerald"}`}
                  style={{ width: `${batch2Percent}%` }}
                />
              </div>
            </div>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={16} color="var(--accent)" /> Timing: 1:30 PM to 6:30 PM
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={16} color="var(--primary)" /> Seat Allocation: First-Come First-Serve
              </li>
            </ul>
          </div>

          {/* Action Button for Batch 2 */}
          <div>
            <button
              onClick={() => {
                if (b2TargetSection !== "none" && !b2Disabled) handleEnrollClick(b2TargetSection);
              }}
              disabled={b2Disabled || loadingSection === b2TargetSection || !!userEnrollment}
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "1rem",
                backgroundColor: b2Color,
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 700,
                cursor: (b2Disabled || !!userEnrollment) ? "not-allowed" : "pointer",
                opacity: (b2Disabled || !!userEnrollment) ? 0.6 : 1,
                transition: "all 0.2s ease"
              }}
            >
              {loadingSection === b2TargetSection
                ? "Processing..."
                : userEnrollment
                ? "Already Registered"
                : `Book Seat ( ${b2Text} )`}
            </button>
            {b2TargetSection === "waitlist2" && !userEnrollment && (
              <p style={{ fontSize: "0.75rem", color: "#ef4444", textAlign: "center", marginTop: "0.5rem" }}>
                *You will be added to the Waiting List.
              </p>
            )}
            {b2TargetSection === "none" && (
               <p style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "center", marginTop: "0.5rem" }}>
                *No seats available in Main or Waitlist.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Already Enrolled? Log In Link Banner */}
      {!user && (
        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <button
            onClick={onLogin}
            className="btn-secondary"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontSize: "0.875rem",
              color: "var(--accent)"
            }}
          >
            <LogIn size={16} /> Already registered? Log in here to view your ticket & roster
          </button>
        </div>
      )}

      {/* System Transparency Banner */}
      <div className="glass-card" style={{ marginTop: "2rem", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", background: "rgba(255, 255, 255, 0.02)" }}>
        <ShieldAlert size={24} color="var(--accent)" />
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <strong style={{ color: "#ffffff" }}>Transparency & Security Protocol:</strong> Real-time database locking guarantees that seats are assigned on strict chronological order. Each student account is restricted to 1 section across Batch 1, Batch 2, Waitlist 1, and Waitlist 2.
        </div>
      </div>

    </div>
  );
};
