"use client";

import React from "react";
import { ShieldX, AlertTriangle, ArrowRight, RefreshCw, X } from "lucide-react";

interface AccessDeniedModalProps {
  isOpen: boolean;
  rejectedEmail: string;
  onClose: () => void;
  onRetryGoogle: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  rejectedEmail,
  onClose,
  onRetryGoogle,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(12px)",
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "500px", border: "1px solid rgba(244, 63, 94, 0.4)", position: "relative", textAlign: "center" }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ position: "absolute", top: "1.25rem", right: "1.25rem", padding: "0.4rem", borderRadius: "50%" }}
        >
          <X size={18} />
        </button>

        {/* Warning Icon */}
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(244, 63, 94, 0.15)",
          border: "1px solid rgba(244, 63, 94, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0.5rem auto 1.25rem auto",
          boxShadow: "0 0 25px rgba(244, 63, 94, 0.3)"
        }}>
          <ShieldX size={32} color="#f43f5e" />
        </div>

        <h2 style={{ fontSize: "1.4rem", color: "#ffffff", marginBottom: "0.5rem", fontWeight: 700 }}>
          IIST College Email Required
        </h2>

        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
          You tried signing in with <strong style={{ color: "#fda4af" }}>{rejectedEmail || "a personal account"}</strong>. 
          Registration is strictly locked to official college accounts ending with <strong style={{ color: "#ffffff" }}>@indoreinstitute.com</strong>.
        </p>

        {/* Notice Box */}
        <div style={{
          background: "rgba(244, 63, 94, 0.08)",
          border: "1px solid rgba(244, 63, 94, 0.25)",
          borderRadius: "0.85rem",
          padding: "0.9rem 1.1rem",
          marginBottom: "1.5rem",
          textAlign: "left",
          fontSize: "0.825rem",
          color: "var(--text-muted)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f43f5e", fontWeight: 600, marginBottom: "0.25rem" }}>
            <AlertTriangle size={16} /> Security Lock Active
          </div>
          Please select your official <strong>@indoreinstitute.com</strong> Google account in the popup prompt.
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => {
              onClose();
              onRetryGoogle();
            }}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.85rem",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
              boxShadow: "0 4px 20px rgba(244, 63, 94, 0.4)"
            }}
          >
            <RefreshCw size={18} /> Sign In with @indoreinstitute.com Google Account
          </button>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.875rem" }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
