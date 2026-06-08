"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Primitives";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash — exchange it for a session
    import("@/lib/supabase").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
        else setError("Invalid or expired reset link. Please request a new one.");
      });
    });
  }, []);

  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthColor = ["", "var(--bad)", "var(--warn)", "var(--ok)", "var(--ok)"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) { setError(authError.message); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 500, height: 400, borderRadius: "50%", filter: "blur(80px)", background: "var(--accent-soft)", top: "-10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px -4px var(--accent-glow)" }}>
            <Icon name="bolt" size={19} stroke="#0a0612"/>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "var(--txt)" }}>smsvital</span>
        </Link>

        <div className="card" style={{ padding: "32px 28px", borderRadius: 22, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Set new password</h1>
          <p style={{ margin: "0 0 28px", color: "var(--txt-3)", fontSize: 14 }}>Choose a strong password for your account</p>

          {!ready && !error && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--txt-3)", fontSize: 14 }}>Verifying reset link…</div>
          )}

          {error && !ready && (
            <div style={{ padding: "14px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 14, color: "var(--bad)", marginBottom: 16 }}>
              {error}
              <div style={{ marginTop: 12 }}>
                <Link href="/forgot-password" style={{ color: "var(--bad)", fontWeight: 600 }}>Request a new link →</Link>
              </div>
            </div>
          )}

          {ready && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label className="eyebrow">New password</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 12 }}>
                  <Icon name="lock" size={17} stroke="var(--txt-3)"/>
                  <input
                    type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters" required autoComplete="new-password"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 15, fontFamily: "var(--sans)" }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--txt-3)", padding: 0, display: "flex" }}>
                    <Icon name="eye" size={16}/>
                  </button>
                </div>
                {password.length > 0 && (
                  <div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? strengthColor : "var(--line-2)", transition: "background .2s" }}/>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label className="eyebrow">Confirm password</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 12 }}>
                  <Icon name="lock" size={17} stroke="var(--txt-3)"/>
                  <input
                    type={showPw ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password" required autoComplete="new-password"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 15, fontFamily: "var(--sans)" }}
                  />
                  {confirm.length > 0 && (
                    <span style={{ color: confirm === password ? "var(--ok)" : "var(--bad)", display: "flex" }}>
                      <Icon name={confirm === password ? "check" : "x"} size={16}/>
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div style={{ padding: "11px 14px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 13.5, color: "var(--bad)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16, marginTop: 4 }}>
                {loading ? "Updating…" : "Set new password"}
                {!loading && <Icon name="chevR" size={17} stroke="#0a0612"/>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
