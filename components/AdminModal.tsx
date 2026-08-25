"use client";

import React, { useState } from "react";
import { AppConfig, UserEnrollment } from "../lib/enrollmentStore";
import { X, Lock, Save, Key, Calendar, Users, Check, RefreshCw, MessageCircle } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  enrollmentsList: UserEnrollment[];
  onClearAllEnrollments: () => void;
  onAddAnnouncement: (title: string, content: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  enrollmentsList,
  onClearAllEnrollments,
  onAddAnnouncement,
}) => {
  const [passcode, setPasscode] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [startDate, setStartDate] = useState(config.startDate);
  const [endDate, setEndDate] = useState(config.endDate);
  const [maxLimitPerBatch, setMaxLimitPerBatch] = useState(config.maxLimitPerBatch);
  const [registrationOpen, setRegistrationOpen] = useState(config.registrationOpen);

  const [communityWhatsappLink, setCommunityWhatsappLink] = useState(config.communityWhatsappLink || "https://chat.whatsapp.com/LcftSfX9baA9tqH4ftmajw");
  const [batch1WhatsappLink, setBatch1WhatsappLink] = useState(config.batch1WhatsappLink || "https://chat.whatsapp.com/LcftSfX9baA9tqH4ftmajw");
  const [batch2WhatsappLink, setBatch2WhatsappLink] = useState(config.batch2WhatsappLink || "https://chat.whatsapp.com/LcftSfX9baA9tqH4ftmajw");

  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");

  if (!isOpen) return null;

  const handleAddAnnouncement = () => {
    if (!newAnnTitle || !newAnnContent) return;
    onAddAnnouncement(newAnnTitle, newAnnContent);
    setNewAnnTitle("");
    setNewAnnContent("");
    setSuccessMessage("Announcement posted successfully to all student portals!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "EngeniusAshish" || passcode === "engeniusashish") {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Access Denied: Invalid Faculty Passcode.");
    }
  };

  const handleSave = () => {
    const updated: AppConfig = {
      ...config,
      startDate,
      endDate,
      maxLimitPerBatch: Number(maxLimitPerBatch),
      registrationOpen,
      communityWhatsappLink,
      batch1WhatsappLink,
      batch2WhatsappLink,
      announcements: config.announcements || [],
    };
    onSaveConfig(updated);
    setSuccessMessage("Admin Settings & WhatsApp Links Updated Successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const goalLabels: Record<string, string> = {
    placement: "Placements",
    gate: "GATE / Higher Studies",
    dual: "Placement + GATE",
    core_c: "Core C Mastery",
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 250,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.25rem"
    }}>
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "750px", maxHeight: "90vh", overflowY: "auto", position: "relative", border: "1px solid rgba(99, 102, 241, 0.4)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Lock size={20} color="var(--primary)" />
            <h2 style={{ fontSize: "1.25rem", color: "#ffffff" }}>Faculty & Admin Master Control</h2>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: "0.4rem", borderRadius: "50%" }}>
            <X size={18} />
          </button>
        </div>

        {!authenticated ? (
          /* Authentication Screen */
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem", padding: "1rem 0" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Enter the faculty passcode to view student contact numbers, section data, and update WhatsApp links.
            </p>

            {error && (
              <div className="alert-box alert-warning" style={{ fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                Faculty Passcode
              </label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  type="password"
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    fontSize: "0.95rem"
                  }}
                  autoFocus
                />
                <button type="submit" className="btn-primary">
                  Unlock
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Admin Dashboard Controls */
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {successMessage && (
              <div className="alert-box alert-success animate-fade-in">
                <Check size={18} /> {successMessage}
              </div>
            )}

            {/* Config Form */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Registration Start Date
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Registration End Date
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Max Capacity Per Batch (Testing: 4 | Production: 160)
              </label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxLimitPerBatch}
                  onChange={(e) => setMaxLimitPerBatch(Number(e.target.value))}
                  style={{
                    width: "140px",
                    padding: "0.65rem 1rem",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "0.6rem",
                    color: "#ffffff",
                    fontSize: "1rem",
                    fontWeight: 600
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMaxLimitPerBatch(4)}
                  className="btn-secondary"
                  style={{ padding: "0.5rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Set Test (4)
                </button>
                <button
                  type="button"
                  onClick={() => setMaxLimitPerBatch(160)}
                  className="btn-secondary"
                  style={{ padding: "0.5rem 0.8rem", fontSize: "0.8rem", color: "var(--accent)" }}
                >
                  Set Production (160)
                </button>
              </div>
            </div>

            {/* WhatsApp Group Links Controls */}
            <div style={{ background: "rgba(37, 211, 102, 0.08)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(37, 211, 102, 0.2)" }}>
              <h4 style={{ fontSize: "0.9rem", color: "#6ee7b7", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MessageCircle size={16} /> Official WhatsApp Group Links
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "0.2rem" }}>WhatsApp Community / Main Link</label>
                  <input
                    type="text"
                    value={communityWhatsappLink}
                    onChange={(e) => setCommunityWhatsappLink(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", color: "#ffffff", fontSize: "0.85rem" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "0.2rem" }}>Batch 1 WhatsApp Link</label>
                    <input
                      type="text"
                      value={batch1WhatsappLink}
                      onChange={(e) => setBatch1WhatsappLink(e.target.value)}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", color: "#ffffff", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "0.2rem" }}>Batch 2 WhatsApp Link</label>
                    <input
                      type="text"
                      value={batch2WhatsappLink}
                      onChange={(e) => setBatch2WhatsappLink(e.target.value)}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", color: "#ffffff", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.03)", padding: "0.8rem 1rem", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.08)" }}>
              <input
                type="checkbox"
                id="regOpen"
                checked={registrationOpen}
                onChange={(e) => setRegistrationOpen(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
              />
              <label htmlFor="regOpen" style={{ fontSize: "0.9rem", color: "#ffffff", cursor: "pointer" }}>
                Registration Gateway Active (Allow new student submissions)
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={handleSave} className="btn-primary" style={{ padding: "0.65rem 1.5rem" }}>
                <Save size={16} /> Save Configuration & Links
              </button>
            </div>

            {/* Post Faculty Announcement Section */}
            <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.25rem" }}>
              <h3 style={{ fontSize: "1rem", color: "#ffffff", marginBottom: "0.75rem" }}>
                📢 Post Announcement (Mr. Ashish Singh)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="Announcement Title (e.g. Day 1 Venue Update)"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  style={{
                    padding: "0.6rem 0.85rem",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
                <textarea
                  placeholder="Announcement Content / Details..."
                  rows={3}
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  style={{
                    padding: "0.6rem 0.85rem",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    resize: "vertical"
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="btn-secondary"
                  style={{ color: "var(--accent)", borderColor: "rgba(56,189,248,0.4)", alignSelf: "flex-start", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Post Announcement
                </button>
              </div>
            </div>

            {/* Live Registrations Database Table */}
            <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ fontSize: "1rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Users size={18} color="var(--accent)" /> Student Database ({enrollmentsList.length} total)
                </h3>
                {enrollmentsList.length > 0 && (
                  <button
                    onClick={onClearAllEnrollments}
                    className="btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", color: "#fda4af", borderColor: "rgba(244,63,94,0.3)" }}
                  >
                    Reset All Test Data
                  </button>
                )}
              </div>

              {enrollmentsList.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", fontStyle: "italic" }}>
                  No students enrolled yet.
                </p>
              ) : (
                <div style={{ maxHeight: "250px", overflowY: "auto", overflowX: "auto", background: "rgba(0,0,0,0.3)", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <table style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.6rem" }}>Student</th>
                        <th style={{ padding: "0.6rem" }}>WhatsApp Phone</th>
                        <th style={{ padding: "0.6rem" }}>Sec</th>
                        <th style={{ padding: "0.6rem" }}>Goal</th>
                        <th style={{ padding: "0.6rem" }}>Allocated</th>
                        <th style={{ padding: "0.6rem" }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollmentsList.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "0.6rem", color: "#ffffff", fontWeight: 500 }}>
                            {item.userName}<br />
                            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{item.userEmail}</span>
                          </td>
                          <td style={{ padding: "0.6rem", color: "#25D366", fontWeight: 600 }}>{item.phone || "—"}</td>
                          <td style={{ padding: "0.6rem", color: "var(--accent)" }}>{item.collegeSection || "—"}</td>
                          <td style={{ padding: "0.6rem", color: "var(--text-muted)" }}>{goalLabels[item.careerGoal || ""] || item.careerGoal || "—"}</td>
                          <td style={{ padding: "0.6rem" }}>
                            <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                              {item.section.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "0.6rem", color: "var(--text-dim)", fontSize: "0.75rem" }}>
                            {new Date(item.enrolledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
