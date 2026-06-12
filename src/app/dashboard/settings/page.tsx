"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, fmt, useToast } from "@/components/ui/Primitives";
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

function ChangePasswordSheet({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pushToast = useToast();

  const strength = (() => {
    if (next.length === 0) return 0;
    let s = 0;
    if (next.length >= 8) s++;
    if (/[A-Z]/.test(next)) s++;
    if (/[0-9]/.test(next)) s++;
    if (/[^a-zA-Z0-9]/.test(next)) s++;
    return s;
  })();
  const strengthColor = ["", "var(--bad)", "var(--warn)", "var(--ok)", "var(--ok)"][strength];

  const handleSave = async () => {
    setError("");
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      // Re-authenticate with current password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setError("Could not verify session."); return; }
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (signInErr) { setError("Current password is incorrect."); return; }
      const { error: updateErr } = await supabase.auth.updateUser({ password: next });
      if (updateErr) { setError(updateErr.message); return; }
      pushToast({ kind: "ok", msg: "Password updated successfully" });
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBox = { display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 12 } as const;
  const inputStyle = { flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 15, fontFamily: "var(--sans)" } as const;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "10px 20px 34px", boxShadow: "0 -20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--line-2)", margin: "4px auto 18px" }}/>
        <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 4 }}>Change password</div>
        <div style={{ fontSize: 12.5, color: "var(--txt-3)", marginBottom: 20 }}>Enter your current password, then choose a new one</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Current password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="eyebrow">Current password</label>
            <div style={inputBox}>
              <Icon name="lock" size={17} stroke="var(--txt-3)"/>
              <input type={showPw ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
                placeholder="Your current password" autoComplete="current-password" style={inputStyle}/>
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--txt-3)", padding: 0, display: "flex" }}>
                <Icon name="eye" size={16}/>
              </button>
            </div>
          </div>

          {/* New password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="eyebrow">New password</label>
            <div style={inputBox}>
              <Icon name="lock" size={17} stroke="var(--txt-3)"/>
              <input type={showPw ? "text" : "password"} value={next} onChange={e => setNext(e.target.value)}
                placeholder="Min 8 characters" autoComplete="new-password" style={inputStyle}/>
            </div>
            {next.length > 0 && (
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? strengthColor : "var(--line-2)", transition: "background .2s" }}/>
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="eyebrow">Confirm new password</label>
            <div style={inputBox}>
              <Icon name="lock" size={17} stroke="var(--txt-3)"/>
              <input type={showPw ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter new password" autoComplete="new-password" style={inputStyle}/>
              {confirm.length > 0 && (
                <span style={{ color: confirm === next ? "var(--ok)" : "var(--bad)", display: "flex" }}>
                  <Icon name={confirm === next ? "check" : "x"} size={16}/>
                </span>
              )}
            </div>
          </div>

          {error && (
            <div style={{ padding: "11px 14px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 13.5, color: "var(--bad)" }}>
              {error}
            </div>
          )}

          <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16, marginTop: 4 }}>
            {loading ? "Updating…" : "Update password"}
            {!loading && <Icon name="chevR" size={17} stroke="#0a0612"/>}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditNameSheet({ onClose }: { onClose: () => void }) {
  const { firstname, lastname, setName } = useApp();
  const [fn, setFn] = useState(firstname);
  const [ln, setLn] = useState(lastname);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pushToast = useToast();

  const handleSave = async () => {
    if (!fn.trim()) { setError("First name is required."); return; }
    setError("");
    setLoading(true);
    try {
      setName(fn.trim(), ln.trim());
      pushToast({ kind: "ok", msg: "Name updated" });
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBox = { display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 12 } as const;
  const inputStyle = { flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 15, fontFamily: "var(--sans)" } as const;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "10px 20px 34px", boxShadow: "0 -20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--line-2)", margin: "4px auto 18px" }}/>
        <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 4 }}>Your name</div>
        <div style={{ fontSize: 12.5, color: "var(--txt-3)", marginBottom: 20 }}>Used to pre-fill the payment form so you don&apos;t have to type it each time</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="eyebrow">First name</label>
            <div style={inputBox}>
              <Icon name="user" size={17} stroke="var(--txt-3)"/>
              <input type="text" value={fn} onChange={e => setFn(e.target.value)}
                placeholder="e.g. Emeka" autoComplete="given-name" style={inputStyle}/>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label className="eyebrow">Last name</label>
            <div style={inputBox}>
              <Icon name="user" size={17} stroke="var(--txt-3)"/>
              <input type="text" value={ln} onChange={e => setLn(e.target.value)}
                placeholder="e.g. Obi" autoComplete="family-name" style={inputStyle}/>
            </div>
          </div>

          {error && (
            <div style={{ padding: "11px 14px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 13.5, color: "var(--bad)" }}>
              {error}
            </div>
          )}

          <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16, marginTop: 4 }}>
            {loading ? "Saving…" : "Save name"}
            {!loading && <Icon name="chevR" size={17} stroke="#0a0612"/>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsScreen() {
  const { balance, tweaks, setTweaks, orders, userEmail, userJoinedAt, firstname, lastname } = useApp();
  const router = useRouter();
  const [pwSheet, setPwSheet] = useState(false);
  const [nameSheet, setNameSheet] = useState(false);

  return (
    <div className="screen-in" style={{ display: "flex", flexDirection: "column", paddingTop: 10 }}>
      <TopBar title="Account" />
      <div className="dash-narrow" style={{ padding: "0 18px 18px" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px", borderRadius: 16, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px var(--accent-line)", flexShrink: 0 }}>
            {firstname ? (
              <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18, color: "var(--accent-bright)" }}>
                {firstname[0].toUpperCase()}{lastname ? lastname[0].toUpperCase() : ""}
              </span>
            ) : (
              <Icon name="user" size={24} stroke="var(--accent-bright)"/>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15.5 }}>
              {firstname ? `${firstname}${lastname ? " " + lastname : ""}` : maskEmail(userEmail)}
            </div>
            <div style={{ fontSize: 12, color: "var(--txt-3)", marginTop: 2 }}>
              {firstname && <span style={{ marginRight: 6 }}>{maskEmail(userEmail)} · </span>}
              Member since {fmtJoined(userJoinedAt)} · {orders.length} orders
            </div>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden", borderRadius: 16 }}>
          <Row icon="wallet" label="Wallet & billing" val={fmt(balance)} onClick={() => router.push("/dashboard/wallet")}/>
          <Row icon="user" label="Full name" val={firstname ? `${firstname}${lastname ? " " + lastname : ""}` : "Not set"} onClick={() => setNameSheet(true)}/>
          <Row icon="lock" label="Change password" onClick={() => setPwSheet(true)}/>
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
          <Row icon="logout" label="Sign out" danger onClick={async () => { await createClient().auth.signOut(); window.location.href = "/login"; }}/>
        </div>

        <div style={{ textAlign: "center", color: "var(--txt-3)", fontSize: 11, marginTop: 20 }} className="mono">smsvital · v2.4.0</div>
      </div>

      {pwSheet && <ChangePasswordSheet onClose={() => setPwSheet(false)} />}
      {nameSheet && <EditNameSheet onClose={() => setNameSheet(false)} />}
    </div>
  );
}
