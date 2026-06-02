/* admin.jsx — desktop admin console */
const { useState: useStateM } = React;
function AdminConsole({ tweaks }) {
  const [section, setSection] = useStateM('overview');
  const S = ADMIN_STATS;
  const nav = [
    ['overview','Overview','chart'],
    ['orders','Orders','sms'],
    ['users','Users','users'],
    ['providers','Providers','server'],
    ['pricing','Pricing','tag'],
    ['fraud','Fraud','shield'],
  ];
  return (
    <div style={{ display:'flex', height:'100%', background:'var(--bg)', color:'var(--txt)', fontFamily:'var(--sans)' }}>
      {/* sidebar */}
      <div style={{ width:228, flexShrink:0, borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', padding:'20px 14px', background:'var(--surface)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 8px 22px' }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px -2px var(--accent-glow)' }}>
            <Icon name="bolt" size={18} stroke="#0a0612"/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--mono)', fontWeight:700, fontSize:15, lineHeight:1 }}>numr</div>
            <div className="eyebrow" style={{ fontSize:9, marginTop:3 }}>console</div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          {nav.map(([id,l,ic])=>(
            <button key={id} onClick={()=>setSection(id)} className="btn" style={{
              justifyContent:'flex-start', gap:11, padding:'10px 12px', borderRadius:11, fontSize:13.5, fontWeight:500,
              background: section===id?'var(--accent-soft)':'transparent',
              color: section===id?'var(--accent-bright)':'var(--txt-2)',
              boxShadow: section===id?'inset 0 0 0 1px var(--accent-line)':'none' }}>
              <Icon name={ic} size={18}/>{l}
            </button>
          ))}
        </div>
        <div style={{ marginTop:'auto', padding:'12px', borderRadius:12, background:'var(--surface-2)', boxShadow:'inset 0 0 0 1px var(--line)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'var(--txt-2)' }}>
            <span className="live-dot"/> All systems nominal
          </div>
          <div className="mono" style={{ fontSize:10.5, color:'var(--txt-3)', marginTop:6 }}>uptime 99.98% · 30d</div>
        </div>
      </div>

      {/* main */}
      <div className="noscroll" style={{ flex:1, overflowY:'auto' }}>
        {/* header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', borderBottom:'1px solid var(--line)', position:'sticky', top:0, background:'rgba(7,8,11,0.8)', backdropFilter:'blur(14px)', zIndex:5 }}>
          <div>
            <div className="eyebrow">{nav.find(n=>n[0]===section)[1]}</div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.01em', marginTop:3 }}>
              {section==='overview'?'Platform overview':section==='orders'?'Live orders':section==='users'?'User accounts':section==='providers'?'Provider routing':section==='pricing'?'Pricing & markup':'Fraud & risk'}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 13px', background:'var(--surface)', borderRadius:10, boxShadow:'inset 0 0 0 1px var(--line)' }}>
              <Icon name="search" size={16} stroke="var(--txt-3)"/>
              <span style={{ fontSize:13, color:'var(--txt-3)' }}>Search orders, users…</span>
            </div>
            <div style={{ width:38, height:38, borderRadius:10, background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 0 1px var(--line)' }}>
              <Icon name="user" size={19} stroke="var(--txt-2)"/>
            </div>
          </div>
        </div>

        <div style={{ padding:'24px 28px 40px' }}>
          {section==='overview' && <AdminOverview S={S}/>}
          {section==='orders' && <window.AdminSubsections.AdminOrders/>}
          {section==='users' && <window.AdminSubsections.AdminUsers/>}
          {section==='providers' && <window.AdminSubsections.AdminProviders/>}
          {section==='pricing' && <window.AdminSubsections.AdminPricing/>}
          {section==='fraud' && <window.AdminSubsections.AdminFraud/>}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, delta, spark, good }) {
  return (
    <div className="card" style={{ padding:'18px 20px', borderRadius:16, flex:1, minWidth:0 }}>
      <div className="eyebrow">{label}</div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:10, marginTop:10 }}>
        <div className="mono" style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.02em' }}>{value}</div>
        {spark && <Sparkline data={spark} w={84} h={32}/>}
      </div>
      {delta && <div style={{ fontSize:12, marginTop:8, color: good?'var(--ok)':'var(--bad)', fontWeight:600 }}>{delta}</div>}
    </div>
  );
}

function AdminOverview({ S }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }} className="screen-in">
      <div style={{ display:'flex', gap:16 }}>
        <Stat label="Revenue today" value={fmt(S.revenueToday)} delta="▲ 12.4% vs yesterday" good spark={S.revenue7d}/>
        <Stat label="Orders today" value={fmtBig(S.ordersToday)} delta="▲ 6.1%" good spark={S.orders24h.slice(-7)}/>
        <Stat label="Active numbers" value={fmtBig(S.activeNumbers)} delta="live now" good/>
        <Stat label="Gross margin" value={S.marginPct+'%'} delta="▼ 0.6 pts" good={false}/>
      </div>
      <div style={{ display:'flex', gap:18 }}>
        <div className="card" style={{ flex:2, padding:'20px', borderRadius:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div style={{ fontWeight:600, fontSize:15 }}>Orders · last 24h</div>
            <div className="chip"><span className="live-dot"/>live</div>
          </div>
          <Bars data={S.orders24h} h={140} gap={4}/>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }} className="mono">
            {['00:00','06:00','12:00','18:00','now'].map(t=><span key={t} style={{ fontSize:10.5, color:'var(--txt-3)' }}>{t}</span>)}
          </div>
        </div>
        <div className="card" style={{ flex:1, padding:'20px', borderRadius:16 }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Top services</div>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {['tg','go','wa','oa','di'].map((id,i)=>{
              const s=svcById(id); const pct=[34,22,16,12,9][i];
              return (
                <div key={id} style={{ display:'flex', alignItems:'center', gap:11 }}>
                  <Monogram svc={s} size={30}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:5 }}>
                      <span style={{ fontWeight:500 }}>{s.name}</span><span className="mono" style={{ color:'var(--txt-3)' }}>{pct}%</span>
                    </div>
                    <div style={{ height:5, borderRadius:99, background:'var(--surface-3)' }}>
                      <div style={{ width:`${pct*2.6}%`, height:'100%', borderRadius:99, background:'var(--accent)' }}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ProviderStrip/>
    </div>
  );
}

function ProviderStrip() {
  return (
    <div className="card" style={{ padding:'20px', borderRadius:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontWeight:600, fontSize:15 }}>Provider routing <span style={{ color:'var(--txt-3)', fontWeight:400, fontSize:13 }}>· internal, hidden from users</span></div>
        <span className="mono" style={{ fontSize:11.5, color:'var(--txt-3)' }}>auto-failover ON</span>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead><tr style={{ textAlign:'left', color:'var(--txt-3)' }} className="eyebrow">
          {['Provider','Status','Latency','Traffic share','Fail rate'].map(h=><th key={h} style={{ padding:'0 0 12px', fontWeight:600 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {ADMIN_PROVIDERS.map(p=>(
            <tr key={p.id} className="trow" style={{ borderTop:'1px solid var(--line)' }}>
              <td style={{ padding:'12px 0', fontWeight:600 }}>{p.name}</td>
              <td><Badge kind={p.status}/></td>
              <td className="mono" style={{ color:'var(--txt-2)' }}>{p.latency?`${p.latency}ms`:'—'}</td>
              <td style={{ width:200 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ flex:1, height:5, borderRadius:99, background:'var(--surface-3)' }}>
                    <div style={{ width:`${p.share}%`, height:'100%', borderRadius:99, background: p.status==='down'?'var(--bad)':'var(--accent)' }}/>
                  </div>
                  <span className="mono" style={{ color:'var(--txt-3)', fontSize:12 }}>{p.share}%</span>
                </div>
              </td>
              <td className="mono" style={{ color: p.fail>5?'var(--bad)':'var(--txt-2)' }}>{p.fail}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

window.AdminConsole = AdminConsole;
window.AdminParts = { Stat, ProviderStrip };
