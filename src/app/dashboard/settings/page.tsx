"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, fmt } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";
import { createClient } from "@/lib/supabase";

function maskEmail(email: string | null): string {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  return local.slice(0, 3) + "***@" + domain;
}

function fmtJoined(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function Row({ icon, label, val, danger, onClick }: {
  icon: string; label: string; val?: string; danger?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="btn" style={{
      width: "100%", justifyContent: "flex-start", gap: 13, padding: "14px 14px", borderRadius: 0,
      background: "transparent", borderBottom: "1px solid var(--line)", color: danger ? "var(--bad)" : "var(--txt)", outline: "none",
    }}>
      <Icon name={icon} size={19} stroke={danger ? "var(--bad)" : "var(--accent-bright)"}/>
      <span style={{ flex: 1, textAlign: "left", fontSize: 14.5, fontWeight: 500 }}>{label}</span>
      {val && <span style={{ fontSize: 13, color: "var(--txt-3)" }}>{val}</span>}
      {!danger && <Icon name="chevR" size={16} stroke="var(--txt-3)"/>}
    </button>
  );
}

export default function SettingsScreen() {
  const { balance, tweaks, setTweaks, orders, userEmail, userJoinedAt } = useApp();
  const router = useRouter();

  return (
    <div className="screen-in" style={{ display: "flex", flexDirection: "column", paddingTop: 10 }}>
      <TopBar title="Account" />
      <div className="dash-narrow" style={{ padding: "0 18px 18px" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px", borderRadius: 16, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px var(--accent-line)" }}>
            <Icon name="user" size={24} stroke="var(--accent-bright)"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15.5 }}>{maskEmail(userEmail)}</div>
            <div style={{ fontSize: 12, color: "var(--txt-3)", marginTop: 2 }}>Member since {fmtJoined(userJoinedAt)} · {orders.length} orders</div>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden", borderRadius: 16 }}>
          <Row icon="wallet" label="Wallet & billing" val={fmt(balance)} onClick={() => router.push("/dashboard/wallet")}/>
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "20px 2px 10px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)" }}>Appearance</span>
        </div>
        <div className="card" style={{ padding: "16px", borderRadius: 16, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>OTP arrival animation</div>
            <div style={{ display: "flex", gap: 7 }}>
              {(["flip", "pop", "type"] as const).map(v => (
                <button key={v} onClick={() => setTweaks((t: any) => ({ ...t, otpArrival: v }))} className="btn" style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 600, textTransform: "capitalize",
                  background: tweaks.otpArrival === v ? "var(--accent-soft)" : "var(--surface-2)",
                  color: tweaks.otpArrival === v ? "var(--accent-bright)" : "var(--txt-3)",
                  boxShadow: tweaks.otpArrival === v ? "inset 0 0 0 1.5px var(--accent-line)" : "inset 0 0 0 1px var(--line)",
                }}>{v}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Home layout</div>
            <div style={{ display: "flex", gap: 7 }}>
              {(["list", "grid"] as const).map(v => (
                <button key={v} onClick={() => setTweaks((t: any) => ({ ...t, homeLayout: v }))} className="btn" style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 600, textTransform: "capitalize",
                  background: tweaks.homeLayout === v ? "var(--accent-soft)" : "var(--surface-2)",
                  color: tweaks.homeLayout === v ? "var(--accent-bright)" : "var(--txt-3)",
                  boxShadow: tweaks.homeLayout === v ? "inset 0 0 0 1.5px var(--accent-line)" : "inset 0 0 0 1px var(--line)",
                }}>
                  <Icon name={v === "list" ? "server" : "grid"} size={14}/>{v}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Terminal scanlines</div>
              <div style={{ fontSize: 11.5, color: "var(--txt-3)", marginTop: 2 }}>Faint grid overlay on hero surfaces</div>
            </div>
            <button onClick={() => setTweaks((t: any) => ({ ...t, scanlines: !t.scanlines }))} style={{
              width: 46, height: 26, borderRadius: 999, border: "none", cursor: "pointer", padding: 3,
              background: tweaks.scanlines ? "var(--accent)" : "var(--surface-2)",
              boxShadow: tweaks.scanlines ? "0 0 12px -2px var(--accent-glow)" : "inset 0 0 0 1px var(--line-2)",
              transition: "background 0.2s, box-shadow 0.2s", display: "flex", alignItems: "center", flexShrink: 0,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 999, background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                transform: tweaks.scanlines ? "translateX(20px)" : "translateX(0)",
                transition: "transform 0.2s", display: "block",
              }}/>
            </button>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden", borderRadius: 16, marginTop: 14 }}>
          <Row icon="logout" label="Sign out" danger  onClick={async () => { await createClient().auth.signOut(); window.location.href = "/login"; }}/>
        </div>

        <div style={{ textAlign: "center", color: "var(--txt-3)", fontSize: 11, marginTop: 20 }} className="mono">smsvital · v2.4.0</div>
      </div>
    </div>
  );
}
