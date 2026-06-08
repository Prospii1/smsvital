"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Primitives";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const baseUrl = window.location.origin;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });
      if (authError) { setError(authError.message); return; }
      setSent(true);
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
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px -4px var(--accent-glow)" }}>
            <Icon name="bolt" size={19} stroke="#0a0612"/>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "var(--txt)" }}>smsvital</span>
        </Link>

        <div className="card" style={{ padding: "32px 28px", borderRadius: 22, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
          {sent ? (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: "var(--ok-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Icon name="check" size={24} stroke="var(--ok)"/>
              </div>
              <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Check your email</h1>
              <p style={{ margin: "0 0 24px", color: "var(--txt-3)", fontSize: 14, lineHeight: 1.6 }}>
                We sent a password reset link to <strong style={{ color: "var(--txt)" }}>{email}</strong>. Click the link in the email to reset your password.
              </p>
              <Link href="/login" style={{ display: "block", textAlign: "center", color: "var(--accent-bright)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Reset password</h1>
              <p style={{ margin: "0 0 28px", color: "var(--txt-3)", fontSize: 14 }}>Enter your email and we'll send you a reset link</p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

                {error && (
                  <div style={{ padding: "11px 14px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid rgba(251,111,132,0.3)", fontSize: 13.5, color: "var(--bad)" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16, marginTop: 4 }}>
                  {loading ? "Sending…" : "Send reset link"}
                  {!loading && <Icon name="chevR" size={17} stroke="#0a0612"/>}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "var(--txt-3)" }}>
                Remember it?{" "}
                <Link href="/login" style={{ color: "var(--accent-bright)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
