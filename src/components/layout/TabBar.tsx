"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Primitives";

function NavBtn({ icon, label, active, href }: { icon: string, label: string, active: boolean, href: string }) {
  return (
    <Link href={href} className="btn" style={{
      flex: 1, flexDirection: "column", gap: 3, background: "transparent",
      color: active ? "var(--accent-bright)" : "var(--txt-3)", padding: "8px 0 4px",
    }}>
      <Icon name={icon} size={22} sw={active ? 2 : 1.7}/>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
    </Link>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const getActiveTab = () => {
    if (pathname.startsWith("/dashboard/browse"))   return "browse";
    if (pathname.startsWith("/dashboard/orders"))   return "orders";
    if (pathname.startsWith("/dashboard/wallet"))   return "wallet";
    if (pathname.startsWith("/dashboard/settings")) return "settings";
    if (pathname === "/dashboard")                  return "home";
    return "";
  };
  const tab = getActiveTab();

  const items = [
    ["home",     "Home",    "home",   "/dashboard"],
    ["browse",   "Browse",  "grid",   "/dashboard/browse"],
    ["orders",   "Orders",  "clock",  "/dashboard/orders"],
    ["wallet",   "Wallet",  "wallet", "/dashboard/wallet"],
    ["settings", "Account", "user",   "/dashboard/settings"],
  ];

  return (
    <div className="dash-tabbar" style={{
      display: "flex", padding: "6px 10px 8px", gap: 4,
      background: "rgba(10,12,17,0.82)", backdropFilter: "blur(18px)",
      borderTop: "1px solid var(--line)",
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, zIndex: 50,
    }}>
      {items.map(([id, l, ic, href]) => (
        <NavBtn key={id} icon={ic} label={l} active={tab === id} href={href} />
      ))}
    </div>
  );
}
