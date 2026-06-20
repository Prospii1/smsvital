"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon, fmt, Badge, useToast } from "@/components/ui/Primitives";
import { svcById, ccById, timeAgo } from "@/lib/data";

const FILTERS = [["all","All"],["stuck","Stuck"],["waiting","Waiting"],["received","Received"],["expired","Expired"],["cancelled","Cancelled"]] as const;

function isStuck(o: any) {
  if (o.status !== "waiting") return false;
  const elapsed = (Date.now() - new Date(o.created_at).getTime()) / 1000;
  return elapsed >= (o.expires ?? 600);
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [refunding, setRefunding] = useState<Record<string, boolean>>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const pushToast = useToast();

  const loadOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setOrders(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const shown = orders.filter((o: any) => {
    if (filter === "stuck" && !isStuck(o)) return false;
    if (filter !== "all" && filter !== "stuck" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const svc = svcById(o.svc);
      const cc  = ccById(o.cc);
      return o.id.toLowerCase().includes(q)
        || (svc?.name.toLowerCase().includes(q) ?? false)
        || (cc?.name.toLowerCase().includes(q) ?? false)
        || String(o.number).includes(q)
        || (o.user_id ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const stuckCount = orders.filter(isStuck).length;

  const refundOne = async (orderId: string) => {
    setRefunding(r => ({ ...r, [orderId]: true }));
    try {
      const res = await fetch(`/api/admin/refund/${orderId}`, { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        setOrders(os => os.map(o => o.id === orderId ? { ...o, status: "expired" } : o));
        pushToast({ kind: "ok", msg: `Refunded ₦${d.refunded} to user` });
      } else {
        pushToast({ kind: "bad", msg: d.error ?? "Refund failed" });
      }
    } catch {
      pushToast({ kind: "bad", msg: "Network error" });
    }
    setRefunding(r => ({ ...r, [orderId]: false }));
  };

  const refundBulk = async () => {
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/refund/bulk", { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        pushToast({ kind: "ok", msg: `Refunded ${d.refundCount} orders · ₦${d.refundedAmount} total` });
        loadOrders();
      } else {
        pushToast({ kind: "bad", msg: d.error ?? "Bulk refund failed" });
      }
    } catch {
      pushToast({ kind: "bad", msg: "Network error" });
    }
    setBulkLoading(false);
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Orders</h1>
        <p style={{ margin: "4px 0 0", color: "var(--txt-3)", fontSize: 14 }}>
          {loading ? "Loading…" : `${orders.length} total · ${orders.filter(o => o.status === "received").length} successful${stuckCount > 0 ? ` · ${stuckCount} stuck` : ""}`}
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 10, minWidth: 220 }}>
          <Icon name="search" size={16} stroke="var(--txt-3)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, user ID…"
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 13.5, fontFamily: "var(--sans)", width: "100%" }}/>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map(([id, l]) => (
            <button key={id} onClick={() => setFilter(id)} className="btn" style={{
              padding: "8px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
              background: filter === id ? (id === "stuck" ? "color-mix(in oklab, var(--bad) 18%, var(--surface))" : "var(--accent-soft)") : "var(--surface)",
              color: filter === id ? (id === "stuck" ? "var(--bad)" : "var(--accent-bright)") : "var(--txt-3)",
              boxShadow: filter === id ? `inset 0 0 0 1px ${id === "stuck" ? "color-mix(in oklab, var(--bad) 40%, transparent)" : "var(--accent-line)"}` : "inset 0 0 0 1px var(--line)",
            }}>
              {l}{id === "stuck" && stuckCount > 0 ? ` (${stuckCount})` : ""}
            </button>
          ))}
        </div>
        {filter === "stuck" && stuckCount > 0 && (
          <button onClick={refundBulk} disabled={bulkLoading} className="btn btn-primary" style={{
            padding: "8px 16px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6, marginLeft: "auto",
          }}>
            {bulkLoading ? <Icon name="refresh" size={14} className="spin"/> : <Icon name="refresh" size={14}/>}
            Refund all stuck
          </button>
        )}
      </div>

      <div className="card" style={{ borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["Order ID","User","Service","Country","Number","Code","Price","Status","Time","Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--txt-3)", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>Loading orders…</td></tr>
            )}
            {!loading && shown.map((o: any) => {
              const svc = svcById(o.svc);
              const cc  = ccById(o.cc);
              const stuck = isStuck(o);
              return (
                <tr key={o.id} className="trow" style={{ borderBottom: "1px solid var(--line)", background: stuck ? "color-mix(in oklab, var(--bad) 5%, transparent)" : undefined }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent-bright)" }}>{o.id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {o.user_id ? (
                      <a href="/admin/users" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--txt-3)", textDecoration: "none" }}
                        title={o.user_id}>
                        {o.user_id.slice(0, 8).toUpperCase()}
                      </a>
                    ) : <span style={{ color: "var(--txt-3)" }}>—</span>}
                  </td>
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
                  <td style={{ padding: "12px 16px" }}><Badge kind={stuck ? "expired" : o.status}/>{stuck && <span style={{ fontSize: 10, color: "var(--bad)", marginLeft: 5, fontWeight: 700 }}>STUCK</span>}</td>
                  <td style={{ padding: "12px 16px", color: "var(--txt-3)", fontSize: 12 }}>{timeAgo(o.created_at)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {o.status === "waiting" ? (
                      <button onClick={() => refundOne(o.id)} disabled={!!refunding[o.id]} className="btn" style={{
                        padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                        background: "color-mix(in oklab, var(--bad) 18%, var(--surface))",
                        color: "var(--bad)", boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--bad) 40%, transparent)",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        {refunding[o.id] ? <Icon name="refresh" size={12} className="spin"/> : <Icon name="refresh" size={12}/>}
                        Refund
                      </button>
                    ) : <span style={{ color: "var(--txt-3)", fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              );
            })}
            {!loading && shown.length === 0 && (
              <tr><td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "var(--txt-3)" }}>No orders match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
