"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TabBar } from "@/components/layout/TabBar";
import { DashSidebar } from "@/components/layout/DashSidebar";
import { createClient } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/login");
    });
  }, [router]);

  return (
    <div className="dash-shell">
      <DashSidebar />
      <div className="dash-content">
        <div className="dash-inner">
          {children}
        </div>
      </div>
      <TabBar />
    </div>
  );
}
