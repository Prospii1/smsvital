/* admin-2.jsx — admin sub-sections: orders, users, providers, pricing, fraud */

const TH = ({children, w}) => <th style={{ padding:'0 14px 12px', fontWeight:600, width:w }}>{children}</th>;
const TD = ({children, mono, c, b}) => <td className={mono?'mono':''} style={{ padding:'13px 14px', color:c||'var(--txt-2)', fontWeight:b?700:400 }}>{children}</td>;

function Table({ cols, children }) {
  return (
    <div className="card screen-in" style={{ borderRadius:16, overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead><tr className="eyebrow" style={{ textAlign:'left', color:'var(--txt-3)', background:'var(--surface-2)' }}>{cols.map((c,i)=><TH key={i} w={c.w}>{c.label}</TH>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function AdminOrders() {
  const rows = [
    ...SEED_ORDERS,
    { id:'ORD-7745', svc:'wa', cc:'br', number:'+55 11 9 8841 220', code:null, price:0.77, status:'waiting', age:'live' },
    { id:'ORD-7744', svc:'go', cc:'in', number:'+91 99 7720 5512', code:'662093', price:0.29, status:'received', age:'1m ago' },
    { id:'ORD-7743', svc:'ig', cc:'ph', number:'+63 917 552 0913', code:null, price:0.61, status:'expired', age:'4m ago' },
  ];
  return (
    <Table cols={[{label:'Order'},{label:'Service'},{label:'Country'},{label:'Number'},{label:'Code'},{label:'Price'},{label:'Status'},{label:'Age'}]}>
      {rows.map(o=>{ const s=svcById(o.svc), c=ccById(o.cc); return (
        <tr key={o.id} className="trow" style={{ borderTop:'1px solid var(--line)' }}>
          <TD mono c="var(--txt)">{o.id}</TD>
          <td style={{ padding:'10px 14px' }}><div style={{ display:'flex', alignItems:'center', gap:9 }}><Monogram svc={s} size={26}/><span style={{ color:'var(--txt)', fontWeight:500 }}>{s.name}</span></div></td>
          <TD>{c.name}</TD>
          <TD mono>{o.number}</TD>
          <TD mono c={o.code?'var(--ok)':'var(--txt-3)'} b={!!o.code}>{o.code||'—'}</TD>
          <TD mono c="var(--txt)">{fmt(o.price)}</TD>
          <td style={{ padding:'10px 14px' }}><Badge kind={o.status==='waiting'?'waiting':o.status}/></td>
          <TD c="var(--txt-3)">{o.age}</TD>
        </tr>
      );})}
    </Table>
  );
}

function AdminUsers() {
  return (
    <Table cols={[{label:'User ID'},{label:'Email'},{label:'Balance'},{label:'Orders'},{label:'Risk'},{label:'Joined'},{label:'Status'}]}>
      {ADMIN_USERS.map(u=>(
        <tr key={u.id} className="trow" style={{ borderTop:'1px solid var(--line)' }}>
          <TD mono c="var(--txt)">{u.id}</TD>
          <TD c="var(--txt)">{u.email}</TD>
          <TD mono c="var(--txt)" b>{fmt(u.bal)}</TD>
          <TD mono>{fmtBig(u.orders)}</TD>
          <td style={{ padding:'10px 14px' }}><Badge kind={u.risk}>{u.risk} risk</Badge></td>
          <TD c="var(--txt-3)">{u.joined}</TD>
          <td style={{ padding:'10px 14px' }}><Badge kind={u.status}/></td>
        </tr>
      ))}
    </Table>
  );
}

function AdminProviders() {
  const { ProviderStrip } = window.AdminParts;
  return (
    <div className="screen-in" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', gap:16 }}>
        {window.AdminParts.Stat({label:'Routing success',value:'92.4%',delta:'▲ 1.2 pts',good:true})}
        {window.AdminParts.Stat({label:'Avg. delivery',value:'8.9s',delta:'▼ 0.4s faster',good:true})}
        {window.AdminParts.Stat({label:'Active providers',value:'4 / 5',delta:'1 degraded',good:false})}
      </div>
      <ProviderStrip/>
      <div className="card" style={{ padding:'20px', borderRadius:16 }}>
        <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>Failover policy</div>
        <p style={{ color:'var(--txt-3)', fontSize:13, margin:'0 0 16px', lineHeight:1.5 }}>If a provider exceeds 5% fail rate or 800ms latency, traffic auto-routes to the next healthy provider by cost. Users never see provider identity.</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {['Cheapest first','Cap retries at 3','Block down providers','Refund on no-SMS'].map(r=>(
            <span key={r} className="chip" style={{ background:'var(--surface-2)' }}><Icon name="check" size={13} stroke="var(--ok)"/>{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPricing() {
  return (
    <div className="screen-in" style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
      <div className="card" style={{ flex:1, padding:'22px', borderRadius:16 }}>
        <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>Global markup</div>
        <p style={{ color:'var(--txt-3)', fontSize:13, margin:'0 0 18px' }}>Applied on top of provider cost for every order.</p>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:18 }}>
          <span className="mono" style={{ fontSize:42, fontWeight:700, color:'var(--accent-bright)' }}>+{MARKUP.value}%</span>
          <span style={{ color:'var(--txt-3)', fontSize:14 }}>· min {fmt(MARKUP.min)} fee</span>
        </div>
        <div style={{ height:6, borderRadius:99, background:'var(--surface-3)', marginBottom:8 }}>
          <div style={{ width:'52%', height:'100%', borderRadius:99, background:'var(--accent)', boxShadow:'0 0 12px -2px var(--accent-glow)' }}/>
        </div>
        <div className="mono" style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--txt-3)' }}><span>0%</span><span>cost-plus</span><span>100%</span></div>
      </div>
      <div className="card" style={{ flex:2, padding:'0', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--line)', fontWeight:600, fontSize:15 }}>Per-service overrides</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr className="eyebrow" style={{ textAlign:'left', color:'var(--txt-3)', background:'var(--surface-2)' }}>
            <TH>Service</TH><TH>Provider cost</TH><TH>Markup</TH><TH>User price</TH><TH>Margin</TH></tr></thead>
          <tbody>
            {['oa','tg','wa','go','tn'].map(id=>{ const s=svcById(id); const cost=s.base; const mk=id==='oa'?55:id==='tn'?60:35;
              const price=Math.round(cost*(1+mk/100)*100)/100; const margin=Math.round((price-cost)/price*100);
              return (
                <tr key={id} className="trow" style={{ borderTop:'1px solid var(--line)' }}>
                  <td style={{ padding:'12px 14px' }}><div style={{ display:'flex', alignItems:'center', gap:9 }}><Monogram svc={s} size={26}/><span style={{ color:'var(--txt)', fontWeight:500 }}>{s.name}</span></div></td>
                  <TD mono>{fmt(cost)}</TD>
                  <TD mono c="var(--accent-bright)" b>+{mk}%</TD>
                  <TD mono c="var(--txt)" b>{fmt(price)}</TD>
                  <TD mono c="var(--ok)">{margin}%</TD>
                </tr>
              );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminFraud() {
  return (
    <div className="screen-in" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', gap:16 }}>
        {window.AdminParts.Stat({label:'Open alerts',value:'4',delta:'2 high severity',good:false})}
        {window.AdminParts.Stat({label:'Blocked today',value:'127',delta:'auto-mitigated',good:true})}
        {window.AdminParts.Stat({label:'Chargeback rate',value:'0.3%',delta:'▼ within target',good:true})}
      </div>
      <Table cols={[{label:'Signal'},{label:'Detail'},{label:'Severity'},{label:'When'},{label:'',w:'120px'}]}>
        {ADMIN_FRAUD.map(f=>(
          <tr key={f.id} className="trow" style={{ borderTop:'1px solid var(--line)' }}>
            <td style={{ padding:'12px 14px' }}><div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:'var(--bad-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="flag" size={15} stroke="var(--bad)"/></div>
              <span style={{ color:'var(--txt)', fontWeight:600 }}>{f.type}</span></div></td>
            <TD mono>{f.detail}</TD>
            <td style={{ padding:'10px 14px' }}><Badge kind={f.sev}>{f.sev}</Badge></td>
            <TD c="var(--txt-3)">{f.when}</TD>
            <td style={{ padding:'10px 14px' }}><button className="btn btn-ghost" style={{ padding:'6px 12px', borderRadius:9, fontSize:12 }}>Review</button></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

window.AdminSubsections = { AdminOrders, AdminUsers, AdminProviders, AdminPricing, AdminFraud };
