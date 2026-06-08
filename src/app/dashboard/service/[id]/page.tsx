"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Icon, Monogram, CC, fmt, fmtBig, useToast } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";
import { svcById, ccById, COUNTRIES, priceFor, availFor } from "@/lib/data";

export default function ConfigScreen() {
  const { id } = useParams();
  const router = useRouter();
  const { balance, setBalance, setOrders, setTxns, services } = useApp();
  const pushToast = useToast();

  const [ccId, setCcId] = useState("us");
  const [q, setQ] = useState("");
  const [buying, setBuying] = useState(false);
  const [catalog, setCatalog] = useState<any>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch("/api/sms/catalog").then(r => r.json()).then(setCatalog).catch(() => {});
  }, []);

  const svc = svcById(id as string, services);

  // Fetch real availability counts once svc is known
  useEffect(() => {
    if (!svc) return;
    setCounts(null);
    fetch(`/api/sms/count/${(svc as any).smspvaCode}`)
      .then(r => r.json()).then(setCounts).catch(() => setCounts({}));
  }, [(svc as any)?.smspvaCode]);

  if (!svc) return <div style={{ padding: 20 }}>Service not found</div>;

  const cc = ccById(ccId);

  function liveEntry(svcCode: string, ccCode: string) {
    return catalog?.prices?.[`${svcCode}_${ccCode}`];
  }

  const entry = liveEntry((svc as any).smspvaCode, cc?.smspvaCode ?? "");
  const price = entry?.price ?? priceFor(svc, cc);
  const realAvail = counts !== null ? (counts[cc?.smspvaCode ?? ""] ?? -1) : null;
  const canPay = balance >= price && realAvail !== 0;
  const list = COUNTRIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  const buy = async () => {
    if (!cc) return;
    setBuying(true);
    try {
      const res = await fetch("/api/sms/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: cc.smspvaCode.toUpperCase(), service: (svc as any).smspvaCode, expectedPrice: price }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        const msg =
          data.statusCode === 402 ? "Insufficient balance — please top up your wallet"
          : data.statusCode === 407 ? "Insufficient service balance — contact support"
          : data.statusCode === 409 ? "Price changed — please try again"
          : data.statusCode === 501 || data.statusCode === 502 ? "No numbers available right now"
          : data.statusCode === 503 ? "Server busy, please try again"
          : data.error || "Failed to get number";
        pushToast({ kind: "bad", msg });
        setBuying(false);
        return;
      }

      // Server handled deduction + DB writes — just update local state from response
      setBalance(data.newBalance);
      setOrders((os: any[]) => [data.order, ...os]);
      setTxns((ts: any[]) => [data.txn, ...ts]);
      router.push(`/dashboard/order/${data.orderId}`);
    } catch {
      pushToast({ kind: "bad", msg: "Network error, please try again" });
      setBuying(false);
    }
  };

  return (
    <div className="screen-in" style={{ height: "100%", display: "flex", flexDirection: "column", paddingTop: 10 }}>
      <TopBar back />
      <div style={{ padding: "0 18px 10px", display: "flex", alignItems: "center", gap: 13 }}>
        <Monogram svc={svc} size={52}/>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }}>{svc.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--txt-3)" }}>One-time SMS verification</div>
        </div>
      </div>

      <div style={{ padding: "4px 18px 8px" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Choose a country</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
          background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line)", borderRadius: 12, marginBottom: 10 }}>
          <Icon name="search" size={16} stroke="var(--txt-3)"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter countries…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--txt)", fontSize: 14, fontFamily: "var(--sans)" }}/>
        </div>
      </div>

      <div className="noscroll" style={{ flex: 1, overflowY: "auto", padding: "0 18px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {list.map((c: any) => {
            const e = liveEntry((svc as any).smspvaCode, c.smspvaCode);
            const cp = e?.price ?? priceFor(svc, c);
            // Use real count from SMSPVA if available; -1 means API returned no data
            const realCount = counts !== null ? (counts[c.smspvaCode] ?? -1) : null;
            const sel = c.id === ccId;
            const noStock = realCount === 0;
            const lowStock = realCount !== null && realCount > 0 && realCount < 500;
            return (
              <button key={c.id} onClick={() => setCcId(c.id)} disabled={noStock}
                className="btn focusable" style={{
                  justifyContent: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 13,
                  color: noStock ? "var(--txt-3)" : "var(--txt)",
                  background: sel ? "var(--accent-soft)" : "var(--surface)",
                  boxShadow: sel ? "inset 0 0 0 1.5px var(--accent-line)" : "inset 0 0 0 1px var(--line)",
                  opacity: noStock ? 0.45 : 1,
                }}>
                <CC cc={c} size={38}/>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 11, marginTop: 1,
                    color: noStock ? "var(--bad)" : lowStock ? "var(--warn)" : "var(--txt-3)" }}>
                    {counts === null
                      ? <span className="skel" style={{ width: 60, height: 11, display: "inline-block", borderRadius: 4 }}/>
                      : realCount === -1
                        ? "Availability unknown"
                        : noStock
                          ? "Out of stock"
                          : lowStock
                            ? `Low stock · ${fmtBig(realCount!)}`
                            : `${fmtBig(realCount!)} available`}
                  </div>
                </div>
                {catalog
                  ? <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: sel ? "var(--accent-bright)" : "var(--txt-2)" }}>{fmt(cp)}</span>
                  : <span className="skel" style={{ width: 38, height: 16, borderRadius: 4 }}/>
                }
              </button>
            );
          })}
        </div>
        <div style={{ height: 160 }}/>
      </div>

      {/* sticky buy bar */}
      <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480,
        bottom: 0, padding: "14px 18px 30px",
        background: "linear-gradient(transparent, var(--bg) 26%)", zIndex: 60 }}>
        <div className="card" style={{ padding: 14, borderRadius: 16, background: "var(--surface-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11.5, color: "var(--txt-3)" }}>{svc.name} · {cc?.name}</div>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 1 }}>{fmt(price)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="chip" style={{ background: "var(--surface)" }}>
                <span className="live-dot"/>
                {realAvail === null
                  ? <span className="skel" style={{ width: 32, height: 12, display: "inline-block", borderRadius: 3 }}/>
                  : realAvail === -1 ? "live" : fmtBig(realAvail) + " live"}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--txt-3)", marginTop: 6 }}>Refunded if no SMS</div>
            </div>
          </div>
          <button disabled={!canPay || buying} onClick={buy} className="btn btn-primary focusable"
            style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: 16 }}>
            {buying
              ? <><Icon name="refresh" size={16}/>Getting number…</>
              : canPay ? <>Buy number · {fmt(price)}</> : "Insufficient balance"
            }
          </button>
          {!canPay && (
            <button onClick={() => router.push("/dashboard/wallet")} className="btn"
              style={{ width: "100%", marginTop: 8, background: "transparent", color: "var(--accent-bright)", fontSize: 13 }}>
              Top up wallet<Icon name="chevR" size={15}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
