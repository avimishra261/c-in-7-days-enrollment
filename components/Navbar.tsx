"use client";

import React from "react";
import { ShieldCheck, User as UserIcon, LogOut, Settings, Code2 } from "lucide-react";
import { User } from "firebase/auth";

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  userEnrollmentSection?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  onOpenAdmin,
  userEnrollmentSection,
}) => {
  return (
    <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(8, 12, 20, 0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div className="container" style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
          }}>
            <Code2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="gradient-text" style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                C in 7 Days
              </span>
              <span className="badge badge-emerald" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>
                IIST Exclusive
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              Mastery Bootcamp by Mr. Ashish Singh
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          
          {/* User Section Badge if Enrolled */}
          {userEnrollmentSection && (
            <span className="badge badge-primary">
              <ShieldCheck size={14} /> Enrolled: {userEnrollmentSection.toUpperCase()}
            </span>
          )}

          {/* Admin Settings Button */}
          <button 
            onClick={onOpenAdmin}
            className="btn-secondary"
            style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
            title="Admin Settings"
          >
            <Settings size={16} />
            <span style={{ display: "inline" }}>Admin</span>
          </button>

          {/* Auth User Info Badge */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(56, 189, 248, 0.12)",
                padding: "0.4rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid rgba(56, 189, 248, 0.3)"
              }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} style={{ width: "22px", height: "22px", borderRadius: "50%" }} />
                ) : (
                  <UserIcon size={16} color="var(--accent)" />
                )}
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", lineHeight: 1 }}>Logged In Account</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>
                    {user.email || user.displayName}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.8rem", color: "#fda4af", borderColor: "rgba(244,63,94,0.3)" }}
                title="Sign Out"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="btn-primary" style={{ padding: "0.55rem 1.1rem", fontSize: "0.875rem" }}>
              <UserIcon size={16} /> Student Login
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
