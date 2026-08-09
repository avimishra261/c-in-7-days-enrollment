"use client";

import React from "react";
import { Share2, Heart, ExternalLink, Code2 } from "lucide-react";

export const Footer: React.FC = () => {
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      "🚀 Join the free 'C in 7 Days' Masterclass by Mr. Ashish Singh at IIST! Limited seats (160/batch) on First-Come First-Serve basis. Register now: " +
        (typeof window !== "undefined" ? window.location.href : "")
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "4rem", background: "rgba(5, 8, 15, 0.9)", padding: "2.5rem 1.5rem 1.5rem 1.5rem" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <Code2 size={22} color="var(--accent)" />
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                Indore Institute of Science and Technology (IIST)
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              "C in 7 Days" Technical Workshop Series | Supervised by Mr. Ashish Singh
            </p>
          </div>

          <div>
            <button
              onClick={handleShareWhatsApp}
              className="btn-primary"
              style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)" }}
            >
              <Share2 size={16} /> Share on WhatsApp
            </button>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-dim)" }}>
          <div>
            © 2026 Indore Institute of Science and Technology. All rights reserved.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Designed & Built with <Heart size={12} color="var(--rose)" /> for IIST Students
          </div>
        </div>

      </div>
    </footer>
  );
};
