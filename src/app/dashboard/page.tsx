"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, Monogram, Badge, fmt, fmtBig } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";
import { COUNTRIES, priceFor, availFor, svcById, ccById } from "@/lib/data";

export default function HomeScreen() {
  const { tweaks, orders, catalog, services } = useApp();
  const router = useRouter();

  // Live best deals from catalog, fallback to static
  const deals = useMemo(() => {
    const combos: { svc: any; cc: any; price: number; avail: number }[] = [];
    for (const svc of services) {
      for (const cc of COUNTRIES) {
        const entry = catalog?.prices?.[`${svc.smspvaCode}_${cc.smspvaCode}`];
        const price = entry?.price ?? priceFor(svc, cc);
        const avail = entry?.count ?? availFor(svc, cc);
        if (avail < 50) continue;
        combos.push({ svc, cc, price, avail });
      }
    }
    return combos.sort((a, b) => a.price - b.price).slice(0, 6);
  }, [catalog, services]);

  // Real stats
  const numbersLive = useMemo(() => {
    if (!catalog?.prices) return null;
    const total = Object.values(catalog.prices as Record<string, any>).reduce((s, e) => s + (e.count ?? 0), 0);
    return total > 0 ? total : null;
  }, [catalog]);

  const successRate = useMemo(() => {
    if (!orders.length) return null;
    const received = orders.filter((o: any) => o.status === "received").length;
    return Math.round((received / orders.length) * 100);
  }, [orders]);

  const trendingIds = ["tg", "wa", "go", "oa", "ig", "di"];
  const trending = trendingIds.map(id => svcById(id, services)).filter(Boolean);
  const recentOrders = orders.slice(0, 3);

  function cheapestFor(svc: any): number {
    if (!catalog?.prices) return priceFor(svc, COUNTRIES[0]);
    const vals = COUNTRIES.map(cc => catalog.prices[`${svc.smspvaCode}_${cc.smspvaCode}`]?.price).filter((v: any) => v > 0);
    return vals.length ? Math.min(...vals) : priceFor(svc, COUNTRIES[0]);
  }

  function cheapestCountCount(svc: any): number {
    if (!catalog?.prices) return svc.avail ?? 0;
    const best = COUNTRIES.map(cc => catalog.prices[`${svc.smspvaCode}_${cc.smspvaCode}`]).filter(Boolean).sort((a: any, b: any) => a.price - b.price)[0];
    return best?.count ?? svc.avail ?? 0;
  }

  return (
    <div className="screen-in" style={{ paddingTop: 10 }}>
      <TopBar />

      <div className="dash-home-cols">
        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* hero */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Instant phone verification</div>
            <h1 style={{ margin: "0 0 16px", fontSize: "clamp(24px,3.5vw,34px)", lineHeight: 1.1,
              letterSpacing: "-0.025em", fontWeight: 700 }}>
              A number for any app,<br/>
              <span style={{ color: "var(--accent-bright)" }}>live in seconds.</span>
            </h1>
            <button onClick={() => router.push("/dashboard/browse")} className="btn" style={{
              width: "100%", justifyContent: "flex-start", gap: 11, padding: "14px 16px",
              background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line-2)",
              borderRadius: 14, color: "var(--txt-3)" }}>
              <Icon name="search" size={19}/>
              <span style={{ fontSize: 14.5 }}>Search {services.length}+ services…</span>
            </button>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[
                [numbersLive ? fmtBig(numbersLive) : "…", "numbers live"],
                [String(services.length), "services"],
                [successRate !== null ? `${successRate}%` : "—", "success rate"],
              ].map(([n, l]) => (
                <div key={l} className="card" style={{ flex: 1, padding: "10px 12px", borderRadius: 13 }}>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--accent-bright)" }}>{n}</div>
                  <div style={{ fontSize: 10.5, color: "var(--txt-3)", marginTop: 1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* all services grid */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)" }}>All services</span>
              <button onClick={() => router.push("/dashboard/browse")} className="btn"
                style={{ background: "transparent", color: "var(--accent-bright)", fontSize: 12.5, padding: 0 }}>
                Browse<Icon name="chevR" size={14}/>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {services.map((s: any) => (
                <button key={s.id} onClick={() => router.push(`/dashboard/service/${s.id}`)}
                  className="btn focusable" style={{
                    justifyContent: "flex-start", gap: 10, padding: "10px 11px",
                    background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)",
                    borderRadius: 12, color: "var(--txt)" }}>
                  <Monogram svc={s} size={32}/>
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--txt-3)", marginTop: 1 }}>
                      {catalog ? `from ${fmt(cheapestFor(s))}` : "View prices →"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* popular */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)" }}>Popular right now</span>
              <button onClick={() => router.push("/dashboard/browse")} className="btn"
                style={{ background: "transparent", color: "var(--accent-bright)", fontSize: 12.5, padding: 0 }}>
                All<Icon name="chevR" size={14}/>
              </button>
            </div>
            {tweaks.homeLayout === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {trending.map((s: any) => (
                  <button key={s.id} onClick={() => router.push(`/dashboard/service/${s.id}`)}
                    className="btn focusable" style={{
                      flexDirection: "column", alignItems: "flex-start", gap: 10, padding: 14,
                      background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)",
                      borderRadius: 16, color: "var(--txt)" }}>
                    <Monogram svc={s} size={42}/>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--txt-3)", marginTop: 2 }}>
                        {catalog ? `from ${fmt(cheapestFor(s))}` : "View prices →"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {trending.map((s: any) => (
                  <button key={s.id} onClick={() => router.push(`/dashboard/service/${s.id}`)}
                    className="btn focusable" style={{
                      justifyContent: "flex-start", gap: 12, padding: "10px 12px",
                      background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)",
                      borderRadius: 13, color: "var(--txt)" }}>
                    <Monogram svc={s} size={36}/>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--txt-3)", marginTop: 1 }}>
                        {catalog ? fmtBig(cheapestCountCount(s)) + " available" : "…"}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 12, color: "var(--accent-bright)", fontWeight: 600 }}>
                      {catalog ? fmt(cheapestFor(s)) : "…"}
                    </span>
                    <Icon name="chevR" size={15} stroke="var(--txt-3)"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* best value deals */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)" }}>Best value today</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)", display: "inline-block" }}/>
                <span style={{ fontSize: 11, color: "var(--txt-3)" }}>live prices</span>
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {deals.map(({ svc, cc, price, avail }) => (
                <button key={`${svc.id}-${cc.id}`}
                  onClick={() => router.push(`/dashboard/service/${svc.id}`)}
                  className="btn focusable" style={{
                    justifyContent: "flex-start", gap: 10, padding: "9px 11px",
                    background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)",
                    borderRadius: 11, color: "var(--txt)" }}>
                  <Monogram svc={svc} size={30}/>
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis" }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: "var(--txt-3)", marginTop: 1 }}>{cc.name} · {fmtBig(avail)} qty</div>
                  </div>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 700,
                    color: "var(--ok)", flexShrink: 0 }}>{fmt(price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* recent orders */}
          {recentOrders.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)" }}>Recent orders</span>
                <button onClick={() => router.push("/dashboard/orders")} className="btn"
                  style={{ background: "transparent", color: "var(--accent-bright)", fontSize: 12.5, padding: 0 }}>
                  All<Icon name="chevR" size={14}/>
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {recentOrders.map((o: any) => {
                  const svc = svcById(o.svc, services) ?? { name: o.svc, c: "var(--txt-3)", logoUrl: undefined };
                  const cc = ccById(o.cc) ?? { name: String(o.cc ?? "").toUpperCase(), id: o.cc };
                  return (
                    <button key={o.id} onClick={() => router.push(`/dashboard/order/${o.id}`)}
                      className="btn focusable" style={{
                        justifyContent: "flex-start", gap: 10, padding: "9px 11px",
                        background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)",
                        borderRadius: 11, color: "var(--txt)" }}>
                      <Monogram svc={svc} size={30}/>
                      <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{svc.name} · {cc.name}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: "var(--txt-3)", marginTop: 1 }}>{o.number}</div>
                      </div>
                      {o.status === "expired" ? <Badge kind={o.status}>Code not received</Badge> : <Badge kind={o.status}/>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
