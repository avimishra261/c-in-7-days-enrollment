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
  ListOrdered,
  MessageCircle,
  ExternalLink,
  Phone,
  BookOpen,
} from "lucide-react";

interface EnrolledDashboardProps {
  userEnrollment: UserEnrollment;
  allEnrollments: UserEnrollment[];
  announcements: Announcement[];
  onCancelEnrollment: () => Promise<void>;
  maxLimitPerBatch: number;
  whatsappLink?: string;
}

export const EnrolledDashboard: React.FC<EnrolledDashboardProps> = ({
  userEnrollment,
  allEnrollments,
  announcements,
  onCancelEnrollment,
  maxLimitPerBatch,
  whatsappLink = "https://chat.whatsapp.com/LcftSfX9baA9tqH4ftmajw",
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rosterTab, setRosterTab] = useState<"batch" | "waitlist">("batch");

  // Determine Waitlist Position & Section Lists
  const isWaitlist = userEnrollment.section.startsWith("waitlist");

  // Determine user's base batch identifier ("1" or "2")
  const baseBatch = userEnrollment.section.includes("1") ? "1" : "2";

  // Confirmed Enrolled Students (For current user's batch only)
  const confirmedStudents = allEnrollments
    .filter((e) => e.section === `batch${baseBatch}`)
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());

  // Waitlisted Students (For current user's batch only)
  const waitlistedStudents = allEnrollments
    .filter((e) => e.section === `waitlist${baseBatch}`)
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());

  // Current Section Filtered Students
  const mySectionStudents = allEnrollments
    .filter((e) => e.section === userEnrollment.section)
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());

  let myWaitlistPosition = -1;
  if (isWaitlist) {
    myWaitlistPosition = mySectionStudents.findIndex((e) => e.userId === userEnrollment.userId) + 1;
  }

  const sectionTitles: Record<string, string> = {
    batch1: "Batch 1 (Morning Slot)",
    batch2: "Batch 2 (Afternoon Slot)",
    waitlist1: "Waitlist 1 (Morning Batch)",
    waitlist2: "Waitlist 2 (Afternoon Batch)",
  };

  const goalLabels: Record<string, string> = {
    Yes: "Interested in GATE",
    No: "Not interested in GATE",
    placement: "Placements & Drives",
    gate: "GATE & Higher Studies",
    dual: "Placement + GATE",
    core_c: "Core C Mastery",
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
    <div className="animate-fade-in" style={{ marginTop: "1rem" }}>
      
      {/* ================= DIGITAL REGISTRATION TICKET CARD ================= */}
      <div
        className="glass-card"
        style={{
          borderLeft: isWaitlist ? "6px solid var(--amber)" : "6px solid var(--emerald)",
          background: isWaitlist ? "rgba(245, 158, 11, 0.08)" : "rgba(16, 185, 129, 0.08)",
          marginBottom: "1.75rem",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="btn-secondary"
            style={{ color: "#fda4af", borderColor: "rgba(244,63,94,0.3)", padding: "0.45rem 0.8rem", fontSize: "0.75rem" }}
          >
            <Trash2 size={14} style={{ marginRight: "0.3rem" }} /> Unenroll / Cancel Seat
          </button>
        </div>
        <div className="ticket-layout">
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
              <span className={`badge ${isWaitlist ? "badge-amber" : "badge-emerald"}`} style={{ fontSize: "0.85rem", padding: "0.3rem 0.85rem" }}>
                {isWaitlist ? `WAITLIST POSITION #${myWaitlistPosition}` : "OFFICIALLY ENROLLED"}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                Ref: {userEnrollment.userId.slice(-6).toUpperCase()}
              </span>
              {userEnrollment.collegeSection && (
                <span className="badge badge-primary" style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                  Section: {userEnrollment.collegeSection}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.3rem)", color: "#ffffff", marginBottom: "0.4rem", fontWeight: 700 }}>
              {sectionTitles[userEnrollment.section] || userEnrollment.section}
            </h2>

            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <UserCheck size={18} color="var(--accent)" /> <span className="hide-on-mobile">Student:</span> <strong style={{ color: "#ffffff" }}>{userEnrollment.userName}</strong>
            </p>

            {userEnrollment.phone && (
              <p className="hide-on-mobile" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Phone size={15} color="#25D366" /> WhatsApp: <strong style={{ color: "#ffffff" }}>{userEnrollment.phone}</strong>
              </p>
            )}

            {userEnrollment.careerGoal && (
              <p className="hide-on-mobile" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <BookOpen size={15} color="var(--accent)" /> Career Goal: <strong style={{ color: "var(--accent)" }}>{goalLabels[userEnrollment.careerGoal] || userEnrollment.careerGoal}</strong>
              </p>
            )}

            <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: "0.4rem" }}>
              Registered: {new Date(userEnrollment.enrolledAt).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="ticket-actions">
            
            {/* Join WhatsApp Group Button */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow: "0 4px 15px rgba(37, 211, 102, 0.4)",
                padding: "0.7rem 1rem",
                fontSize: "0.9rem",
                textDecoration: "none"
              }}
            >
              <MessageCircle size={18} /> Join WhatsApp Group <ExternalLink size={14} />
            </a>

            <div style={{
              width: "100%",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "0.85rem",
              padding: "0.65rem 1rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Batch Capacity</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent)" }}>
                {!isWaitlist 
                  ? `${mySectionStudents.length} / ${maxLimitPerBatch} Enrolled`
                  : `Position #${myWaitlistPosition} of ${mySectionStudents.length} Waiting`}
              </div>
            </div>
          </div>

        </div>

        {/* Waitlist Position Status Alert */}
        {isWaitlist && (
          <div style={{
            marginTop: "1.25rem",
            padding: "0.85rem 1rem",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px dashed rgba(245, 158, 11, 0.5)",
            borderRadius: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#fcd34d",
            fontSize: "0.9rem"
          }}>
            <AlertCircle size={22} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: "#ffffff" }}>Live Waitlist Position #{myWaitlistPosition}:</strong> You are next in line! When an enrolled student cancels their seat, your registration is automatically promoted to Batch 1/2.
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
          padding: "1.25rem"
        }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: "420px", width: "100%", border: "1px solid rgba(244,63,94,0.4)" }}>
            <h3 style={{ fontSize: "1.15rem", color: "#ffffff", marginBottom: "0.75rem" }}>
              Are you sure you want to unenroll?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Cancelling your registration will permanently relinquish your seat. If there is a waitlist, the next student in line will automatically be assigned this seat.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-secondary"
                disabled={cancelling}
                style={{ flex: 1 }}
              >
                Keep Seat
              </button>
              <button
                onClick={handleCancelClick}
                className="btn-primary"
                style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", flex: 1 }}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Unenroll Me"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TWO COLUMN LAYOUT: ANNOUNCEMENTS & TRANSPARENT ROSTER ================= */}
      <div className="grid-2" style={{ gap: "1.5rem" }}>
        
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
                    padding: "0.85rem 1rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.4rem" }}>
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

        {/* TRANSPARENT STUDENT ROSTER WITH TABS (ENROLLED vs WAITLIST) */}
        <div className="glass-card">
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.85rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Users size={20} color="var(--emerald)" />
              <h3 style={{ fontSize: "1.2rem", color: "#ffffff" }}>Transparent Student Roster</h3>
            </div>
          </div>

          {/* Roster Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(0,0,0,0.4)", padding: "0.25rem", borderRadius: "0.75rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setRosterTab("batch")}
              style={{
                flex: 1,
                padding: "0.5rem 0.25rem",
                borderRadius: "0.6rem",
                border: "none",
                background: rosterTab === "batch" ? "var(--primary)" : "transparent",
                color: rosterTab === "batch" ? "#ffffff" : "var(--text-muted)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Enrolled ({confirmedStudents.length})
            </button>
            <button
              onClick={() => setRosterTab("waitlist")}
              style={{
                flex: 1,
                padding: "0.5rem 0.25rem",
                borderRadius: "0.6rem",
                border: "none",
                background: rosterTab === "waitlist" ? "var(--amber)" : "transparent",
                color: rosterTab === "waitlist" ? "#ffffff" : "var(--text-muted)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Waitlist ({waitlistedStudents.length})
            </button>
          </div>

          {/* Touch-friendly Horizontal Scrolling Table Container */}
          <div className="table-scroll-wrapper">
            {rosterTab === "batch" ? (
              <table style={{ width: "100%", minWidth: "480px", borderCollapse: "collapse", fontSize: "0.825rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "0.6rem 0.8rem" }}>#</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>Student Name</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>College Sec</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>Section</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>Joined At</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-dim)" }}>
                        No enrolled students yet.
                      </td>
                    </tr>
                  ) : (
                    confirmedStudents.map((st, idx) => {
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
                          <td style={{ padding: "0.6rem 0.8rem", color: "var(--accent)" }}>
                            {st.collegeSection || "—"}
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", color: "var(--primary)", textTransform: "uppercase" }}>
                            {st.section}
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", color: "var(--text-dim)", fontSize: "0.75rem" }}>
                            {new Date(st.enrolledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: "100%", minWidth: "480px", borderCollapse: "collapse", fontSize: "0.825rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(245, 158, 11, 0.1)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#fcd34d" }}>
                    <th style={{ padding: "0.6rem 0.8rem" }}>Waitlist #</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>Student Name</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>College Sec</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>Target Batch</th>
                    <th style={{ padding: "0.6rem 0.8rem" }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-dim)" }}>
                        Waitlist is currently empty. All seats available!
                      </td>
                    </tr>
                  ) : (
                    waitlistedStudents.map((st, idx) => {
                      const isCurrentUser = st.userId === userEnrollment.userId;
                      return (
                        <tr
                          key={st.userId}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: isCurrentUser ? "rgba(245, 158, 11, 0.2)" : "transparent",
                            fontWeight: isCurrentUser ? 600 : 400
                          }}
                        >
                          <td style={{ padding: "0.6rem 0.8rem", color: isCurrentUser ? "#fcd34d" : "var(--text-dim)" }}>
                            Queue #{idx + 1}
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", color: isCurrentUser ? "#ffffff" : "var(--text-main)" }}>
                            {st.userName} {isCurrentUser && <span style={{ color: "#fcd34d", fontSize: "0.75rem" }}>(You)</span>}
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", color: "var(--accent)" }}>
                            {st.collegeSection || "—"}
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", color: "var(--amber)", textTransform: "uppercase" }}>
                            {st.section}
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", color: "var(--text-dim)", fontSize: "0.75rem" }}>
                            {new Date(st.enrolledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
