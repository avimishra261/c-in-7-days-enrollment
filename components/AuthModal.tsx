"use client";

import React from "react";
import { X, LogIn, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onDemoLogin: () => void;
  targetSection?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onDemoLogin,
  targetSection,
}) => {
  if (!isOpen) return null;

  const sectionNames: Record<string, string> = {
    batch1: "Batch 1 (Morning Slot)",
    batch2: "Batch 2 (Afternoon Slot)",
    waitlist1: "Waitlist 1",
    waitlist2: "Waitlist 2",
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(10px)",
      zIndex: 150,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "480px", border: "1px solid rgba(56, 189, 248, 0.4)", position: "relative" }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ position: "absolute", top: "1.25rem", right: "1.25rem", padding: "0.4rem", borderRadius: "50%" }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem", paddingTop: "0.5rem" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem auto"
          }}>
            <LogIn size={28} color="var(--accent)" />
          </div>

          <h2 style={{ fontSize: "1.4rem", color: "#ffffff", marginBottom: "0.4rem" }}>
            Student Verification Required
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            To reserve your seat in <strong style={{ color: "var(--accent)" }}>{targetSection ? sectionNames[targetSection] || targetSection : "C in 7 Days"}</strong>, please verify your college identity.
          </p>
        </div>

        {/* Security Rule Notice */}
        <div style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: "0.85rem", padding: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#a5b4fc", marginBottom: "0.3rem" }}>
            <ShieldAlert size={16} /> Official IIST Domain Restriction
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
            Only official student email addresses ending with <strong style={{ color: "#ffffff" }}>@indoreinstitute.com</strong> are allowed to register.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          
          <button
            onClick={() => {
              onGoogleLogin();
              onClose();
            }}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "0.95rem" }}
          >
            Sign In with Google (@indoreinstitute.com)
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.2rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Or For Testing</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          </div>

          <button
            onClick={() => {
              onDemoLogin();
              onClose();
            }}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.875rem", color: "var(--accent)" }}
          >
            Instant Test Login (student_123@indoreinstitute.com)
          </button>

        </div>

      </div>
    </div>
  );
};
