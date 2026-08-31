"use client";

import React from "react";
import { Sparkles, Calendar, Clock, Award, CheckCircle2, Zap } from "lucide-react";

interface HeroProps {
  startDate: string;
  endDate: string;
  registrationOpen?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ startDate, endDate }) => {
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem 2rem 1rem", position: "relative" }}>
      
      {/* Event Badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", borderRadius: "999px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", marginBottom: "1.5rem" }}>
        <Sparkles size={16} color="#38bdf8" />
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#38bdf8" }}>
          Free 12-Day C & DSA Bootcamp (7 Days C + 5 Days DSA) • Restricted to @indoreinstitute.com
        </span>
      </div>

      {/* Main Headline */}
      <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem" }}>
        Level Up Your Coding Logic with <br />
        <span className="gradient-text">"C & DSA in 12 Days"</span>
      </h1>

      {/* Subtitle */}
      <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "var(--text-muted)", maxWidth: "750px", margin: "0 auto 2rem auto" }}>
        Join <strong style={{ color: "#ffffff" }}>Mr. Ashish Singh</strong> at IIST for an exclusive 12-day deep dive (7 Days C + 5 Days Data Structures) into the core engine of computer science. Master pointers, memory architecture, and complex problem-solving.
      </p>

      {/* Event Meta Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <div className="glass-card" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", borderRadius: "0.85rem" }}>
          <Calendar size={18} color="var(--accent)" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Registration Window</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", borderRadius: "0.85rem" }}>
          <Clock size={18} color="var(--emerald)" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Format</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>2 Flexible Time Batches</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", borderRadius: "0.85rem" }}>
          <Zap size={18} color="var(--amber)" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Selection</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>Strict First-Come First-Serve</div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid-3" style={{ maxWidth: "900px", margin: "0 auto", textAlign: "left" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", padding: "1.2rem" }}>
          <CheckCircle2 size={20} color="var(--emerald)" style={{ marginBottom: "0.5rem" }} />
          <h4 style={{ fontSize: "1rem", color: "#ffffff", marginBottom: "0.3rem" }}>Deep Memory & Pointer Mastery</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Demystify memory allocation, multi-dimensional pointers, and recursion architecture.</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", padding: "1.2rem" }}>
          <Award size={20} color="var(--accent)" style={{ marginBottom: "0.5rem" }} />
          <h4 style={{ fontSize: "1rem", color: "#ffffff", marginBottom: "0.3rem" }}>High-Value Skill Building</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Develop core programming muscle memory essential for competitive coding and technical interviews.</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", padding: "1.2rem" }}>
          <Sparkles size={20} color="var(--amber)" style={{ marginBottom: "0.5rem" }} />
          <h4 style={{ fontSize: "1rem", color: "#ffffff", marginBottom: "0.3rem" }}>100% Free & Transparent</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Fully transparent automated seat allocation and live waitlist tracking.</p>
        </div>
      </div>

    </div>
  );
};
