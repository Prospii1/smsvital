"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, Monogram, fmt, fmtBig } from "@/components/ui/Primitives";
import { SERVICES, COUNTRIES, priceFor } from "@/lib/data";

export default function BrowseScreen() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const [catalog, setCatalog] = useState<any>(null);

  useEffect(() => {
    fetch("/api/sms/catalog").then(r => r.json()).then(setCatalog).catch(() => {});
  }, []);

  // Cheapest country price for a service from live catalog
  function fromPrice(svc: any): number {
    if (catalog?.prices) {
      const prices = COUNTRIES.map(cc => {
        const e = catalog.prices[`${svc.smspvaCode}_${cc.smspvaCode}`];
        return e?.price ?? priceFor(svc, cc);
      });
      return Math.min(...prices);
    }
    return Math.min(...COUNTRIES.map(cc => priceFor(svc, cc)));
  }

  const list = SERVICES.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="screen-in" style={{ display: "flex", flexDirection: "column", paddingTop: 10 }}>
      <TopBar />
      <div style={{ padding: "0 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
          background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 13 }}>
          <Icon name="search" size={18} stroke="var(--txt-3)"/>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search services…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 15, fontFamily: "var(--sans)" }}/>
          {q && <button className="btn" onClick={() => setQ("")} style={{ background: "transparent", color: "var(--txt-3)", padding: 0 }}><Icon name="x" size={16}/></button>}
        </div>
      </div>
      <div style={{ padding: "0 18px 18px" }}>
        <div className="svc-grid">
          {list.map((s: any) => (
            <button key={s.id} onClick={() => router.push(`/dashboard/service/${s.id}`)} className="btn focusable" style={{
              justifyContent: "flex-start", gap: 12, padding: "10px 12px",
              background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)", borderRadius: 13, color: "var(--txt)" }}>
              <Monogram svc={s} size={40}/>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--txt-3)", marginTop: 1 }}>{fmtBig(s.avail)} numbers</div>
              </div>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--accent-bright)", fontWeight: 600 }}>
                {catalog ? fmt(fromPrice(s)) : <span className="skel" style={{ width: 36, height: 14, display: "inline-block", borderRadius: 4 }}/>}
              </span>
            </button>
          ))}
          {list.length === 0 && <div style={{ textAlign: "center", color: "var(--txt-3)", padding: "40px 0", fontSize: 14 }}>No services match "{q}".</div>}
        </div>
      </div>
    </div>
  );
}
