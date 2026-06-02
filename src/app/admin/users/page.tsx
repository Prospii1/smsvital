"use client";

import { useState } from "react";
import { Icon, fmt, Badge } from "@/components/ui/Primitives";

const MOCK_USERS = [
  { id: "USR-001", email: "alex.m***@gmail.com",   balance: 24.50, orders: 47,  spent: 31.20,  status: "active",   joined: "Jan 12, 2026" },
  { id: "USR-002", email: "dev.o***@proton.me",    balance: 5.40,  orders: 118, spent: 89.60,  status: "active",   joined: "Nov 3, 2025"  },
  { id: "USR-003", email: "sol.b***@yahoo.com",    balance: 0.00,  orders: 9,   spent: 6.30,   status: "active",   joined: "Mar 4, 2026"  },
  { id: "USR-004", email: "kemi.a***@outlook.com", balance: 88.00, orders: 302, spent: 248.90, status: "active",   joined: "Sep 20, 2025" },
  { id: "USR-005", email: "jude.c***@gmail.com",   balance: 1.20,  orders: 6,   spent: 4.10,   status: "flagged",  joined: "Apr 1, 2026"  },
  { id: "USR-006", email: "tolu.e***@proton.me",   balance: 0.00,  orders: 0,   spent: 0.00,   status: "active",   joined: "May 10, 2026" },
  { id: "USR-007", email: "rach.w***@gmail.com",   balance: 14.70, orders: 55,  spent: 42.00,  status: "active",   joined: "Feb 17, 2026" },
  { id: "USR-008", email: "bayo.k***@gmail.com",   balance: 0.00,  orders: 13,  spent: 9.80,   status: "banned",   joined: "Dec 5, 2025"  },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const shown = MOCK_USERS.filter(u => {
    if (filter !== "all" && u.status !== filter) return false;
    if (search) return u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Users</h1>
        <p style={{ margin: "4px 0 0", color: "var(--txt-3)", fontSize: 14 }}>{MOCK_USERS.length} registered accounts</p>
      </div>

      {/* toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 10, minWidth: 220 }}>
          <Icon name="search" size={16} stroke="var(--txt-3)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 13.5, fontFamily: "var(--sans)", width: "100%" }}/>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","All"],["active","Active"],["flagged","Flagged"],["banned","Banned"]].map(([id, l]) => (
            <button key={id} onClick={() => setFilter(id)} className="btn" style={{
              padding: "8px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
              background: filter === id ? "var(--accent-soft)" : "var(--surface)",
              color: filter === id ? "var(--accent-bright)" : "var(--txt-3)",
              boxShadow: filter === id ? "inset 0 0 0 1px var(--accent-line)" : "inset 0 0 0 1px var(--line)",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="card" style={{ borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["User ID","Email","Balance","Orders","Total spent","Status","Joined"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--txt-3)", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
              <th style={{ padding: "12px 16px" }}/>
            </tr>
          </thead>
          <tbody>
            {shown.map(u => (
              <tr key={u.id} className="trow" style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>{u.id}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="user" size={14} stroke="var(--accent-bright)"/>
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.email}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontWeight: 600, color: u.balance > 0 ? "var(--txt)" : "var(--txt-3)" }}>{fmt(u.balance)}</td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", color: "var(--txt-2)" }}>{u.orders}</td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", color: "var(--ok)", fontWeight: 600 }}>{fmt(u.spent)}</td>
                <td style={{ padding: "12px 16px" }}><Badge kind={u.status}/></td>
                <td style={{ padding: "12px 16px", color: "var(--txt-3)", fontSize: 12 }}>{u.joined}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn" style={{ padding: "5px 10px", borderRadius: 7, fontSize: 12, background: "var(--surface-2)", color: "var(--txt-2)", boxShadow: "inset 0 0 0 1px var(--line)" }}>View</button>
                    {u.status !== "banned" && <button className="btn" style={{ padding: "5px 10px", borderRadius: 7, fontSize: 12, background: "var(--bad-soft)", color: "var(--bad)", boxShadow: "inset 0 0 0 1px rgba(251,111,132,0.2)" }}>Ban</button>}
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>No users match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
