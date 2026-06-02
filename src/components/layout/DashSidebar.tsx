"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, fmt } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";

const NAV = [
  ["home",     "Home",    "home",   "/dashboard"],
  ["browse",   "Browse",  "grid",   "/dashboard/browse"],
  ["orders",   "Orders",  "clock",  "/dashboard/orders"],
  ["wallet",   "Wallet",  "wallet", "/dashboard/wallet"],
  ["settings", "Account", "user",   "/dashboard/settings"],
] as const;

function activeTab(pathname: string) {
  if (pathname.startsWith("/dashboard/browse"))                                    return "browse";
  if (pathname.startsWith("/dashboard/orders") || pathname.startsWith("/dashboard/order/")) return "orders";
  if (pathname.startsWith("/dashboard/wallet"))                                    return "wallet";
  if (pathname.startsWith("/dashboard/settings"))                                  return "settings";
  return "home";
}

export function DashSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { balance } = useApp();
  const tab = activeTab(pathname);

  return (
    <aside className="dash-sidebar">
      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 18px -3px var(--accent-glow)" }}>
            <Icon name="bolt" size={18} stroke="#0a0612"/>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 17,
            letterSpacing: "-0.02em", color: "var(--txt)" }}>smsvital</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav style={{ padding: "14px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(([id, label, icon, href]) => {
          const active = tab === id;
          return (
            <Link key={id} href={href} style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 10px 10px 10px", borderRadius: 10, textDecoration: "none",
              background: active ? "var(--surface-2)" : "transparent",
              borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
              paddingLeft: active ? 10 : 10,
              color: active ? "var(--txt)" : "var(--txt-2)",
              fontWeight: active ? 600 : 500, fontSize: 14,
              transition: "background .12s, color .12s, border-color .12s",
            }}>
              <Icon name={icon} size={18} sw={active ? 2 : 1.7} stroke={active ? "var(--accent)" : "currentColor"}/>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Balance chip */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid var(--line)" }}>
        <button onClick={() => router.push("/dashboard/wallet")} className="btn" style={{
          width: "100%", justifyContent: "space-between",
          background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line)",
          borderRadius: 10, padding: "10px 14px", color: "var(--txt)",
        }}>
          <span style={{ fontSize: 12.5, color: "var(--txt-3)", fontWeight: 500 }}>Balance</span>
          <span className="mono" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--accent-bright)" }}>
            {fmt(balance)}
          </span>
        </button>
      </div>
    </aside>
  );
}
