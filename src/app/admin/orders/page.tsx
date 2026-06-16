"use client";

import { useState, useEffect } from "react";
import { Icon, fmt, Badge } from "@/components/ui/Primitives";
import { svcById, ccById, timeAgo } from "@/lib/data";

const FILTERS = [["all","All"],["waiting","Waiting"],["received","Received"],["expired","Expired"],["cancelled","Cancelled"]] as const;

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setOrders(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shown = orders.filter((o: any) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const svc = svcById(o.svc);
      const cc  = ccById(o.cc);
      return o.id.toLowerCase().includes(q)
        || (svc?.name.toLowerCase().includes(q) ?? false)
        || (cc?.name.toLowerCase().includes(q) ?? false)
        || String(o.number).includes(q);
    }
    return true;
  });

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Orders</h1>
        <p style={{ margin: "4px 0 0", color: "var(--txt-3)", fontSize: 14 }}>
          {loading ? "Loading…" : `${orders.length} total · ${orders.filter(o => o.status === "received").length} successful`}
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 10, minWidth: 220 }}>
          <Icon name="search" size={16} stroke="var(--txt-3)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 13.5, fontFamily: "var(--sans)", width: "100%" }}/>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(([id, l]) => (
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
              {["Order ID","Service","Country","Number","Code","Price","Status","Time"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--txt-3)", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>Loading orders…</td></tr>
            )}
            {!loading && shown.map((o: any) => {
              const svc = svcById(o.svc);
              const cc  = ccById(o.cc);
              return (
                <tr key={o.id} className="trow" style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent-bright)" }}>{o.id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {svc && <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11, color: svc.c, background: `color-mix(in oklab, ${svc.c} 16%, var(--surface-2))` }}>{svc.name[0]}</div>}
                      <span style={{ fontWeight: 500 }}>{svc?.name ?? o.svc}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--txt-2)" }}>{cc?.name ?? o.cc}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-2)" }}>{o.number}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontWeight: 700, color: "var(--ok)", letterSpacing: "0.06em" }}>{o.code ?? "—"}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontWeight: 600 }}>{fmt(o.price)}</td>
                  <td style={{ padding: "12px 16px" }}><Badge kind={o.status}/></td>
                  <td style={{ padding: "12px 16px", color: "var(--txt-3)", fontSize: 12 }}>{timeAgo(o.created_at)}</td>
                </tr>
              );
            })}
            {!loading && shown.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>No orders match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
