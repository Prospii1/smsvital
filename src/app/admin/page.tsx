"use client";

import { useState, useEffect } from "react";
import { Icon, fmt, Badge, Sparkline, Bars, useToast } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";
import { svcById, SERVICES } from "@/lib/data";

const MOCK_SPARKLINE = [42,55,48,70,63,82,74,90,85,102,95,118];
const MOCK_BARS      = [28,44,39,55,48,62,70,58,74,80,91,85];

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

export default function AdminOverview() {
  const { orders, txns } = useApp();
  const pushToast = useToast();
  const [markupPct, setMarkupPct] = useState(35);
  const [markupMin, setMarkupMin] = useState(0.05);
  const [usdToNgn, setUsdToNgn] = useState(1600);
  const [savingMarkup, setSavingMarkup] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config").then(r => r.json()).then(d => {
      if (d.percent !== undefined) setMarkupPct(d.percent);
      if (d.min_usd !== undefined) setMarkupMin(d.min_usd);
      if (d.usd_to_ngn !== undefined) setUsdToNgn(d.usd_to_ngn);
    }).catch(() => {});
  }, []);

  const saveMarkup = async () => {
    setSavingMarkup(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent: markupPct, min_usd: markupMin, usd_to_ngn: usdToNgn }),
      });
      if (res.ok) pushToast({ kind: "ok", msg: "Markup saved — prices update within 10 min" });
      else pushToast({ kind: "bad", msg: "Failed to save markup" });
    } catch {
      pushToast({ kind: "bad", msg: "Network error" });
    } finally {
      setSavingMarkup(false);
    }
  };

  const revenue = txns.filter(t => t.t === "topup").reduce((s: number, t: any) => s + t.amt, 0);
  const totalOrders = orders.length;
  const received = orders.filter((o: any) => o.status === "received").length;
  const successRate = totalOrders ? Math.round((received / totalOrders) * 100) : 0;

  const recentOrders = [...orders].slice(0, 8);

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Overview</h1>
        <p style={{ margin: "4px 0 0", color: "var(--txt-3)", fontSize: 14 }}>Platform activity · last 30 days</p>
      </div>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="wallet"  label="Total revenue"  value={fmt(revenue)}         trend={+18} />
        <StatCard icon="clock"   label="Total orders"   value={String(totalOrders)}  trend={+12} />
        <StatCard icon="check"   label="Success rate"   value={`${successRate}%`}    trend={+3}  />
        <StatCard icon="users"   label="Active users"   value="1,284"                trend={+9}  />
        <StatCard icon="phone"   label="Numbers served" value="148k+"                sub="All time" />
        <StatCard icon="refresh" label="Refund rate"    value="4.2%"                 trend={-1}  />
      </div>

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 16 }}>Revenue (last 12 months)</div>
          <Bars data={MOCK_BARS} h={80} color="var(--accent)"/>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "var(--txt-3)", fontFamily: "var(--mono)" }}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 16 }}>Order volume (last 12 months)</div>
          <Sparkline data={MOCK_SPARKLINE} w={undefined as any} h={80}/>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "var(--txt-3)", fontFamily: "var(--mono)" }}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* pricing & markup */}
      <div className="card" style={{ padding: "20px", borderRadius: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="tag" size={16} stroke="var(--accent-bright)"/>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Pricing & Markup</div>
            <div style={{ fontSize: 12, color: "var(--txt-3)", marginTop: 1 }}>Applied on top of supplier base prices · cached 10 min</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="eyebrow">Profit margin (%)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
              background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 10 }}>
              <input type="number" min={0} max={500} step={1} value={markupPct}
                onChange={e => setMarkupPct(Number(e.target.value))}
                style={{ width: 70, background: "transparent", border: "none", outline: "none",
                  color: "var(--txt)", fontSize: 15, fontFamily: "var(--mono)", fontWeight: 700 }}/>
              <span style={{ color: "var(--txt-3)", fontSize: 14 }}>%</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="eyebrow">Minimum fee (USD)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
              background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 10 }}>
              <span style={{ color: "var(--txt-3)", fontSize: 14 }}>$</span>
              <input type="number" min={0} max={10} step={0.01} value={markupMin}
                onChange={e => setMarkupMin(Number(e.target.value))}
                style={{ width: 60, background: "transparent", border: "none", outline: "none",
                  color: "var(--txt)", fontSize: 15, fontFamily: "var(--mono)", fontWeight: 700 }}/>
            </div>
          </div>
          <button onClick={saveMarkup} disabled={savingMarkup} className="btn btn-primary"
            style={{ padding: "12px 24px", borderRadius: 10, fontSize: 14 }}>
            {savingMarkup ? "Saving…" : "Save markup"}
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="eyebrow">USD → NGN rate</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
              background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 10 }}>
              <span style={{ color: "var(--txt-3)", fontSize: 13 }}>$1 =</span>
              <input type="number" min={1} step={1} value={usdToNgn}
                onChange={e => setUsdToNgn(Number(e.target.value))}
                style={{ width: 80, background: "transparent", border: "none", outline: "none",
                  color: "var(--txt)", fontSize: 15, fontFamily: "var(--mono)", fontWeight: 700 }}/>
              <span style={{ color: "var(--txt-3)", fontSize: 13 }}>₦</span>
            </div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)",
            border: "1px solid var(--line)", fontSize: 12.5, color: "var(--txt-3)" }}>
            Example: supplier $0.20 → user pays{" "}
            <span style={{ color: "var(--accent-bright)", fontFamily: "var(--mono)", fontWeight: 700 }}>
              ₦{Math.round(0.20 * (1 + markupPct / 100) * usdToNgn).toLocaleString("en-NG")}
            </span>
          </div>
        </div>
      </div>

      {/* top services */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 14 }}>Top services by volume</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SERVICES.slice(0, 6).map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 18, fontFamily: "var(--mono)", fontSize: 11, color: "var(--txt-3)" }}>#{i+1}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, color: s.c, background: `color-mix(in oklab, ${s.c} 16%, var(--surface-2))`, flexShrink: 0 }}>{s.name[0]}</div>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>{(s.avail * 0.08).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* recent orders mini */}
        <div className="card" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)", marginBottom: 14 }}>Recent orders</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentOrders.map((o: any) => {
              const svc = svcById(o.svc);
              if (!svc) return null;
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
