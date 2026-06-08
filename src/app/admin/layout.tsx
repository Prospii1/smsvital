"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Primitives";

const NAV = [
  { href: "/admin",        label: "Overview",     icon: "chart"  },
  { href: "/admin/orders", label: "Orders",       icon: "clock"  },
  { href: "/admin/users",  label: "Users",        icon: "users"  },
  { href: "/admin/wallet", label: "Transactions", icon: "wallet" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/check")
      .then(r => {
        if (r.status === 401) { router.replace("/login"); return; }
        if (r.status === 403) { router.replace("/dashboard"); return; }
        setChecking(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex",
        alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px -4px var(--accent-glow)", animation: "pulse 1.4s ease infinite" }}>
            <Icon name="bolt" size={20} stroke="#0a0612"/>
          </div>
          <span style={{ fontSize: 13, color: "var(--txt-3)", fontFamily: "var(--mono)" }}>Verifying access…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      {/* sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, borderRight: "1px solid var(--line)",
        padding: "0 0 24px", display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }} className="admin-sidebar">
        {/* logo */}
        <div style={{ padding: "20px 20px 8px", borderBottom: "1px solid var(--line)", marginBottom: 8 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px -3px var(--accent-glow)" }}>
              <Icon name="bolt" size={16} stroke="#0a0612"/>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15, color: "var(--txt)", letterSpacing: "-0.02em" }}>smsvital admin</span>
          </Link>
        </div>

        <nav style={{ padding: "8px 10px", flex: 1 }}>
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none",
                marginBottom: 2,
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent-bright)" : "var(--txt-3)",
                boxShadow: active ? "inset 0 0 0 1px var(--accent-line)" : "none",
                transition: "background .12s, color .12s",
              }}>
                <Icon name={icon} size={17}/>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "0 10px" }}>
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none",
            color: "var(--txt-3)", marginBottom: 2,
          }}>
            <Icon name="user" size={17}/>My account
          </Link>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none",
            color: "var(--txt-3)",
          }}>
            <Icon name="logout" size={17}/>Sign out
          </Link>
        </div>
      </aside>

      {/* main */}
      <main style={{ flex: 1, overflowX: "hidden", minWidth: 0 }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
