"use client";

import React, { useState } from "react";
import { UserEnrollment, Announcement } from "../lib/enrollmentStore";
import {
  CheckCircle,
  Clock,
  UserCheck,
  Users,
  Megaphone,
  AlertCircle,
  LogOut,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Trash2,
} from "lucide-react";

interface EnrolledDashboardProps {
  userEnrollment: UserEnrollment;
  allEnrollments: UserEnrollment[];
  announcements: Announcement[];
  onCancelEnrollment: () => Promise<void>;
  maxLimitPerBatch: number;
}

export const EnrolledDashboard: React.FC<EnrolledDashboardProps> = ({
  userEnrollment,
  allEnrollments,
  announcements,
  onCancelEnrollment,
  maxLimitPerBatch,
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Filter students in the same batch/section
  const sectionStudents = allEnrollments
    .filter((e) => e.section === userEnrollment.section)
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());

  // Determine Waitlist Position if applicable
  const isWaitlist = userEnrollment.section.startsWith("waitlist");
  let waitlistPosition = -1;
  if (isWaitlist) {
    waitlistPosition = sectionStudents.findIndex((e) => e.userId === userEnrollment.userId) + 1;
  }

  const sectionTitles: Record<string, string> = {
    batch1: "Batch 1 (Morning Slot)",
    batch2: "Batch 2 (Afternoon Slot)",
    waitlist1: "Waitlist 1 (Morning Batch 1)",
    waitlist2: "Waitlist 2 (Afternoon Batch 2)",
  };

  const handleCancelClick = async () => {
    setCancelling(true);
    try {
      await onCancelEnrollment();
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: "2rem" }}>
      
      {/* ================= DIGITAL REGISTRATION TICKET CARD ================= */}
      <div
        className="glass-card"
        style={{
          borderLeft: isWaitlist ? "6px solid var(--amber)" : "6px solid var(--emerald)",
          background: isWaitlist ? "rgba(245, 158, 11, 0.06)" : "rgba(16, 185, 129, 0.06)",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem" }}>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <span className={`badge ${isWaitlist ? "badge-amber" : "badge-emerald"}`}>
                {isWaitlist ? `WAITLIST POSITION #${waitlistPosition}` : "OFFICIALLY ENROLLED"}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                Ref: {userEnrollment.userId.slice(-6).toUpperCase()}
              </span>
            </div>

            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#ffffff", marginBottom: "0.4rem" }}>
              {sectionTitles[userEnrollment.section] || userEnrollment.section}
            </h2>

            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UserCheck size={16} color="var(--accent)" /> Student: <strong style={{ color: "#ffffff" }}>{userEnrollment.userName}</strong> ({userEnrollment.userEmail})
            </p>

            <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginTop: "0.4rem" }}>
              Timestamp: {new Date(userEnrollment.enrolledAt).toLocaleString("en-IN")}
            </p>
          </div>

          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
            <div style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.85rem",
              padding: "0.75rem 1.25rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Batch Capacity</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent)" }}>
                {userEnrollment.section.startsWith("batch") 
                  ? `${sectionStudents.length} / ${maxLimitPerBatch} Enrolled`
                  : `${sectionStudents.length} Students in Waitlist`}
              </div>
            </div>

            <button
              onClick={() => setShowCancelConfirm(true)}
              className="btn-secondary"
              style={{ color: "#fda4af", borderColor: "rgba(244,63,94,0.3)", padding: "0.55rem 1rem", fontSize: "0.85rem" }}
            >
              <Trash2 size={15} /> Unenroll / Cancel Seat
            </button>
          </div>

        </div>

        {/* Waitlist Specific Status Banner */}
        {isWaitlist && (
          <div style={{
            marginTop: "1.5rem",
            padding: "1rem 1.25rem",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px dashed rgba(245, 158, 11, 0.4)",
            borderRadius: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            color: "#fcd34d",
            fontSize: "0.9rem"
          }}>
            <AlertCircle size={20} />
            <div>
              <strong>Automated Waitlist Position #{waitlistPosition}:</strong> You are next in line! As soon as any student drops out of Batch 1/2, your registration will automatically be upgraded to a confirmed seat.
            </div>
          </div>
        )}
      </div>


      {/* ================= CANCEL SEAT CONFIRMATION MODAL ================= */}
      {showCancelConfirm && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem"
        }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: "420px", border: "1px solid rgba(244,63,94,0.4)" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#ffffff", marginBottom: "0.75rem" }}>
              Are you sure you want to unenroll?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Cancelling your registration will permanently relinquish your seat. If there is a waitlist, the next student in line will automatically be assigned this seat.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-secondary"
                disabled={cancelling}
              >
                Keep My Seat
              </button>
              <button
                onClick={handleCancelClick}
                className="btn-primary"
                style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)" }}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Yes, Unenroll Me"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= TWO COLUMN LAYOUT: ANNOUNCEMENTS & ROSTER ================= */}
      <div className="grid-2" style={{ gap: "2rem" }}>
        
        {/* FACULTY ANNOUNCEMENTS */}
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.85rem", marginBottom: "1.25rem" }}>
            <Megaphone size={20} color="var(--accent)" />
            <h3 style={{ fontSize: "1.2rem", color: "#ffffff" }}>Faculty Announcements</h3>
          </div>

          {announcements.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", fontStyle: "italic" }}>
              No announcements posted yet by Prof. Ashish Singh.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {announcements.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.85rem",
                    padding: "1rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--accent)" }}>{item.title}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{item.date}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                    {item.content}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>
                    — {item.postedBy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* TRANSPARENT ENROLLED ROSTER */}
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.85rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Users size={20} color="var(--emerald)" />
              <h3 style={{ fontSize: "1.2rem", color: "#ffffff" }}>Transparent Student Roster</h3>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>
              {sectionStudents.length} Verified
            </span>
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: "1rem" }}>
            Chronological first-come first-serve order of students registered in your section:
          </p>

          <div style={{ maxHeight: "280px", overflowY: "auto", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.6rem 0.8rem" }}>#</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Student Name</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Email</th>
                  <th style={{ padding: "0.6rem 0.8rem" }}>Joined At</th>
                </tr>
              </thead>
              <tbody>
                {sectionStudents.map((st, idx) => {
                  const isCurrentUser = st.userId === userEnrollment.userId;
                  return (
                    <tr
                      key={st.userId}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isCurrentUser ? "rgba(16, 185, 129, 0.15)" : "transparent",
                        fontWeight: isCurrentUser ? 600 : 400
                      }}
                    >
                      <td style={{ padding: "0.6rem 0.8rem", color: isCurrentUser ? "#6ee7b7" : "var(--text-dim)" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", color: isCurrentUser ? "#ffffff" : "var(--text-main)" }}>
                        {st.userName} {isCurrentUser && <span style={{ color: "#34d399", fontSize: "0.75rem" }}>(You)</span>}
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", color: "var(--text-muted)" }}>
                        {st.userEmail}
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", color: "var(--text-dim)", fontSize: "0.75rem" }}>
                        {new Date(st.enrolledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
