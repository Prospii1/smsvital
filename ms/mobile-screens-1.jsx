/* mobile-screens-1.jsx — full interactive user app (mobile) */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

/* ============ small helpers ============ */
function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="btn" style={{
      flex: 1, flexDirection: 'column', gap: 3, background: 'transparent',
      color: active ? 'var(--accent-bright)' : 'var(--txt-3)', padding: '8px 0 4px',
    }}>
      <Icon name={icon} size={22} sw={active ? 2 : 1.7}/>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
    </button>
  );
}

function TabBar({ tab, go }) {
  const items = [['home','Home','home'],['browse','Browse','grid'],['orders','Orders','clock'],['wallet','Wallet','wallet']];
  return (
    <div style={{
      display: 'flex', padding: '6px 10px 8px', gap: 4,
      background: 'rgba(10,12,17,0.82)', backdropFilter: 'blur(18px)',
      borderTop: '1px solid var(--line)',
    }}>
      {items.map(([id,l,ic]) => <NavBtn key={id} icon={ic} label={l} active={tab===id} onClick={()=>go(id)}/>)}
    </div>
  );
}

/* top bar with balance */
function TopBar({ balance, onWallet, title, back }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 18px 12px', gap: 12 }}>
      {back ? (
        <button className="btn" onClick={back} style={{ background:'var(--surface-2)', width:38, height:38, borderRadius:12, boxShadow:'inset 0 0 0 1px var(--line)', color:'var(--txt)' }}>
          <Icon name="chevL" size={20}/>
        </button>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'var(--accent)', display:'flex',alignItems:'center',justifyContent:'center', boxShadow:'0 0 16px -2px var(--accent-glow)' }}>
            <Icon name="bolt" size={18} stroke="#0a0612"/>
          </div>
          <span style={{ fontFamily:'var(--mono)', fontWeight:700, fontSize:17, letterSpacing:'-0.02em' }}>numr</span>
        </div>
      )}
      {title && <span style={{ fontWeight:600, fontSize:16 }}>{title}</span>}
      <button className="btn" onClick={onWallet} style={{
        background:'var(--surface-2)', boxShadow:'inset 0 0 0 1px var(--line)',
        borderRadius:11, padding:'7px 12px', gap:7, color:'var(--txt)' }}>
        <Icon name="wallet" size={16} stroke="var(--accent-bright)"/>
        <span className="mono" style={{ fontSize:13.5, fontWeight:700 }}>{fmt(balance)}</span>
      </button>
    </div>
  );
}

