"use client";

import { useRouter } from "next/navigation";
import { Icon, fmt } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";

export function TopBar({ title, back }: { title?: string, back?: boolean }) {
  const { balance } = useApp();
  const router = useRouter();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 18px", gap: 12,
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(7,8,11,0.82)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--line)", marginBottom: 4 }}>
      {back ? (
        <button className="btn" onClick={() => router.back()} style={{ background:"var(--surface-2)", width:38, height:38, borderRadius:12, boxShadow:"inset 0 0 0 1px var(--line)", color:"var(--txt)" }}>
          <Icon name="chevL" size={20}/>
        </button>
      ) : (
        <div className="dash-topbar-logo" style={{ alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:"var(--accent)", display:"flex",alignItems:"center",justifyContent:"center", boxShadow:"0 0 16px -2px var(--accent-glow)" }}>
            <Icon name="bolt" size={18} stroke="#0a0612"/>
          </div>
          <span style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:17, letterSpacing:"-0.02em" }}>smsvital</span>
        </div>
      )}
      {title && <span style={{ fontWeight:600, fontSize:16 }}>{title}</span>}
      <button className="btn" onClick={() => router.push("/dashboard/wallet")} style={{
        background:"var(--surface-2)", boxShadow:"inset 0 0 0 1px var(--line)",
        borderRadius:11, padding:"7px 12px", gap:7, color:"var(--txt)" }}>
        <Icon name="wallet" size={16} stroke="var(--accent-bright)"/>
        <span className="mono" style={{ fontSize:13.5, fontWeight:700 }}>{fmt(balance)}</span>
      </button>
    </div>
  );
}
