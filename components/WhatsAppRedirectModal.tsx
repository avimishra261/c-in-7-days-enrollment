"use client";

import React from "react";
import { CheckCircle, ExternalLink, MessageCircle, Sparkles, X, ShieldAlert } from "lucide-react";

interface WhatsAppRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  whatsappLink: string;
  studentName: string;
}

export const WhatsAppRedirectModal: React.FC<WhatsAppRedirectModalProps> = ({
  isOpen,
  onClose,
  section,
  whatsappLink,
  studentName,
}) => {
  if (!isOpen) return null;

  const sectionTitles: Record<string, string> = {
    batch1: "Batch 1 (Morning Slot) WhatsApp Group",
    batch2: "Batch 2 (Afternoon Slot) WhatsApp Group",
    waitlist1: "Batch 1 Waiting List WhatsApp Group",
    waitlist2: "Batch 2 Waiting List WhatsApp Group",
  };

  const handleJoinClick = () => {
    window.open(whatsappLink, "_blank");
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.25rem"
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: "100%",
        maxWidth: "500px",
        textAlign: "center",
        border: "1px solid rgba(37, 211, 102, 0.5)",
        boxShadow: "0 20px 50px rgba(37, 211, 102, 0.25)",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.35rem", borderRadius: "50%" }}
        >
          <X size={16} />
        </button>

        {/* Celebration Icon */}
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem auto",
          boxShadow: "0 8px 25px rgba(37, 211, 102, 0.4)"
        }}>
          <MessageCircle size={32} color="#ffffff" />
        </div>

        <h2 style={{ fontSize: "1.5rem", color: "#ffffff", marginBottom: "0.4rem" }}>
          🎉 Congratulations, {studentName.split(" ")[0]}!
        </h2>

        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          Your seat registration for <strong style={{ color: "#ffffff" }}>{section.toUpperCase()}</strong> is confirmed!
        </p>

        {/* Action WhatsApp Button Container */}
        <div style={{ background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.3)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1.05rem", color: "#6ee7b7", marginBottom: "0.4rem" }}>
            Join Your Assigned Batch Group
          </h3>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.75rem" }}>
            {sectionTitles[section] || section}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Classroom lab numbers, timing announcements, and daily problem sets by Prof. Ashish Singh will be shared in this group.
          </p>

          <button
            onClick={handleJoinClick}
            className="btn-primary"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
              fontSize: "1rem",
              padding: "0.85rem"
            }}
          >
            <MessageCircle size={20} /> Join {section.toUpperCase()} Group Now <ExternalLink size={16} />
          </button>
        </div>

        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginBottom: "1.25rem" }}>
          <ShieldAlert size={14} color="var(--accent)" />
          Strict Security: You are authorized to join your assigned batch group only.
        </div>

        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ fontSize: "0.85rem", padding: "0.55rem 1.25rem" }}
        >
          View My Registered Ticket & Roster
        </button>

      </div>
    </div>
  );
};
