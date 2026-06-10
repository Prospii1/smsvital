"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon, fmt } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";

function PaymentVerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setBalance, setTxns } = useApp();

  const [status, setStatus] = useState<"checking" | "success" | "failed" | "already">("checking");
  const [amount, setAmount] = useState(0);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const reference = params.get("reference");

    if (!reference) {
      setStatus("failed");
      setErrMsg("Payment reference missing.");
      return;
    }

    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx_ref: reference }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setBalance(d.newBalance);
          setTxns((ts: any[]) => [d.txn, ...ts]);
          setAmount(d.txn.amt);
          setStatus("success");
        } else if (d.error === "Payment already credited") {
          setStatus("already");
        } else {
          setErrMsg(d.error ?? "Verification failed");
          setStatus("failed");
        }
      })
      .catch(() => {
        setErrMsg("Network error during verification.");
        setStatus("failed");
      });
  }, [params, setBalance, setTxns]);

  return (
    <div className="card" style={{ padding: "36px 28px", borderRadius: 22, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
      {status === "checking" && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulse 1.4s ease infinite" }}>
            <Icon name="refresh" size={26} stroke="var(--accent-bright)"/>
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Verifying payment…</div>
          <div style={{ color: "var(--txt-3)", fontSize: 14 }}>Please wait while we confirm your payment</div>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--ok-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="check" size={26} stroke="var(--ok)"/>
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Payment successful!</div>
          <div style={{ color: "var(--txt-3)", fontSize: 14, marginBottom: 20 }}>
            {fmt(amount)} has been added to your wallet
          </div>
          <button onClick={() => router.push("/dashboard/wallet")} className="btn btn-primary" style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15 }}>
            Go to wallet <Icon name="chevR" size={16} stroke="#0a0612"/>
          </button>
        </>
      )}

      {status === "already" && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="check" size={26} stroke="var(--accent-bright)"/>
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Already credited</div>
          <div style={{ color: "var(--txt-3)", fontSize: 14, marginBottom: 20 }}>This payment was already added to your wallet.</div>
          <button onClick={() => router.push("/dashboard/wallet")} className="btn btn-primary" style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15 }}>
            Go to wallet <Icon name="chevR" size={16} stroke="#0a0612"/>
          </button>
        </>
      )}

      {status === "failed" && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--bad-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="x" size={26} stroke="var(--bad)"/>
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Payment failed</div>
          <div style={{ color: "var(--txt-3)", fontSize: 14, marginBottom: 20 }}>{errMsg || "Something went wrong. Please try again."}</div>
          <button onClick={() => router.push("/dashboard/wallet")} className="btn" style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)" }}>
            Back to wallet
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 36, justifyContent: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px -4px var(--accent-glow)" }}>
            <Icon name="bolt" size={19} stroke="#0a0612"/>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "var(--txt)" }}>smsvital</span>
        </Link>
        <Suspense fallback={
          <div className="card" style={{ padding: "36px 28px", borderRadius: 22, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
            <div style={{ color: "var(--txt-3)", fontSize: 14 }}>Loading…</div>
          </div>
        }>
          <PaymentVerifyInner />
        </Suspense>
      </div>
    </div>
  );
}
