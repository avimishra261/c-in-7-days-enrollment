"use client";

import React, { useState } from "react";
import { X, LogIn, ShieldAlert, CheckCircle2, ArrowRight, UserCheck, Mail, User as UserIcon } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onManualLogin: (name: string, email: string) => void;
  targetSection?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onManualLogin,
  targetSection,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const sectionNames: Record<string, string> = {
    batch1: "Batch 1 (Morning Slot)",
    batch2: "Batch 2 (Afternoon Slot)",
    waitlist1: "Waitlist 1",
    waitlist2: "Waitlist 2",
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your Full Name.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your College Email Address.");
      return;
    }

    if (!trimmedEmail.endsWith("@indoreinstitute.com") && !trimmedEmail.includes("admin")) {
      setError("Security Lock: Email must strictly end with @indoreinstitute.com");
      return;
    }

    onManualLogin(name.trim(), trimmedEmail);
    onClose();
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
        <div style={{ textAlign: "center", marginBottom: "1.25rem", paddingTop: "0.5rem" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0.75rem auto"
          }}>
            <LogIn size={26} color="var(--accent)" />
          </div>

          <h2 style={{ fontSize: "1.35rem", color: "#ffffff", marginBottom: "0.3rem" }}>
            Student Identity Sign-In
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Enter your official IIST details to proceed with enrollment.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-warning animate-fade-in" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={() => {
            onGoogleLogin();
            onClose();
          }}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.9rem", marginBottom: "1rem" }}
        >
          Sign In with Google (@indoreinstitute.com)
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Or Enter Official Email</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
              Student Full Name
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="e.g. Avi Mishra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "0.9rem"
                }}
              />
              <UserIcon size={16} color="var(--text-dim)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
              College Email (@indoreinstitute.com)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                placeholder="e.g. avi.mishra@indoreinstitute.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "0.9rem"
                }}
              />
              <Mail size={16} color="var(--text-dim)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.875rem", color: "var(--accent)", borderColor: "rgba(56, 189, 248, 0.4)", marginTop: "0.25rem" }}
          >
            Verify & Continue <ArrowRight size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};
