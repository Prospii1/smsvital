"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, fmt, useToast } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";

function TopupSheet({ onClose, userEmail }: { onClose: () => void; userEmail: string | null }) {
  const [amt, setAmt] = useState(1000);
  const [loading, setLoading] = useState(false);
  const pushToast = useToast();
  const { setBalance, setTxns } = useApp();
  const presets = [500, 1000, 2500, 5000, 10000];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://payment-web-sdk.transactpay.ai/v1/checkout";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Get secure reference from server
      const initRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, email: userEmail ?? "" }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) {
        pushToast({ kind: "bad", msg: initData.error ?? "Failed to start payment" });
        setLoading(false);
        return;
      }

      const { reference } = initData;

      const CheckoutClass = (window as any).CheckoutNS?.PaymentCheckout;
      if (!CheckoutClass) {
        pushToast({ kind: "bad", msg: "Payment SDK not loaded — please refresh and try again" });
        setLoading(false);
        return;
      }

      const checkout = new CheckoutClass({
        apiKey: "PGW-PUBLICKEY-TEST-59A0662C23504AFCA30846B11D52E766",
        amount: amt,
        currency: "NGN",
        reference,
        email: userEmail ?? "",
        firstname: "Smsvital",
        lastname: "User",
        mobile: "00000000000",
        country: "NG",
        description: "Smsvital wallet top-up",
        RedirectUrl: `${window.location.origin}/payment/verify`,
        onCompleted: async (data: any) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tx_ref: data.reference ?? reference }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.ok) {
              setBalance(verifyData.newBalance);
              setTxns((ts: any[]) => [verifyData.txn, ...ts]);
              pushToast({ kind: "ok", msg: "Wallet topped up successfully!" });
              onClose();
            } else if (verifyData.error === "Payment already credited") {
              pushToast({ msg: "Payment already applied to your wallet" });
              onClose();
            } else {
              pushToast({ kind: "bad", msg: verifyData.error ?? "Verification failed — contact support" });
            }
          } catch {
            pushToast({ kind: "bad", msg: "Network error during verification" });
          } finally {
            setLoading(false);
          }
        },
        onClose: () => {
          setLoading(false);
        },
        onError: (_err: any) => {
          pushToast({ kind: "bad", msg: "Payment error — please try again" });
          setLoading(false);
        },
      });

      checkout.init();
    } catch {
      pushToast({ kind: "bad", msg: "Network error — please try again" });
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.55)",
      animation: "fadeIn .2s ease", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: "24px 24px 0 0",
        padding: "10px 20px 34px", boxShadow: "0 -20px 60px rgba(0,0,0,0.6)", animation: "sheetUp .3s cubic-bezier(.2,.9,.3,1)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--line-2)", margin: "4px auto 18px" }}/>
        <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 4 }}>Add funds</div>
        <div style={{ fontSize: 12.5, color: "var(--txt-3)", marginBottom: 16 }}>Pay via TransactPay · cards, bank transfer, USSD</div>
        <div className="mono" style={{ textAlign: "center", fontSize: 46, fontWeight: 700, margin: "8px 0 18px" }}>{fmt(amt)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 18 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setAmt(p)} className="btn" style={{ padding: "12px 0", borderRadius: 11, fontSize: 14, fontWeight: 700,
              background: amt === p ? "var(--accent-soft)" : "var(--surface-2)",
              color: amt === p ? "var(--accent-bright)" : "var(--txt-2)",
              boxShadow: amt === p ? "inset 0 0 0 1.5px var(--accent-line)" : "inset 0 0 0 1px var(--line)" }}>
              ₦{p.toLocaleString("en-NG")}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "11px 14px",
            background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line-2)", borderRadius: 12 }}>
            <span style={{ color: "var(--txt-3)", fontSize: 14, fontFamily: "var(--mono)" }}>₦</span>
            <input
              type="number" min={500} step={100} value={amt}
              onChange={e => setAmt(Math.max(500, Number(e.target.value)))}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--txt)", fontSize: 18, fontFamily: "var(--mono)", fontWeight: 700 }}
            />
          </div>
        </div>
        <button onClick={handlePay} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16 }}>
          {loading ? <><Icon name="refresh" size={16}/>Processing…</> : <><Icon name="lock" size={16}/>Pay {fmt(amt)} via TransactPay</>}
        </button>
        <div style={{ fontSize: 11.5, color: "var(--txt-3)", textAlign: "center", marginTop: 10 }}>
          Minimum ₦500 · Secured by TransactPay
        </div>
      </div>
    </div>
  );
}

export default function WalletScreen() {
  const { balance, txns, userEmail } = useApp();
  const pushToast = useToast();
  const [sheet, setSheet] = useState(false);

  return (
    <div className="screen-in" style={{ display: "flex", flexDirection: "column", paddingTop: 10 }}>
      <TopBar title="Wallet" />
      <div className="dash-narrow" style={{ padding: "0 18px 18px" }}>
        <div className="card tgrid" style={{ padding: "20px", borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(150deg, var(--accent-soft), var(--surface) 60%)",
          boxShadow: "inset 0 0 0 1px var(--accent-line)" }}>
          <div className="eyebrow" style={{ position: "relative", zIndex: 1 }}>Available balance</div>
          <div className="mono" style={{ position: "relative", zIndex: 1, fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", margin: "6px 0 16px" }}>{fmt(balance)}</div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 9 }}>
            <button onClick={() => setSheet(true)} className="btn btn-primary" style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 14.5 }}>
              <Icon name="plus" size={17}/>Add funds
            </button>
            <button onClick={() => pushToast({ msg: "Auto-reload coming soon" })} className="btn btn-ghost" style={{ padding: "12px 14px", borderRadius: 12, fontSize: 14 }}>
              <Icon name="bolt" size={16}/>Auto
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 2px 10px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-2)" }}>Transactions</span>
          <span style={{ fontSize: 11.5, color: "var(--txt-3)" }}>All time</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {txns.length === 0 && (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--txt-3)", fontSize: 13 }}>No transactions yet</div>
          )}
          {txns.map((tx: any) => {
            const pos = tx.amt >= 0;
            const ic  = tx.t === "topup" ? "plus" : tx.t === "refund" ? "refresh" : "sms";
            return (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: pos ? "var(--ok-soft)" : "var(--surface-2)", color: pos ? "var(--ok)" : "var(--txt-2)" }}>
                  <Icon name={ic} size={17}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.label}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--txt-3)", marginTop: 1 }}>{tx.ref} · {tx.when}</div>
                </div>
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: pos ? "var(--ok)" : "var(--txt)" }}>
                  {pos ? "+" : ""}{fmt(Math.abs(tx.amt))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {sheet && <TopupSheet onClose={() => setSheet(false)} userEmail={userEmail} />}
    </div>
  );
}
