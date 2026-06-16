"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Monogram, Badge } from "@/components/ui/Primitives";
import { useApp } from "@/components/Providers";
import { svcById, ccById } from "@/lib/data";

export default function OrdersScreen() {
  const { orders, services } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const shown = orders.filter((o: any) => filter==="all" || (filter==="active"&&o.status==="waiting") || (filter==="done"&&o.status!=="waiting"));

  return (
    <div className="screen-in" style={{ display:"flex", flexDirection:"column", paddingTop: 10 }}>
      <TopBar title="Orders" />
      <div style={{ display:"flex", gap:7, padding:"0 18px 12px" }}>
        {[["all","All"],["active","Active"],["done","Completed"]].map(([id,l])=>(
          <button key={id} onClick={()=>setFilter(id)} className="btn" style={{ padding:"7px 14px", borderRadius:10, fontSize:12.5, fontWeight:600,
            background: filter===id?"var(--surface-3)":"transparent", color: filter===id?"var(--txt)":"var(--txt-3)",
            boxShadow: filter===id?"inset 0 0 0 1px var(--line-2)":"none" }}>{l}</button>
        ))}
      </div>
      <div style={{ padding:"0 18px 18px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {shown.map((o: any) => {
            const svc = svcById(o.svc, services);
            const cc = ccById(o.cc);
            if (!svc || !cc) return null;
            return (
              <button key={o.id} onClick={()=>router.push(`/dashboard/order/${o.id}`)} className="btn focusable" style={{
                justifyContent:"flex-start", gap:12, padding:"12px", borderRadius:14, color:"var(--txt)",
                background:"var(--surface)", boxShadow:"inset 0 0 0 1px var(--line)" }}>
                <Monogram svc={svc} size={42}/>
                <div style={{ textAlign:"left", flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:600, fontSize:14.5 }}>{svc.name}</span>
                    <span style={{ fontSize:11.5, color:"var(--txt-3)" }}>{cc.name}</span>
                  </div>
                  <div className="mono" style={{ fontSize:11.5, color:"var(--txt-3)", marginTop:3 }}>{o.number}</div>
                </div>
                <div style={{ textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                  {o.status==="received"
                    ? <span className="mono" style={{ fontSize:15, fontWeight:700, color:"var(--ok)", letterSpacing:"0.05em" }}>{o.code}</span>
                    : <Badge kind={o.status}/>}
                  <span style={{ fontSize:10.5, color:"var(--txt-3)" }}>{o.age}</span>
                </div>
              </button>
            );
          })}
          {shown.length===0 && <div style={{ textAlign:"center", color:"var(--txt-3)", padding:"50px 0", fontSize:14 }}>No orders here yet.</div>}
        </div>
      </div>
    </div>
  );
}
