"use client";

import { useState, useEffect } from "react";
import { Icon, fmt } from "@/components/ui/Primitives";

const TYPE_LABELS: Record<string, string> = { topup: "Top-up", purchase: "Purchase", refund: "Refund" };
const TYPE_COLORS: Record<string, string> = { topup: "var(--ok)", purchase: "var(--txt)", refund: "var(--warn)" };

export default function AdminWallet() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/transactions")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setTxns(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shown = txns.filter((t: any) => {
    if (filter !== "all" && t.t !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return String(t.label).toLowerCase().includes(q)
        || String(t.id).toLowerCase().includes(q)
        || String(t.ref).toLowerCase().includes(q);
    }
    return true;
  });

  const totalIn  = txns.filter((t: any) => t.amt > 0).reduce((s: number, t: any) => s + t.amt, 0);
  const totalOut = txns.filter((t: any) => t.amt < 0).reduce((s: number, t: any) => s + Math.abs(t.amt), 0);

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Transactions</h1>
        <p style={{ margin: "4px 0 0", color: "var(--txt-3)", fontSize: 14 }}>
          {loading ? "Loading…" : `${txns.length} records · all time`}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total funded",  value: loading ? "…" : fmt(totalIn),            color: "var(--ok)"           },
          { label: "Total spent",   value: loading ? "…" : fmt(totalOut),            color: "var(--txt)"          },
          { label: "Net balance",   value: loading ? "…" : fmt(totalIn - totalOut),  color: "var(--accent-bright)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 18px", borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: "var(--txt-3)", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 10, minWidth: 220 }}>
          <Icon name="search" size={16} stroke="var(--txt-3)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions…"
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 13.5, fontFamily: "var(--sans)", width: "100%" }}/>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","All"],["topup","Top-ups"],["purchase","Purchases"],["refund","Refunds"]].map(([id, l]) => (
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
              {["Txn ID","Description","Reference","Type","Amount","Time"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--txt-3)", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>Loading transactions…</td></tr>
            )}
            {!loading && shown.map((t: any) => (
              <tr key={t.id} className="trow" style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>{t.id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>{t.label}</td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>{t.ref}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "var(--surface-2)", color: TYPE_COLORS[t.t] ?? "var(--txt-3)" }}>
                    {TYPE_LABELS[t.t] ?? t.t}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontWeight: 700, color: t.amt >= 0 ? "var(--ok)" : "var(--txt)" }}>
                  {t.amt >= 0 ? "+" : ""}{fmt(Math.abs(t.amt))}
                </td>
                <td style={{ padding: "12px 16px", color: "var(--txt-3)", fontSize: 12 }}>{t.when}</td>
              </tr>
            ))}
            {!loading && shown.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>No transactions match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
