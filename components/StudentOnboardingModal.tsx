"use client";

import React, { useState } from "react";
import { UserEnrollment } from "../lib/enrollmentStore";
import { UserCheck, Phone, BookOpen, Target, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSection: "batch1" | "batch2" | "waitlist1" | "waitlist2";
  initialName: string;
  initialEmail: string;
  onSubmitDetails: (details: {
    userName: string;
    phone: string;
    collegeSection: string;
    careerGoal: string;
  }) => Promise<void>;
}

const DEFAULT_SECTIONS = [
  "CS1", "CS2", "CS3", "CS4", "CS5",
  "AIML1", "AIML2", "AIML3",
  "DS", "ECS", "Other"
];

const CAREER_GOALS = [
  { id: "placement", title: "Product / Service Placements & Campus Drives", icon: "💼" },
  { id: "gate", title: "GATE Exam & Higher Technical Studies (IITs/PSUs)", icon: "🎓" },
  { id: "dual", title: "Placement + GATE (Dual Track Preparation)", icon: "⚡" },
  { id: "core_c", title: "Core C Programming & System Level Mastery", icon: "💻" },
];

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  onClose,
  targetSection,
  initialName,
  initialEmail,
  onSubmitDetails,
}) => {
  const [userName, setUserName] = useState(initialName || "");
  const [phone, setPhone] = useState("");
  const [selectedSection, setSelectedSection] = useState("CS1");
  const [customSection, setCustomSection] = useState("");
  const [careerGoal, setCareerGoal] = useState("placement");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const sectionLabel = targetSection === "batch1" 
    ? "Batch 1 (Morning Slot)" 
    : targetSection === "batch2" 
      ? "Batch 2 (Afternoon Slot)" 
      : targetSection === "waitlist1" 
        ? "Waitlist 1" 
        : "Waitlist 2";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit WhatsApp mobile number.");
      return;
    }

    const finalSection = selectedSection === "Other" ? (customSection.trim() || "Other") : selectedSection;

    setSubmitting(true);
    setError("");

    try {
      await onSubmitDetails({
        userName: userName.trim(),
        phone: cleanPhone,
        collegeSection: finalSection,
        careerGoal,
      });
    } catch (err: any) {
      setError(err.message || "Failed to finalize registration.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      zIndex: 150,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: "100%",
        maxWidth: "560px",
        maxHeight: "92vh",
        overflowY: "auto",
        border: "1px solid rgba(56, 189, 248, 0.4)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
      }}>
        
        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <span className="badge badge-emerald" style={{ fontSize: "0.75rem" }}>Step 2 of 2: Registration Details</span>
            <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>{sectionLabel}</span>
          </div>
          <h2 style={{ fontSize: "1.4rem", color: "#ffffff" }}>Complete Student Profile</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Enter your academic & contact details to confirm your seat in <strong>{sectionLabel}</strong>.
          </p>
        </div>

        {error && (
          <div className="alert-box alert-warning" style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Email Info (Read Only) */}
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.65rem 0.85rem", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Authenticated Email</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>{initialEmail}</span>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
              Student Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "0.75rem",
                color: "#ffffff",
                fontSize: "0.95rem"
              }}
            />
          </div>

          {/* WhatsApp Mobile Number */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
              WhatsApp Mobile Number * (For Official Batch Group Invites)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="tel"
                placeholder="10-digit mobile number (e.g. 9876543210)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.8rem",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "0.95rem"
                }}
              />
              <Phone size={18} color="var(--accent)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          {/* IIST College Branch & Section Selection */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
              Select College Branch & Section *
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: selectedSection === "Other" ? "0.6rem" : "0" }}>
              {DEFAULT_SECTIONS.map((sec) => {
                const isSelected = selectedSection === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "999px",
                      border: isSelected ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.12)",
                      background: isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.04)",
                      color: isSelected ? "#ffffff" : "var(--text-muted)",
                      fontSize: "0.8rem",
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {sec}
                  </button>
                );
              })}
            </div>

            {selectedSection === "Other" && (
              <input
                type="text"
                placeholder="Specify your Section / Branch (e.g. Civil 2)"
                value={customSection}
                onChange={(e) => setCustomSection(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "0.6rem",
                  color: "#ffffff",
                  fontSize: "0.85rem"
                }}
              />
            )}
          </div>

          {/* Primary Learning Goal / Career Interest */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
              Primary Career Focus / Technical Goal *
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {CAREER_GOALS.map((goal) => {
                const isSelected = careerGoal === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setCareerGoal(goal.id)}
                    style={{
                      padding: "0.7rem 0.9rem",
                      borderRadius: "0.75rem",
                      border: isSelected ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.08)",
                      background: isSelected ? "rgba(99, 102, 241, 0.18)" : "rgba(0,0,0,0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{goal.icon}</span>
                    <span style={{ fontSize: "0.85rem", color: isSelected ? "#ffffff" : "var(--text-muted)", fontWeight: isSelected ? 600 : 400, flex: 1 }}>
                      {goal.title}
                    </span>
                    {isSelected && <Check size={16} color="var(--accent)" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", marginTop: "0.5rem" }}
          >
            {submitting ? "Confirming Seat..." : "Confirm Registration & Join WhatsApp Group"} <ArrowRight size={18} />
          </button>

        </form>

      </div>
    </div>
  );
};