/* ============ HOME ============ */
function HomeScreen({ balance, go, openSvc, tweaks }) {
  const trending = ['tg','wa','go','oa','ig','di'].map(svcById);
  const layout = tweaks.homeLayout;
  return (
    <div className="screen-in" style={{ paddingBottom: 20 }}>
      <TopBar balance={balance} onWallet={()=>go('wallet')}/>
      {/* hero search */}
      <div style={{ padding: '0 18px' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Instant phone verification</div>
        <h1 style={{ margin:'0 0 16px', fontSize: 28, lineHeight:1.1, letterSpacing:'-0.02em', fontWeight:700, textWrap:'balance' }}>
          A number for any app,<br/><span style={{ color:'var(--accent-bright)' }}>live in seconds.</span>
        </h1>
        <button onClick={()=>go('browse')} className="btn" style={{
          width:'100%', justifyContent:'flex-start', gap:11, padding:'14px 16px',
          background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line-2)', borderRadius:14, color:'var(--txt-3)' }}>
          <Icon name="search" size={19}/>
          <span style={{ fontSize:14.5 }}>Search 600+ services…</span>
        </button>
      </div>

      {/* quick stats strip */}
      <div style={{ display:'flex', gap:8, padding:'14px 18px 4px' }}>
        {[['148k','numbers live'],['~9s','avg. delivery'],['92%','success rate']].map(([n,l])=>(
          <div key={l} className="card" style={{ flex:1, padding:'10px 12px', borderRadius:13 }}>
            <div className="mono" style={{ fontSize:17, fontWeight:700, color:'var(--accent-bright)' }}>{n}</div>
            <div style={{ fontSize:10.5, color:'var(--txt-3)', marginTop:1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* trending services */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 18px 10px' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--txt-2)' }}>Popular right now</span>
        <button onClick={()=>go('browse')} className="btn" style={{ background:'transparent', color:'var(--accent-bright)', fontSize:12.5, padding:0 }}>All<Icon name="chevR" size={14}/></button>
      </div>

      {layout === 'grid' ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 18px' }}>
          {trending.map(s=>(
            <button key={s.id} onClick={()=>openSvc(s)} className="btn focusable" style={{
              flexDirection:'column', alignItems:'flex-start', gap:10, padding:14,
              background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line)', borderRadius:16, color:'var(--txt)' }}>
              <Monogram svc={s} size={42}/>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontWeight:600, fontSize:14.5 }}>{s.name}</div>
                <div className="mono" style={{ fontSize:11, color:'var(--txt-3)', marginTop:2 }}>from {fmt(s.base*0.7*1.35)}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'0 18px' }}>
          {trending.map(s=>(
            <button key={s.id} onClick={()=>openSvc(s)} className="btn focusable" style={{
              justifyContent:'flex-start', gap:12, padding:'11px 13px',
              background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line)', borderRadius:14, color:'var(--txt)' }}>
              <Monogram svc={s} size={40}/>
              <div style={{ textAlign:'left', flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14.5 }}>{s.name}</div>
                <div style={{ fontSize:11.5, color:'var(--txt-3)', marginTop:1 }}>{fmtBig(s.avail)} available</div>
              </div>
              <span className="mono" style={{ fontSize:12.5, color:'var(--accent-bright)', fontWeight:600 }}>{fmt(s.base*0.7*1.35)}</span>
              <Icon name="chevR" size={16} stroke="var(--txt-3)"/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ BROWSE (search + service list) ============ */
function BrowseScreen({ balance, go, openSvc }) {
  const [q, setQ] = useStateM('');
  const list = SERVICES.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="screen-in" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <TopBar balance={balance} onWallet={()=>go('wallet')}/>
      <div style={{ padding:'0 18px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
          background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line-2)', borderRadius:13 }}>
          <Icon name="search" size={18} stroke="var(--txt-3)"/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search services…"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--txt)', fontSize:15, fontFamily:'var(--sans)' }}/>
          {q && <button className="btn" onClick={()=>setQ('')} style={{ background:'transparent', color:'var(--txt-3)', padding:0 }}><Icon name="x" size={16}/></button>}
        </div>
      </div>
      <div className="noscroll" style={{ flex:1, overflowY:'auto', padding:'0 18px 18px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {list.map(s=>(
            <button key={s.id} onClick={()=>openSvc(s)} className="btn focusable" style={{
              justifyContent:'flex-start', gap:12, padding:'10px 12px',
              background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line)', borderRadius:13, color:'var(--txt)' }}>
              <Monogram svc={s} size={40}/>
              <div style={{ textAlign:'left', flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14.5 }}>{s.name}</div>
                <div style={{ fontSize:11.5, color:'var(--txt-3)', marginTop:1 }}>{fmtBig(s.avail)} numbers</div>
              </div>
              <span className="mono" style={{ fontSize:12.5, color:'var(--accent-bright)', fontWeight:600 }}>{fmt(s.base*0.7*1.35)}</span>
            </button>
          ))}
          {list.length===0 && <div style={{ textAlign:'center', color:'var(--txt-3)', padding:'40px 0', fontSize:14 }}>No services match “{q}”.</div>}
        </div>
      </div>
    </div>
  );
}

window.MobileScreens1 = { TabBar, TopBar, HomeScreen, BrowseScreen, NavBtn };
