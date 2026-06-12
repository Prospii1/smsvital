"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Primitives";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); return; }
      window.location.href = data.user?.app_metadata?.is_admin ? "/admin" : "/dashboard";
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* ambient glow */}
      <div style={{ position: "absolute", width: 500, height: 400, borderRadius: "50%", filter: "blur(80px)", background: "var(--accent-soft)", top: "-10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px -4px var(--accent-glow)" }}>
            <Icon name="bolt" size={19} stroke="#0a0612"/>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "var(--txt)" }}>smsvital</span>
        </Link>

        <div className="card" style={{ padding: "32px 28px", borderRadius: 22, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Welcome back</h1>
          <p style={{ margin: "0 0 28px", color: "var(--txt-3)", fontSize: 14 }}>Sign in to your Smsvital account</p>

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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="eyebrow">Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--accent-bright)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 12 }}>
                <Icon name="lock" size={17} stroke="var(--txt-3)"/>
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--txt)", fontSize: 15, fontFamily: "var(--sans)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--txt-3)", padding: 0, display: "flex" }}>
                  <Icon name="eye" size={16}/>
                </button>
              </div>
            </div>

            {/* error */}
            {error && (
              <div style={{ padding: "11px 14px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 13.5, color: "var(--bad)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16, marginTop: 4 }}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <Icon name="chevR" size={17} stroke="#0a0612"/>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "var(--txt-3)" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--accent-bright)", fontWeight: 600, textDecoration: "none" }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
