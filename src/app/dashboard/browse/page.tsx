"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, Monogram } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";

export default function BrowseScreen() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const { services, catalog } = useApp();

  const list = services.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));

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
          {list.map((s: any) => {
            const svcWithLogo = catalog?.logos?.[s.smspvaCode] ? { ...s, logoUrl: catalog.logos[s.smspvaCode] } : s;
            return (
            <button key={s.id} onClick={() => router.push(`/dashboard/service/${s.id}`)} className="btn focusable" style={{
              justifyContent: "flex-start", gap: 12, padding: "10px 12px",
              background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)", borderRadius: 13, color: "var(--txt)" }}>
              <Monogram svc={svcWithLogo} size={40}/>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--txt-3)", marginTop: 1 }}>View prices →</div>
              </div>
            </button>
            );
          })}
          {list.length === 0 && <div style={{ textAlign: "center", color: "var(--txt-3)", padding: "40px 0", fontSize: 14 }}>No services match "{q}".</div>}
        </div>
      </div>
    </div>
  );
}
