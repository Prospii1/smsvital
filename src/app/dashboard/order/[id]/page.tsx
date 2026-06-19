"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, Monogram, CountdownRing, useToast } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";
import { svcById, ccById, genOtp } from "@/lib/data";
import { createClient } from "@/lib/supabase";

function OtpReveal({ code, style, copied, onCopy }: any) {
  const codeStr = typeof code === "string" ? code : String(code ?? "");
  const digits = codeStr.split("");
  const [shown, setShown] = useState(style === "type" ? 0 : digits.length);
  useEffect(() => {
    if (style !== "type") return;
    let i = 0; const t = setInterval(() => { i++; setShown(i); if (i >= digits.length) clearInterval(t); }, 110);
    return () => clearInterval(t);
  }, [style, digits.length]);
  return (
    <div onClick={onCopy} className="card focusable" style={{ padding: "16px 14px", borderRadius: 16, cursor: "pointer",
      background: "linear-gradient(180deg, var(--accent-soft), var(--surface))",
      boxShadow: "inset 0 0 0 1.5px var(--accent-line), 0 0 30px -8px var(--accent-glow)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="eyebrow" style={{ color: "var(--accent-bright)" }}>Verification code</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5,
          color: copied ? "var(--ok)" : "var(--accent-bright)", fontWeight: 600 }}>
          <Icon name={copied ? "check" : "copy"} size={14}/>{copied ? "Copied" : "Tap to copy"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {digits.map((d: string, i: number) => (
          <span key={i} className="mono" style={{
            flex: 1, textAlign: "center", fontSize: 34, fontWeight: 700, color: "var(--txt)",
            padding: "8px 0", borderRadius: 10, background: "rgba(0,0,0,0.25)",
            boxShadow: "inset 0 0 0 1px var(--line)",
            opacity: i < shown ? 1 : 0,
            animation: i < shown ? `${style === "flip" ? "flipin" : "popglow"} .5s cubic-bezier(.2,.9,.3,1.2) both` : "none",
            animationDelay: `${i * 0.07}s`, transformOrigin: "center",
          }}>{i < shown ? d : ""}</span>
        ))}
      </div>
    </div>
  );
}

export default function LiveOrderScreen() {
  const { id } = useParams();
  const router = useRouter();
  const { orders, setOrders, setBalance, setTxns, tweaks, services } = useApp();
  const pushToast = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderFromStore = orders.find((o: any) => o.id === id);

  useEffect(() => {
    if (orderFromStore) {
      setOrder(orderFromStore);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function load(attempt = 0) {
      const { data } = await supabase.from("orders").select("data, created_at").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (data) {
        setOrder({ ...data.data, created_at: data.created_at });
        setLoading(false);
        return;
      }
      // Empty result can mean replication lag right after order creation — retry briefly before giving up.
      if (attempt < 2) {
        setTimeout(() => load(attempt + 1), 600 * (attempt + 1));
        return;
      }
      setLoading(false);
    }
    load();

    return () => { cancelled = true; };
  }, [id, orderFromStore]);

  // Fall back to a placeholder if the catalog hasn't resolved this code yet
  // (e.g. Providers' live-catalog fetch is still in flight) — the order itself
  // is valid, so we still show the number/countdown rather than "Order not
  // found"; the real name/icon appears moments later once services updates.
  const svc = order ? (svcById(order.svc, services) ?? { name: order.svc, c: "var(--txt-3)", logoUrl: undefined }) : null;
  const cc = order ? (ccById(order.cc) ?? { name: String(order.cc ?? "").toUpperCase(), id: order.cc }) : null;

  const isDemo = order ? !order.smspvaOrderId : false;
  const TOTAL = order?.expires ?? 600;
  const DEMO_ARRIVAL = 7;

  const [phase, setPhase] = useState("waiting");
  const [secs, setSecs] = useState(0);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync state values when order loads/updates
  useEffect(() => {
    if (!order) return;
    setPhase(order.status || "waiting");
    setCode(order.code || null);
    const elapsed = Math.floor((Date.now() - new Date(order.created_at || Date.now()).getTime()) / 1000);
    setSecs(Math.max(0, elapsed));
  }, [order]);

  // Seconds ticker
  useEffect(() => {
    if (!order || phase === "received" || phase === "expired" || phase === "cancelled") return;
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(order.created_at || Date.now()).getTime()) / 1000);
      setSecs(Math.max(0, elapsed));
    }, 1000);
    return () => clearInterval(t);
  }, [order, phase]);

  // Demo mode: simulate OTP arrival at 7 seconds
  useEffect(() => {
    if (!isDemo || secs !== DEMO_ARRIVAL || phase !== "waiting") return;
    const otp = genOtp();
    setCode(otp);
    setPhase("received");
    setOrders((os: any[]) => os.map(o => o.id === id ? { ...o, status: "received", code: otp } : o));
    pushToast({ kind: "ok", icon: "sms", msg: `Code received — ${otp}` });
    if (navigator.vibrate) navigator.vibrate(40);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs]);

  // Real mode: poll SMSPVA every 4.5s. The poll route also checks this order's
  // own expiry server-side and refunds automatically — this is the primary
  // timeout path (works the instant the countdown ends, doesn't depend on
  // hitting an exact client-side second).
  useEffect(() => {
    if (isDemo || phase !== "waiting" || !order?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sms/poll/${order.id}`);
        const data = await res.json();

        if (res.status === 200 && data.sms) {
          const match = String(data.sms ?? '').match(/\b\d{4,8}\b/);
          const otp = match ? match[0] : String(data.sms ?? '');
          clearInterval(interval);
          setCode(otp);
          setPhase("received");
          setOrders((os: any[]) => os.map(o => o.id === id ? { ...o, status: "received", code: otp } : o));
          pushToast({ kind: "ok", icon: "sms", msg: `Code received — ${otp}` });
          if (navigator.vibrate) navigator.vibrate(40);
          return;
        }

        if (data.expired) {
          clearInterval(interval);
          setPhase("expired");
          setOrders((os: any[]) => os.map(o => o.id === id ? { ...o, status: "expired" } : o));
          if (data.newBalance !== undefined) {
            setBalance(data.newBalance);
            setTxns((ts: any[]) => [data.txn, ...ts]);
          }
          pushToast({ kind: "bad", msg: "Order timed out — refunded automatically" });
          router.push("/dashboard/orders");
        }
        // 202 = still waiting
      } catch {
        // network hiccup, keep polling
      }
    }, 4500);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, phase, isDemo]);

  // Fallback safety net: if for some reason the poll above never fired the
  // expiry branch (e.g. poll requests were failing), force a ban+refund once
  // we're well past the window. The poll route is idempotent so this is safe
  // even if it races with the server-side check.
  useEffect(() => {
    if (isDemo || phase !== "waiting" || secs < (TOTAL + 15) || !order?.id) return;
    setPhase("expired");
    setOrders((os: any[]) => os.map(o => o.id === id ? { ...o, status: "expired" } : o));
    pushToast({ kind: "bad", msg: "Order timed out — number banned, refunding…" });
    fetch(`/api/sms/ban/${order.id}`, { method: "DELETE" })
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setBalance(d.newBalance);
          setTxns((ts: any[]) => [d.txn, ...ts]);
        }
      })
      .catch(() => {});
    router.push("/dashboard/orders");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs]);

  if (loading) {
    return (
      <div className="screen-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <Icon name="refresh" className="spin" size={28} />
      </div>
    );
  }

  // svc/cc always resolve to at least a placeholder once order is set (see above),
  // so reaching here with no order means it genuinely doesn't exist or isn't ours.
  if (!order) return <div style={{ padding: 20 }}>Order not found</div>;

  const remaining = Math.max(0, TOTAL - secs);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = phase === "received" ? 1 : Math.min(1, secs / TOTAL);

  const copy = () => {
    setCopied(true); pushToast({ kind: "ok", msg: "Code copied to clipboard" });
    try { navigator.clipboard?.writeText(code as string); } catch (e) {}
    setTimeout(() => setCopied(false), 1600);
  };

  const cancel = async () => {
    if (isDemo) {
      setOrders((os: any[]) => os.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
      setBalance((b: number) => Math.round((b + order.price) * 100) / 100);
      pushToast({ kind: "bad", icon: "x", msg: "Order cancelled · refunded" });
      router.push("/dashboard/orders");
      return;
    }
    try {
      const res = await fetch(`/api/sms/cancel/${order.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setOrders((os: any[]) => os.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
        setBalance(data.newBalance);
        setTxns((ts: any[]) => [data.txn, ...ts]);
        pushToast({ kind: "bad", icon: "x", msg: "Order cancelled · refunded" });
      } else {
        pushToast({ kind: "bad", msg: data.error ?? "Cancel failed — contact support" });
      }
    } catch {
      pushToast({ kind: "bad", msg: "Network error — please try again" });
      return;
    }
    router.push("/dashboard/orders");
  };

  const requestAnother = () => {
    setPhase("waiting");
    setSecs(0);
    setCode(null);
    pushToast({ msg: isDemo ? "Requesting another SMS…" : "Waiting for another SMS…" });
  };

  return (
    <div className="screen-in tgrid" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", paddingTop: 10 }}>
      <TopBar back />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", padding: "4px 22px", overflowY: "auto" }} className="noscroll">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <Monogram svc={svc} size={40}/>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{svc.name}</div>
            <div style={{ fontSize: 12, color: "var(--txt-3)" }}>{cc!.name} · {order.id}</div>
          </div>
        </div>

        <CountdownRing progress={progress} size={172}
          color={phase === "received" ? "var(--ok)" : "var(--accent)"}
          label={
            phase === "waiting"
              ? <><span className="mono" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.02em" }}>{mm}:{ss}</span></>
              : phase === "received"
                ? <Icon name="check" size={46} stroke="var(--ok)" sw={2.4}/>
                : <Icon name="x" size={46} stroke="var(--txt-3)" sw={2.4}/>
          }
          sub={
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase",
              color: phase === "received" ? "var(--ok)" : "var(--txt-3)", marginTop: 6 }}>
              {phase === "waiting" ? "awaiting sms" : phase === "received" ? "code received" : "code not received"}
            </span>
          }/>

        <div style={{ marginTop: 22, width: "100%" }}>
          <div className="eyebrow" style={{ textAlign: "center", marginBottom: 8 }}>Your temporary number</div>
          <div onClick={() => { navigator.clipboard?.writeText(order.number); pushToast({ msg: "Number copied" }); }}
            className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "14px", borderRadius: 14, cursor: "pointer", background: "var(--surface-2)" }}>
            {(() => {
              // Look up dial directly from order.cc — bypasses the cc fallback object which has no dial field
              const resolvedCc = order?.cc ? ccById(order.cc) : null;
              const dial = resolvedCc?.dial ?? (cc as any)?.dial ?? "";
              const dialDigits = dial.replace("+", "");
              const digitsOnly = (order.number ?? "").replace(/\D/g, "");
              const localNum = dialDigits && digitsOnly.startsWith(dialDigits)
                ? digitsOnly.slice(dialDigits.length)
                : digitsOnly || (order.number ?? "");
              return (
                <>
                  {dial ? (
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-bright)",
                      background: "var(--accent-soft)", padding: "4px 9px", borderRadius: 999,
                      boxShadow: "inset 0 0 0 1px var(--accent-line)" }}>{dial}</span>
                  ) : null}
                  <span className="mono" style={{ fontSize: 21, fontWeight: 600, letterSpacing: "0.03em" }}>{localNum}</span>
                </>
              );
            })()}
            <Icon name="copy" size={17} stroke="var(--txt-3)"/>
          </div>
        </div>

        <div style={{ marginTop: 14, width: "100%" }}>
          {phase === "waiting" ? (
            <div className="card" style={{ padding: "18px", borderRadius: 16, background: "var(--surface)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 78 }}>
              <div style={{ display: "flex", gap: 7 }}>
                {[0, 1, 2].map(i => (<span key={i} className="skel" style={{ width: 34, height: 44, borderRadius: 8, animationDelay: `${i * 0.15}s` }}/>))}
                <span style={{ width: 8 }}/>
                {[0, 1, 2].map(i => (<span key={i} className="skel" style={{ width: 34, height: 44, borderRadius: 8, animationDelay: `${(i + 3) * 0.15}s` }}/>))}
              </div>
            </div>
          ) : (
            code && <OtpReveal code={code} style={tweaks.otpArrival} copied={copied} onCopy={copy}/>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 20, width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
          {phase === "received" ? (
            <>
              <button onClick={() => router.push("/dashboard/orders")} className="btn btn-primary"
                style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 15.5 }}>Done</button>
              <button onClick={requestAnother} className="btn btn-ghost"
                style={{ width: "100%", padding: "13px", borderRadius: 13, fontSize: 14 }}>
                <Icon name="refresh" size={16}/>Request another SMS
              </button>
            </>
          ) : phase === "expired" ? (
            <>
              <div style={{ textAlign: "center", color: "var(--txt-3)", fontSize: 12.5, marginBottom: 4 }}>
                No code arrived in time — you&apos;ve been refunded
              </div>
              <button onClick={() => router.push("/dashboard/orders")} className="btn btn-ghost"
                style={{ width: "100%", padding: "13px", borderRadius: 13, fontSize: 14 }}>
                Back to orders
              </button>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "var(--txt-3)", fontSize: 12.5 }}>
                <span className="live-dot"/> Listening for incoming SMS…
              </div>
              <button onClick={cancel} className="btn"
                style={{ width: "100%", padding: "13px", borderRadius: 13, fontSize: 14,
                  background: "transparent", color: "var(--txt-3)", boxShadow: "inset 0 0 0 1px var(--line)" }}>
                Cancel & refund
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
