import "../app.css";
import React, { useState, useEffect } from "react";

function DashboardMockup() {
    const rows = [
        { name: "Juan dela Cruz", id: "2021-00012", pc: "PC-07", status: "active", time: "01:24" },
        { name: "Maria Santos", id: "2022-00134", pc: "PC-03", status: "active", time: "00:47" },
        { name: "Carlo Reyes", id: "2023-00088", pc: "PC-11", status: "idle", time: "00:05" },
        { name: "Ana Mercado", id: "2021-00201", pc: "PC-02", status: "active", time: "02:10" },
    ];

    return (
        <div className="mockup-shell w-full max-w-2xl mx-auto float-anim">
            {/* Window chrome */}
            <div className="mockup-bar">
                <span className="mockup-dot" style={{ background: "#ff5f57" }} />
                <span className="mockup-dot" style={{ background: "#febc2e" }} />
                <span className="mockup-dot" style={{ background: "#28c840" }} />
                <span style={{ marginLeft: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                    CCS Lab Monitor — Dashboard
                </span>
            </div>

            <div className="mockup-content">
                {/* Stat cards */}
                <div className="mockup-stat-row">
                    <div className="mockup-stat-card">
                        <div className="mockup-stat-val">28</div>
                        <div className="mockup-stat-label">Active Seats</div>
                    </div>
                    <div className="mockup-stat-card">
                        <div className="mockup-stat-val">12</div>
                        <div className="mockup-stat-label">Available</div>
                    </div>
                    <div className="mockup-stat-card">
                        <div className="mockup-stat-val" style={{ color: "#34d399" }}>70%</div>
                        <div className="mockup-stat-label">Occupancy</div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ marginTop: 4 }}>
                    <div className="mockup-table-header">
                        <span>Student</span>
                        <span>PC</span>
                        <span>Status</span>
                        <span>Duration</span>
                    </div>
                    {rows.map((r, i) => (
                        <div key={i} className="mockup-table-row">
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{r.name}</span>
                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{r.id}</span>
                            </div>
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>{r.pc}</span>
                            <span className={`mockup-status-badge ${r.status === "active" ? "mockup-status-active" : "mockup-status-idle"}`}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                                {r.status}
                            </span>
                            <span style={{ color: "#e4b857", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                                {r.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default DashboardMockup;