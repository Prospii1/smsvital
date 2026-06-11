"use client";

import { useState, useEffect } from "react";
import { Icon, fmt, fmtBig, Badge, Sparkline, Bars, useToast } from "@/components/ui/Primitives";
import { svcById } from "@/lib/data";

interface Tier { from: number; to: number; percent: number; }

function getTierPercent(usd: number, tiers: Tier[]): number {
  for (const t of tiers) {
    if (usd >= t.from && usd <= t.to) return t.percent;
  }
  return tiers[tiers.length - 1]?.percent ?? 35;
}

function calcNgn(usd: number, tiers: Tier[], minUsd: number, rate: number) {
  const pct = getTierPercent(usd, tiers);
  const fee = Math.max(usd * (pct / 100), minUsd);
  return { userPays: Math.round((usd + fee) * rate), profit: Math.round(fee * rate), pct };
}

function StatCard({ icon, label, value, sub, trend }: { icon: string; label: string; value: string; sub?: string; trend?: number }) {
  return (
    <div className="card" style={{ padding: "20px", borderRadius: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-bright)" }}>
          <Icon name={icon} size={18}/>
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? "var(--ok)" : "var(--bad)", fontFamily: "var(--mono)" }}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--txt-3)", marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--txt-3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

const PREVIEW_PRICES = [0.10, 0.30, 1.50, 3.00, 6.00];
const DEFAULT_TIERS: Tier[] = [{ from: 0, to: 9999, percent: 35 }];

