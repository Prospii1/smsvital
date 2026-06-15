"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { SERVICES as STATIC_SERVICES } from "@/lib/data";

interface AppState {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  txns: any[];
  setTxns: React.Dispatch<React.SetStateAction<any[]>>;
  tweaks: { otpArrival: string; homeLayout: string; scanlines: boolean };
  setTweaks: React.Dispatch<React.SetStateAction<any>>;
  userEmail: string | null;
  userJoinedAt: string | null;
  firstname: string;
  lastname: string;
  setName: (firstname: string, lastname: string) => void;
  catalog: any;
  services: any[];
}

const AppContext = createContext<AppState | null>(null);
const DEFAULT_TWEAKS = { otpArrival: "flip", homeLayout: "list", scanlines: true };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const userIdRef = useRef<string | null>(null);

  const [balance, setBalanceState] = useState(0);
  const [orders, setOrdersState] = useState<any[]>([]);
  const [txns, setTxnsState] = useState<any[]>([]);
  const [tweaks, setTweaksState] = useState(DEFAULT_TWEAKS);
  const [catalog, setCatalog] = useState<any>(null);
  const [services, setServices] = useState<any[]>(STATIC_SERVICES);

  useEffect(() => {
    fetch("/api/sms/catalog")
      .then((r) => r.json())
      .then((data) => {
        setCatalog(data);
        if (data?.services) {
          setServices(data.services);
        }
      })
      .catch(() => {});
  }, []);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userJoinedAt, setUserJoinedAt] = useState<string | null>(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const loadUserData = useCallback(async (userId: string, email: string, createdAt: string) => {
    userIdRef.current = userId;
    setUserEmail(email);
    setUserJoinedAt(createdAt);

    const [{ data: profile }, { data: ordersData }, { data: txnsData }] = await Promise.all([
      supabase.from("profiles").select("balance, firstname, lastname").eq("id", userId).maybeSingle(),
      supabase.from("orders").select("data, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("transactions").select("data").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    setBalanceState(profile?.balance ?? 0);
    setFirstname(profile?.firstname ?? "");
    setLastname(profile?.lastname ?? "");
    setOrdersState(ordersData?.map((r: any) => ({ ...r.data, created_at: r.created_at })) ?? []);
    setTxnsState(txnsData?.map((r: any) => r.data) ?? []);

    // Call cleanup route on load/login to auto-refund any expired waiting orders
    fetch("/api/sms/cleanup", { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.refundCount > 0) {
          setBalanceState(d.newBalance);
          Promise.all([
            supabase.from("orders").select("data, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
            supabase.from("transactions").select("data").eq("user_id", userId).order("created_at", { ascending: false })
          ]).then(([{ data: newOrders }, { data: newTxns }]) => {
            setOrdersState(newOrders?.map((r: any) => ({ ...r.data, created_at: r.created_at })) ?? []);
            setTxnsState(newTxns?.map((r: any) => r.data) ?? []);
          });
        }
      })
      .catch(() => {});

    // Tweaks are cosmetic — keep in localStorage per user
    try {
      const saved = localStorage.getItem(`smsv_tweaks_${userId}`);
      if (saved) setTweaksState(JSON.parse(saved));
    } catch {}
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id, session.user.email!, session.user.created_at);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id, session.user.email!, session.user.created_at);
      } else {
        userIdRef.current = null;
        setUserEmail(null);
        setUserJoinedAt(null);
        setBalanceState(0);
        setOrdersState([]);
        setTxnsState([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadUserData]);

  useEffect(() => {
    document.body.classList.toggle("no-grid", !tweaks.scanlines);
  }, [tweaks.scanlines]);

  const setBalance = useCallback((updater: any) => {
    setBalanceState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (userIdRef.current) {
        supabase.from("profiles")
          .update({ balance: next })
          .eq("id", userIdRef.current)
          .then(({ error }) => {
            if (error) console.error("Failed to persist balance to DB:", error);
          });
      }
      return next;
    });
  }, [supabase]);

  const setOrders = useCallback((updater: any) => {
    setOrdersState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (userIdRef.current) {
        const uid = userIdRef.current;
        const prevIds = new Set(prev.map((o: any) => o.id));
        const newOrders = next.filter((o: any) => !prevIds.has(o.id));
        const updated = next.filter((o: any) => {
          const p = prev.find((x: any) => x.id === o.id);
          return p && (p.status !== o.status || p.code !== o.code);
        });
        if (newOrders.length > 0) {
          supabase.from("orders")
            .insert(newOrders.map((o: any) => ({ id: o.id, user_id: uid, data: o })))
            .then(() => {});
        }
        for (const o of updated) {
          supabase.from("orders").update({ data: o }).eq("id", o.id).then(() => {});
        }
      }
      return next;
    });
  }, [supabase]);

  const setTxns = useCallback((updater: any) => {
    setTxnsState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (userIdRef.current) {
        const uid = userIdRef.current;
        const prevIds = new Set(prev.map((t: any) => t.id));
        const newTxns = next.filter((t: any) => !prevIds.has(t.id));
        if (newTxns.length > 0) {
          supabase.from("transactions")
            .insert(newTxns.map((t: any) => ({ id: t.id, user_id: uid, data: t })))
            .then(() => {});
        }
      }
      return next;
    });
  }, [supabase]);

  const setTweaks = useCallback((updater: any) => {
    setTweaksState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (userIdRef.current) {
        try { localStorage.setItem(`smsv_tweaks_${userIdRef.current}`, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  }, []);

  const setName = useCallback((fn: string, ln: string) => {
    setFirstname(fn);
    setLastname(ln);
    if (userIdRef.current) {
      supabase.from("profiles").update({ firstname: fn, lastname: ln }).eq("id", userIdRef.current).then(() => {});
    }
  }, [supabase]);

  return (
    <AppContext.Provider value={{
      balance, setBalance,
      orders, setOrders,
      txns, setTxns,
      tweaks, setTweaks,
      userEmail, userJoinedAt,
      firstname, lastname, setName,
      catalog, services,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
