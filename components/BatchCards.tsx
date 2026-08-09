"use client";

import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { UserCheck, Clock, AlertTriangle, ShieldAlert, CheckCircle, ArrowRight, Lock, Users } from "lucide-react";
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

  // Batch 1 Stats
  const batch1Full = batch1Count >= maxLimitPerBatch;
  const batch1Percent = Math.min(100, Math.round((batch1Count / maxLimitPerBatch) * 100));

  // Batch 2 Stats
  const batch2Full = batch2Count >= maxLimitPerBatch;
  const batch2Percent = Math.min(100, Math.round((batch2Count / maxLimitPerBatch) * 100));

  const handleEnrollClick = async (section: "batch1" | "batch2" | "waitlist1" | "waitlist2") => {
    if (!user) {
      onLogin();
      return;
    }

    if (userEnrollment) {
      setFeedback({
        type: "error",
        message: `Security Lock: You are already enrolled in ${userEnrollment.section.toUpperCase()}. Each student can only select 1 section!`,
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

      {/* User Already Enrolled Security Status Banner */}
      {userEnrollment && (
        <div className="glass-card animate-fade-in" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.3)", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserCheck size={26} color="#6ee7b7" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-emerald">Verified Registration</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>ID: {userEnrollment.userEmail}</span>
                </div>
                <h3 style={{ fontSize: "1.25rem", color: "#ffffff", marginTop: "0.2rem" }}>
                  You are registered for <span style={{ color: "#34d399", textTransform: "uppercase" }}>{sectionTitles[userEnrollment.section] || userEnrollment.section}</span>
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Enrolled at: {new Date(userEnrollment.enrolledAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              onClick={onCancelEnrollment}
              className="btn-secondary"
              style={{ color: "#fda4af", borderColor: "rgba(244,63,94,0.3)", padding: "0.6rem 1rem", fontSize: "0.85rem" }}
            >
              Cancel My Seat
            </button>
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
              <span className={`badge ${batch1Full ? "badge-rose" : "badge-emerald"}`}>
                {batch1Full ? "Batch Full" : `${maxLimitPerBatch - batch1Count} Seats Left`}
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
                <Clock size={16} color="var(--accent)" /> Timing: To be announced by Prof. Ashish Singh
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={16} color="var(--primary)" /> Seat Allocation: First-Come First-Serve
              </li>
            </ul>
          </div>

          {/* Action Button for Batch 1 */}
          <div>
            {!batch1Full ? (
              <button
                onClick={() => handleEnrollClick("batch1")}
                disabled={!registrationOpen || !!userEnrollment || loadingSection === "batch1"}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {loadingSection === "batch1" ? "Processing Seat..." : userEnrollment ? "Already Registered Elsewhere" : "Enroll in Batch 1"}
              </button>
            ) : (
              <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px dashed rgba(245, 158, 11, 0.3)", borderRadius: "0.85rem", padding: "1rem", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#fcd34d", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  <AlertTriangle size={18} /> Batch 1 is Full ({batch1Count}/{maxLimitPerBatch})
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Waitlist 1 is now Active ({waitlist1Count} students waiting)
                </p>
                <button
                  onClick={() => handleEnrollClick("waitlist1")}
                  disabled={!registrationOpen || !!userEnrollment || loadingSection === "waitlist1"}
                  className="btn-secondary"
                  style={{ width: "100%", color: "#fcd34d", borderColor: "rgba(245, 158, 11, 0.4)" }}
                >
                  {loadingSection === "waitlist1" ? "Joining Waitlist..." : "Join Waitlist 1"}
                </button>
              </div>
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
              <span className={`badge ${batch2Full ? "badge-rose" : "badge-emerald"}`}>
                {batch2Full ? "Batch Full" : `${maxLimitPerBatch - batch2Count} Seats Left`}
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
                <Clock size={16} color="var(--accent)" /> Timing: To be announced by Prof. Ashish Singh
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={16} color="var(--primary)" /> Seat Allocation: First-Come First-Serve
              </li>
            </ul>
          </div>

          {/* Action Button for Batch 2 */}
          <div>
            {!batch2Full ? (
              <button
                onClick={() => handleEnrollClick("batch2")}
                disabled={!registrationOpen || !!userEnrollment || loadingSection === "batch2"}
                className="btn-primary"
                style={{ width: "100%", background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)" }}
              >
                {loadingSection === "batch2" ? "Processing Seat..." : userEnrollment ? "Already Registered Elsewhere" : "Enroll in Batch 2"}
              </button>
            ) : (
              <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px dashed rgba(245, 158, 11, 0.3)", borderRadius: "0.85rem", padding: "1rem", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#fcd34d", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  <AlertTriangle size={18} /> Batch 2 is Full ({batch2Count}/{maxLimitPerBatch})
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Waitlist 2 is now Active ({waitlist2Count} students waiting)
                </p>
                <button
                  onClick={() => handleEnrollClick("waitlist2")}
                  disabled={!registrationOpen || !!userEnrollment || loadingSection === "waitlist2"}
                  className="btn-secondary"
                  style={{ width: "100%", color: "#fcd34d", borderColor: "rgba(245, 158, 11, 0.4)" }}
                >
                  {loadingSection === "waitlist2" ? "Joining Waitlist..." : "Join Waitlist 2"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

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
