"use client";

import React, { useState } from "react";
import { X, LogIn, ShieldAlert, CheckCircle2, ArrowRight, UserCheck, Mail, User as UserIcon, Lock, UserPlus } from "lucide-react";
import { registerUserAccount, authenticateUserAccount, UserAccount } from "../lib/enrollmentStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onAccountAuthenticated: (account: UserAccount) => void;
  targetSection?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onAccountAuthenticated,
  targetSection,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const sectionNames: Record<string, string> = {
    batch1: "Batch 1 (Morning Slot)",
    batch2: "Batch 2 (Afternoon Slot)",
    waitlist1: "Waitlist 1",
    waitlist2: "Waitlist 2",
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    const res = authenticateUserAccount(email, password);
    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccess("Login successful!");
    setTimeout(() => {
      onAccountAuthenticated(res.account!);
      onClose();
    }, 400);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your Full Name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your College Email Address.");
      return;
    }
    if (!password) {
      setError("Please choose a password.");
      return;
    }

    const res = registerUserAccount(name, email, password);
    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccess("Account registered & authenticated successfully!");
    setTimeout(() => {
      onAccountAuthenticated(res.account!);
      onClose();
    }, 400);
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
            Student Portal Identity Verification
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Sign In or Create an Account using your official college email.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", padding: "0.3rem", borderRadius: "0.75rem", marginBottom: "1.25rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            type="button"
            onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "0.6rem",
              border: "none",
              background: activeTab === "login" ? "var(--primary)" : "transparent",
              color: activeTab === "login" ? "#ffffff" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Sign In (Existing User)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("signup"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "0.6rem",
              border: "none",
              background: activeTab === "signup" ? "var(--primary)" : "transparent",
              color: activeTab === "signup" ? "#ffffff" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Create New Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert-box alert-warning animate-fade-in" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="alert-box alert-success animate-fade-in" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        {/* Google OAuth Option */}
        <button
          type="button"
          onClick={() => {
            onGoogleLogin();
            onClose();
          }}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.875rem", marginBottom: "1rem" }}
        >
          Sign In with Google (@indoreinstitute.com)
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>
            Or Use Email & Password
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Form: SIGN IN */}
        {activeTab === "login" && (
          <form onSubmit={handleSignInSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                College Email Address (@indoreinstitute.com)
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

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <Lock size={16} color="var(--text-dim)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.875rem", color: "var(--accent)", borderColor: "rgba(56, 189, 248, 0.4)", marginTop: "0.25rem" }}
            >
              Sign In to Account <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Form: CREATE ACCOUNT */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignUpSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
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
                College Email Address (@indoreinstitute.com)
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

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                Create Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <Lock size={16} color="var(--text-dim)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.875rem", marginTop: "0.25rem" }}
            >
              Create Account & Verify <UserPlus size={16} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
