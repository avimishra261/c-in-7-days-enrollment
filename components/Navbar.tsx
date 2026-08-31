"use client";

import React from "react";
import { ShieldCheck, User as UserIcon, LogOut, Code2 } from "lucide-react";
import { User } from "firebase/auth";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  userEnrollmentSection?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  userEnrollmentSection,
}) => {
  return (
    <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(8, 12, 20, 0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div className="container" style={{ padding: "0.85rem 1.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        
        {/* Logo & Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
          }}>
            <Code2 size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="gradient-text" style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                C in 7 Days
              </span>
              <span className="badge badge-emerald" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>
                IIST Exclusive
              </span>
            </div>
            <p className="hide-on-mobile" style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
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

          {/* Auth User Info Badge & Sign Out Button */}
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div className="nav-user-badge" style={{
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
                <div className="hide-on-mobile" style={{ display: "flex", flexDirection: "column", textAlign: "left", overflow: "hidden" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-dim)", textTransform: "uppercase", lineHeight: 1 }}>Logged In Account</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", display: "inline-block", maxWidth: "130px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.email || user.displayName}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.8rem", color: "#fda4af", borderColor: "rgba(244,63,94,0.3)", width: "auto" }}
                title="Sign Out"
              >
                <LogOut size={14} /> <span className="hide-on-mobile">Sign Out</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
