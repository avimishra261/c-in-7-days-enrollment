"use client";

import React from "react";
import { CheckCircle, ExternalLink, MessageCircle, Sparkles, X, ArrowRight } from "lucide-react";

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

  const isWaitlist = section.startsWith("waitlist");

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
        maxWidth: "480px",
        textAlign: "center",
        border: "1px solid rgba(37, 211, 102, 0.4)",
        boxShadow: "0 20px 50px rgba(37, 211, 102, 0.2)",
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

        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Your seat in <strong style={{ color: "#ffffff" }}>{section.toUpperCase()}</strong> has been successfully allocated!
        </p>

        {/* Action WhatsApp Button */}
        <div style={{ background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.3)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", color: "#6ee7b7", marginBottom: "0.5rem" }}>
            Final Step: Join Your Official WhatsApp Group
          </h3>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
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
            <MessageCircle size={20} /> Join WhatsApp Group Now <ExternalLink size={16} />
          </button>
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
