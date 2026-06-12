"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Primitives";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "var(--bad)", "var(--warn)", "var(--ok)", "var(--ok)"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("Please accept the terms to continue."); return; }
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) { setError(authError.message); return; }
      if (data.session) {
        window.location.href = data.session.user.app_metadata?.is_admin ? "/admin" : "/dashboard";
      } else {
        setError("Check your email to confirm your account, then sign in.");
      }
    } catch {
      setError("Sign-up failed. Please try again.");
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
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Create account</h1>
          <p style={{ margin: "0 0 28px", color: "var(--txt-3)", fontSize: 14 }}>Join Smsvital — free to sign up, pay only for numbers</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label className="eyebrow">Email</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 12 }}>
                <Icon name="user" size={17} stroke="var(--txt-3)"/>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com" required autoComplete="email"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 15, fontFamily: "var(--sans)" }}
                />
              </div>
            </div>

            {/* password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label className="eyebrow">Password</label>
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
              {/* strength bar */}
              {password.length > 0 && (
                <div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? strengthColor : "var(--line-2)", transition: "background .2s" }}/>
                    ))}
                  </div>
                  <span style={{ fontSize: 11.5, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* confirm */}
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

            {/* terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--txt-3)", lineHeight: 1.5 }}>
              <div onClick={() => setAgreed(!agreed)} style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                background: agreed ? "var(--accent)" : "var(--surface-2)",
                boxShadow: agreed ? "none" : "inset 0 0 0 1.5px var(--line-2)",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s",
              }}>
                {agreed && <Icon name="check" size={12} stroke="#0a0612" sw={2.5}/>}
              </div>
              I agree to the{" "}
              <Link href="/terms" style={{ color: "var(--accent-bright)", textDecoration: "none" }}>Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" style={{ color: "var(--accent-bright)", textDecoration: "none" }}>Privacy Policy</Link>
            </label>

            {error && (
              <div style={{ padding: "11px 14px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 13.5, color: "var(--bad)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16, marginTop: 4 }}>
              {loading ? "Creating account…" : "Create account"}
              {!loading && <Icon name="chevR" size={17} stroke="#0a0612"/>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "var(--txt-3)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent-bright)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
