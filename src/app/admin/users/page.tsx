"use client";

import { useState, useEffect } from "react";
import { Icon, fmt, Badge } from "@/components/ui/Primitives";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => {
        console.log("admin/users response:", JSON.stringify(d));
        if (Array.isArray(d)) setUsers(d);
      })
      .catch(e => console.error("admin/users fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  const shown = users.filter(u => {
    if (filter !== "all" && u.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Users</h1>
        <p style={{ margin: "4px 0 0", color: "var(--txt-3)", fontSize: 14 }}>
          {loading ? "Loading…" : `${users.length} registered accounts`}
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 10, minWidth: 220 }}>
          <Icon name="search" size={16} stroke="var(--txt-3)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 13.5, fontFamily: "var(--sans)", width: "100%" }}/>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","All"],["active","Active"],["banned","Banned"]].map(([id, l]) => (
            <button key={id} onClick={() => setFilter(id)} className="btn" style={{
              padding: "8px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
              background: filter === id ? "var(--accent-soft)" : "var(--surface)",
              color: filter === id ? "var(--accent-bright)" : "var(--txt-3)",
              boxShadow: filter === id ? "inset 0 0 0 1px var(--accent-line)" : "inset 0 0 0 1px var(--line)",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["User ID","Email","Balance","Orders","Total spent","Status","Joined"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--txt-3)", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>Loading users…</td></tr>
            )}
            {!loading && shown.map(u => (
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
              </tr>
            ))}
            {!loading && shown.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