export default function AdminOverview() {
  const pushToast = useToast();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<{ svc: string; count: number }[]>([]);
  const [chartData, setChartData] = useState<{
    revenue: number[]; orders: number[]; labels: string[];
    userCount?: number; totalOrderCount?: number; refundRate?: string;
    successRate?: number; totalRevenue?: number;
  } | null>(null);
  const [supplierBalance, setSupplierBalance] = useState<string | null>(null);
  const [supplierUsername, setSupplierUsername] = useState<string | null>(null);

  // Markup state
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [minUsd, setMinUsd] = useState(0.05);
  const [usdToNgn, setUsdToNgn] = useState(1600);
  const [savingMarkup, setSavingMarkup] = useState(false);
  const [refreshingCatalog, setRefreshingCatalog] = useState(false);
  const [markupError, setMarkupError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.ok ? r.json() : null).then(d => d?.revenue && setChartData(d)).catch(() => {});
    fetch("/api/admin/supplier-balance").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.balance !== undefined) setSupplierBalance(d.balance);
      if (d?.username) setSupplierUsername(d.username);
    }).catch(() => {});
    fetch("/api/admin/orders").then(r => r.ok ? r.json() : null).then((data: any[]) => {
      if (!Array.isArray(data)) return;
      setRecentOrders(data.slice(0, 8));
      const counts: Record<string, number> = {};
      for (const o of data) { counts[o.svc] = (counts[o.svc] ?? 0) + 1; }
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
      setTopServices(sorted.map(([svc, count]) => ({ svc, count })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/config").then(r => r.json()).then(d => {
      if (Array.isArray(d.tiers) && d.tiers.length) setTiers(d.tiers);
      if (typeof d.min_usd    === "number") setMinUsd(d.min_usd);
      if (typeof d.usd_to_ngn === "number") setUsdToNgn(d.usd_to_ngn);
    }).catch(() => {});
  }, []);

  const updateTier = (i: number, field: keyof Tier, val: number) => {
    setTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
    setMarkupError("");
  };

  const addTier = () => {
    const last = tiers[tiers.length - 1];
    setTiers(prev => [...prev, { from: last ? last.to + 0.01 : 0, to: 9999, percent: 10 }]);
  };

  const removeTier = (i: number) => {
    if (tiers.length <= 1) { setMarkupError("At least 1 tier is required."); return; }
    setTiers(prev => prev.filter((_, idx) => idx !== i));
    setMarkupError("");
  };

  const validateTiers = (): string => {
    if (tiers.length === 0) return "At least 1 tier is required.";
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (t.to <= t.from) return `Tier ${i + 1}: "To" must be greater than "From".`;
      if (t.percent < 0 || t.percent > 1000) return `Tier ${i + 1}: Percent must be 0–1000.`;
    }
    if (usdToNgn < 100) return "USD → NGN rate must be at least 100.";
    if (minUsd < 0) return "Floor markup cannot be negative.";
    return "";
  };

  const saveMarkup = async () => {
    const err = validateTiers();
    if (err) { setMarkupError(err); return; }
    setMarkupError("");
    setSavingMarkup(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers, min_usd: minUsd, usd_to_ngn: usdToNgn }),
      });
      const d = await res.json();
      if (res.ok) pushToast({ kind: "ok", msg: "Markup saved — click Refresh to apply immediately" });
      else { setMarkupError(d.error ?? "Failed to save markup"); }
    } catch {
      setMarkupError("Network error — try again");
    } finally {
      setSavingMarkup(false);
    }
  };

  const refreshCatalog = async () => {
    setRefreshingCatalog(true);
    try {
      const res = await fetch("/api/sms/catalog", { method: "DELETE" });
      if (res.ok) pushToast({ kind: "ok", msg: "Catalog refreshed — prices are now live" });
      else pushToast({ kind: "bad", msg: "Failed to refresh catalog" });
    } catch {
      pushToast({ kind: "bad", msg: "Network error" });
    } finally {
      setRefreshingCatalog(false);
    }
  };

  const inputStyle = {
    background: "transparent", border: "none", outline: "none",
    color: "var(--txt)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700,
  };
  const cellStyle = {
    padding: "8px 10px", background: "var(--surface-2)",
    boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 9,
    display: "flex", alignItems: "center", gap: 5,
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Overview</h1>
        <p style={{ margin: "4px 0 0", color: "var(--txt-3)", fontSize: 14 }}>Platform activity · last 30 days</p>
      </div>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="wallet"  label="Total revenue"  value={chartData ? fmt(chartData.totalRevenue ?? 0) : "…"} />
        <StatCard icon="clock"   label="Total orders"   value={chartData ? fmtBig(chartData.totalOrderCount ?? 0) : "…"} />
        <StatCard icon="check"   label="Success rate"   value={chartData ? `${chartData.successRate ?? 0}%` : "…"} />
        <StatCard icon="users"   label="Active users"   value={chartData ? String(chartData.userCount ?? 0) : "…"} />
        <StatCard icon="phone"   label="Numbers served" value={chartData ? fmtBig(chartData.totalOrderCount ?? 0) : "…"} sub="All time" />
        <StatCard icon="refresh" label="Refund rate"    value={chartData ? (chartData.refundRate ?? "0.0") + "%" : "…"} />
      </div>

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 16 }}>Revenue (last 12 months)</div>
          {chartData ? <Bars data={chartData.revenue} h={80} color="var(--accent)"/> : <div className="skel" style={{ height: 80, borderRadius: 8 }}/>}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "var(--txt-3)", fontFamily: "var(--mono)" }}>
            {(chartData?.labels ?? Array(12).fill("")).map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>
        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 16 }}>Order volume (last 12 months)</div>
          {chartData ? <Sparkline data={chartData.orders} w={undefined as any} h={80}/> : <div className="skel" style={{ height: 80, borderRadius: 8 }}/>}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "var(--txt-3)", fontFamily: "var(--mono)" }}>
            {(chartData?.labels ?? Array(12).fill("")).map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* supplier account */}
      <div className="card" style={{ padding: "16px 20px", borderRadius: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: Number(supplierBalance) > 0 ? "var(--ok-soft)" : "var(--bad-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="phone" size={17} stroke={Number(supplierBalance) > 0 ? "var(--ok)" : "var(--bad)"}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>SMSPVA Supplier Account{supplierUsername ? ` · ${supplierUsername}` : ""}</div>
          <div style={{ fontSize: 12, color: "var(--txt-3)", marginTop: 2 }}>
            Balance:{" "}
            <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: supplierBalance === null ? "var(--txt-3)" : (Number(supplierBalance) > 0 ? "var(--ok)" : "var(--bad)") }}>
              {supplierBalance === null ? "…" : `$${supplierBalance}`}
            </span>
            {supplierBalance !== null && Number(supplierBalance) <= 0 && (
              <span style={{ color: "var(--bad)", marginLeft: 8 }}>⚠ Top up SMSPVA to enable number purchases</span>
            )}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--txt-3)", fontFamily: "var(--mono)" }}>smspva.com</div>
      </div>

      {/* ── Pricing & Markup ─────────────────────────────────────────────── */}
      <div className="card" style={{ padding: "24px", borderRadius: 16, marginBottom: 28 }}>
        {/* header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="tag" size={16} stroke="var(--accent-bright)"/>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Pricing & Markup</div>
              <div style={{ fontSize: 12, color: "var(--txt-3)", marginTop: 1 }}>
                Set profit tiers by supplier price range · changes apply after saving + refreshing
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={saveMarkup} disabled={savingMarkup || refreshingCatalog} className="btn btn-primary"
              style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13.5 }}>
              {savingMarkup ? "Saving…" : "Save markup"}
            </button>
            <button onClick={refreshCatalog} disabled={savingMarkup || refreshingCatalog} className="btn"
              style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13.5, background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", color: "var(--txt-2)", display: "flex", alignItems: "center", gap: 7 }}>
              <Icon name="refresh" size={14}/>
              {refreshingCatalog ? "Refreshing…" : "Refresh catalog"}
            </button>
          </div>
        </div>

        {/* global settings */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="eyebrow">Floor markup (USD)</label>
            <div style={{ ...cellStyle }}>
              <span style={{ color: "var(--txt-3)", fontSize: 13 }}>$</span>
              <input type="number" min={0} max={100} step={0.01} value={minUsd}
                onChange={e => { setMinUsd(Number(e.target.value)); setMarkupError(""); }}
                style={{ ...inputStyle, width: 64 }}/>
            </div>
            <div style={{ fontSize: 11, color: "var(--txt-3)" }}>Min profit per number</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="eyebrow">USD → NGN rate</label>
            <div style={{ ...cellStyle }}>
              <span style={{ color: "var(--txt-3)", fontSize: 12 }}>$1 =</span>
              <input type="number" min={100} step={1} value={usdToNgn}
                onChange={e => { setUsdToNgn(Number(e.target.value)); setMarkupError(""); }}
                style={{ ...inputStyle, width: 76 }}/>
              <span style={{ color: "var(--txt-3)", fontSize: 13 }}>₦</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--txt-3)" }}>Conversion rate applied to all prices</div>
          </div>
        </div>

        {/* tier table */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--txt-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Markup tiers (by supplier price)
          </div>

          {/* column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 36px", gap: 8, marginBottom: 6, padding: "0 2px" }}>
            {["From ($)", "To ($)", "Markup %", ""].map(h => (
              <div key={h} style={{ fontSize: 10.5, color: "var(--txt-3)", fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {tiers.map((t, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <div style={{ ...cellStyle }}>
                <span style={{ color: "var(--txt-3)", fontSize: 12 }}>$</span>
                <input type="number" min={0} step={0.01} value={t.from}
                  onChange={e => updateTier(i, "from", Number(e.target.value))}
                  style={{ ...inputStyle, width: "100%" }}/>
              </div>
              <div style={{ ...cellStyle }}>
                <span style={{ color: "var(--txt-3)", fontSize: 12 }}>$</span>
                <input type="number" min={0} step={0.01} value={t.to}
                  onChange={e => updateTier(i, "to", Number(e.target.value))}
                  style={{ ...inputStyle, width: "100%" }}/>
              </div>
              <div style={{ ...cellStyle }}>
                <input type="number" min={0} max={1000} step={1} value={t.percent}
                  onChange={e => updateTier(i, "percent", Number(e.target.value))}
                  style={{ ...inputStyle, width: "100%" }}/>
                <span style={{ color: "var(--txt-3)", fontSize: 13 }}>%</span>
              </div>
              <button onClick={() => removeTier(i)} className="btn" style={{
                width: 36, height: 36, borderRadius: 9, padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bad-soft)", color: "var(--bad)",
                boxShadow: "inset 0 0 0 1px rgba(251,111,132,0.2)", flexShrink: 0,
              }}>
                <Icon name="x" size={14}/>
              </button>
            </div>
          ))}

          <button onClick={addTier} className="btn" style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px", borderRadius: 9, fontSize: 13, color: "var(--accent-bright)",
            background: "var(--accent-soft)", boxShadow: "inset 0 0 0 1px var(--accent-line)",
          }}>
            <Icon name="plus" size={14} stroke="var(--accent-bright)"/>
            Add tier
          </button>
        </div>

        {/* validation error */}
        {markupError && (
          <div style={{ padding: "10px 14px", borderRadius: 9, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 13, color: "var(--bad)", marginBottom: 16 }}>
            {markupError}
          </div>
        )}

        {/* live profit preview */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--txt-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Live profit preview
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
                  {["Supplier price", "Tier applies", "User pays (₦)", "Your profit (₦)"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--txt-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREVIEW_PRICES.map(usd => {
                  const { userPays, profit, pct } = calcNgn(usd, tiers, minUsd, usdToNgn);
                  return (
                    <tr key={usd} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "9px 14px", fontFamily: "var(--mono)", fontWeight: 600 }}>${usd.toFixed(2)}</td>
                      <td style={{ padding: "9px 14px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent-bright)" }}>
                          {pct}%
                        </span>
                      </td>
                      <td style={{ padding: "9px 14px", fontFamily: "var(--mono)", fontWeight: 700 }}>
                        {fmt(userPays)}
                      </td>
                      <td style={{ padding: "9px 14px", fontFamily: "var(--mono)", fontWeight: 700, color: "var(--ok)" }}>
                        +{fmt(profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* top services + recent orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 14 }}>Top services by order volume</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topServices.length === 0 && (
              <div style={{ color: "var(--txt-3)", fontSize: 13 }}>No orders yet.</div>
            )}
            {topServices.map(({ svc: svcId, count }, i) => {
              const s = svcById(svcId) ?? { name: svcId, c: "var(--txt-3)" };
              return (
                <div key={svcId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 18, fontFamily: "var(--mono)", fontSize: 11, color: "var(--txt-3)" }}>#{i+1}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, color: s.c, background: `color-mix(in oklab, ${s.c} 16%, var(--surface-2))`, flexShrink: 0 }}>{s.name[0]}</div>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>{count} orders</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 14 }}>Recent orders</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentOrders.length === 0 && (
              <div style={{ color: "var(--txt-3)", fontSize: 13 }}>No orders yet.</div>
            )}
            {recentOrders.map((o: any) => {
              const svc = svcById(o.svc) ?? { name: o.svc, c: "var(--txt-3)" };
              return (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 12, color: svc.c, background: `color-mix(in oklab, ${svc.c} 16%, var(--surface-2))`, flexShrink: 0 }}>{svc.name[0]}</div>
                  <span style={{ flex: 1, color: "var(--txt-2)", fontWeight: 500 }}>{svc.name}</span>
                  <Badge kind={o.status}/>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>{fmt(o.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
