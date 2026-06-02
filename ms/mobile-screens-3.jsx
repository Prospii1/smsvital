/* mobile-screens-3.jsx — wallet, orders, settings, auth */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

/* ============ WALLET ============ */
function WalletScreen({ balance, txns, go, onTopup, pushToast }) {
  const [sheet, setSheet] = useStateM(false);
  return (
    <div className="screen-in" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <TopBar balance={balance} title="Wallet" onWallet={()=>{}}/>
      <div className="noscroll" style={{ flex:1, overflowY:'auto', padding:'0 18px 18px' }}>
        {/* balance card */}
        <div className="card tgrid" style={{ padding:'20px', borderRadius:20, overflow:'hidden',
          background:'linear-gradient(150deg, var(--accent-soft), var(--surface) 60%)',
          boxShadow:'inset 0 0 0 1px var(--accent-line)' }}>
          <div className="eyebrow" style={{ position:'relative', zIndex:1 }}>Available balance</div>
          <div className="mono" style={{ position:'relative', zIndex:1, fontSize:40, fontWeight:700, letterSpacing:'-0.02em', margin:'6px 0 16px' }}>{fmt(balance)}</div>
          <div style={{ position:'relative', zIndex:1, display:'flex', gap:9 }}>
            <button onClick={()=>setSheet(true)} className="btn btn-primary" style={{ flex:1, padding:'12px', borderRadius:12, fontSize:14.5 }}><Icon name="plus" size={17}/>Add funds</button>
            <button onClick={()=>pushToast({msg:'Auto-reload set: +$10 below $2'})} className="btn btn-ghost" style={{ padding:'12px 14px', borderRadius:12, fontSize:14 }}><Icon name="bolt" size={16}/>Auto</button>
          </div>
        </div>

        {/* quick amounts hint */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 2px 10px' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'var(--txt-2)' }}>Transactions</span>
          <span style={{ fontSize:11.5, color:'var(--txt-3)' }}>Last 30 days</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {txns.map(tx=>{
            const pos = tx.amt>=0;
            const ic = tx.t==='topup'?'plus':tx.t==='refund'?'refresh':'sms';
            return (
              <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 4px', borderBottom:'1px solid var(--line)' }}>
                <div style={{ width:36, height:36, borderRadius:11, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  background: pos?'var(--ok-soft)':'var(--surface-2)', color: pos?'var(--ok)':'var(--txt-2)' }}>
                  <Icon name={ic} size={17}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{tx.label}</div>
                  <div className="mono" style={{ fontSize:10.5, color:'var(--txt-3)', marginTop:1 }}>{tx.ref} · {tx.when}</div>
                </div>
                <span className="mono" style={{ fontSize:14, fontWeight:700, color: pos?'var(--ok)':'var(--txt)' }}>{pos?'+':''}{fmt(tx.amt).replace('-','')}</span>
              </div>
            );
          })}
        </div>
      </div>
      {sheet && <TopupSheet onClose={()=>setSheet(false)} onTopup={(amt)=>{ onTopup(amt); setSheet(false); pushToast({kind:'ok', msg:`Added ${fmt(amt)} to wallet`}); }}/>}
    </div>
  );
}

function TopupSheet({ onClose, onTopup }) {
  const [amt, setAmt] = useStateM(10);
  const presets = [5,10,25,50,100];
  return (
    <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:40, background:'rgba(0,0,0,0.55)',
      animation:'fadeIn .2s ease', display:'flex', alignItems:'flex-end' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'var(--surface)', borderRadius:'24px 24px 0 0',
        padding:'10px 20px 34px', boxShadow:'0 -20px 60px rgba(0,0,0,0.6)', animation:'sheetUp .3s cubic-bezier(.2,.9,.3,1)' }}>
        <div style={{ width:40, height:4, borderRadius:99, background:'var(--line-2)', margin:'4px auto 18px' }}/>
        <div style={{ fontWeight:700, fontSize:19, marginBottom:4 }}>Add funds</div>
        <div style={{ fontSize:12.5, color:'var(--txt-3)', marginBottom:16 }}>Crypto, card or balance transfer · instant credit</div>
        <div className="mono" style={{ textAlign:'center', fontSize:46, fontWeight:700, margin:'8px 0 18px' }}>{fmt(amt)}</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:18 }}>
          {presets.map(p=>(
            <button key={p} onClick={()=>setAmt(p)} className="btn" style={{ padding:'12px 0', borderRadius:11, fontSize:14, fontWeight:700,
              background: amt===p?'var(--accent-soft)':'var(--surface-2)',
              color: amt===p?'var(--accent-bright)':'var(--txt-2)',
              boxShadow: amt===p?'inset 0 0 0 1.5px var(--accent-line)':'inset 0 0 0 1px var(--line)' }}>${p}</button>
          ))}
        </div>
        <button onClick={()=>onTopup(amt)} className="btn btn-primary" style={{ width:'100%', padding:'15px', borderRadius:13, fontSize:16 }}>
          <Icon name="lock" size={16}/>Pay {fmt(amt)}
        </button>
      </div>
    </div>
  );
}

/* ============ ORDERS / OTP HISTORY ============ */
function OrdersScreen({ balance, orders, go, openOrder }) {
  const [filter, setFilter] = useStateM('all');
  const shown = orders.filter(o => filter==='all' || (filter==='active'&&o.status==='waiting') || (filter==='done'&&o.status!=='waiting'));
  return (
    <div className="screen-in" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <TopBar balance={balance} title="Orders" onWallet={()=>go('wallet')}/>
      <div style={{ display:'flex', gap:7, padding:'0 18px 12px' }}>
        {[['all','All'],['active','Active'],['done','Completed']].map(([id,l])=>(
          <button key={id} onClick={()=>setFilter(id)} className="btn" style={{ padding:'7px 14px', borderRadius:10, fontSize:12.5, fontWeight:600,
            background: filter===id?'var(--surface-3)':'transparent', color: filter===id?'var(--txt)':'var(--txt-3)',
            boxShadow: filter===id?'inset 0 0 0 1px var(--line-2)':'none' }}>{l}</button>
        ))}
      </div>
      <div className="noscroll" style={{ flex:1, overflowY:'auto', padding:'0 18px 18px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {shown.map(o=>{
            const svc=svcById(o.svc), cc=ccById(o.cc);
            return (
              <button key={o.id} onClick={()=>openOrder(o)} className="btn focusable" style={{
                justifyContent:'flex-start', gap:12, padding:'12px', borderRadius:14, color:'var(--txt)',
                background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line)' }}>
                <Monogram svc={svc} size={42}/>
                <div style={{ textAlign:'left', flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontWeight:600, fontSize:14.5 }}>{svc.name}</span>
                    <span style={{ fontSize:11.5, color:'var(--txt-3)' }}>{cc.name}</span>
                  </div>
                  <div className="mono" style={{ fontSize:11.5, color:'var(--txt-3)', marginTop:3 }}>{o.number}</div>
                </div>
                <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  {o.status==='received'
                    ? <span className="mono" style={{ fontSize:15, fontWeight:700, color:'var(--ok)', letterSpacing:'0.05em' }}>{o.code}</span>
                    : <Badge kind={o.status}/>}
                  <span style={{ fontSize:10.5, color:'var(--txt-3)' }}>{o.age}</span>
                </div>
              </button>
            );
          })}
          {shown.length===0 && <div style={{ textAlign:'center', color:'var(--txt-3)', padding:'50px 0', fontSize:14 }}>No orders here yet.</div>}
        </div>
      </div>
    </div>
  );
}

/* ============ SETTINGS ============ */
function SettingsScreen({ balance, go, tweaks, pushToast }) {
  const Row = ({icon, label, val, danger, onClick}) => (
    <button onClick={onClick} className="btn" style={{ width:'100%', justifyContent:'flex-start', gap:13, padding:'14px 14px', borderRadius:0,
      background:'transparent', borderBottom:'1px solid var(--line)', color: danger?'var(--bad)':'var(--txt)' }}>
      <Icon name={icon} size={19} stroke={danger?'var(--bad)':'var(--accent-bright)'}/>
      <span style={{ flex:1, textAlign:'left', fontSize:14.5, fontWeight:500 }}>{label}</span>
      {val && <span style={{ fontSize:13, color:'var(--txt-3)' }}>{val}</span>}
      {!danger && <Icon name="chevR" size={16} stroke="var(--txt-3)"/>}
    </button>
  );
  return (
    <div className="screen-in" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <TopBar balance={balance} title="Account" onWallet={()=>go('wallet')}/>
      <div className="noscroll" style={{ flex:1, overflowY:'auto', padding:'0 18px 18px' }}>
        <div className="card" style={{ display:'flex', alignItems:'center', gap:13, padding:'15px', borderRadius:16, marginBottom:18 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 0 1px var(--accent-line)' }}>
            <Icon name="user" size={24} stroke="var(--accent-bright)"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:15.5 }}>leo.m****@proton.me</div>
            <div style={{ fontSize:12, color:'var(--txt-3)', marginTop:2 }}>Member since Mar 2026 · 318 orders</div>
          </div>
        </div>
        <div className="card" style={{ overflow:'hidden', borderRadius:16 }}>
          <Row icon="wallet" label="Wallet & billing" val={fmt(balance)} onClick={()=>go('wallet')}/>
          <Row icon="bolt" label="Auto-reload" val="On" onClick={()=>pushToast({msg:'Auto-reload settings'})}/>
          <Row icon="shield" label="Two-factor auth" val="Enabled" onClick={()=>pushToast({msg:'2FA settings'})}/>
          <Row icon="tag" label="API keys" val="2 active" onClick={()=>pushToast({msg:'Developer API keys'})}/>
          <Row icon="phone" label="Notifications" val="Push" onClick={()=>pushToast({msg:'Notification prefs'})}/>
        </div>
        <div className="card" style={{ overflow:'hidden', borderRadius:16, marginTop:14 }}>
          <Row icon="eye" label="Privacy & data" onClick={()=>pushToast({msg:'Privacy center'})}/>
          <Row icon="logout" label="Sign out" danger onClick={()=>go('auth')}/>
        </div>
        <div style={{ textAlign:'center', color:'var(--txt-3)', fontSize:11, marginTop:18 }} className="mono">numr · v2.4.0</div>
      </div>
    </div>
  );
}

/* ============ AUTH ============ */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useStateM('login');
  const [email, setEmail] = useStateM('');
  return (
    <div className="screen-in tgrid" style={{ height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 26px', position:'relative' }}>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ width:46, height:46, borderRadius:14, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22, boxShadow:'0 0 28px -4px var(--accent-glow)' }}>
          <Icon name="bolt" size={26} stroke="#0a0612"/>
        </div>
        <h1 style={{ margin:'0 0 6px', fontSize:27, letterSpacing:'-0.02em', fontWeight:700 }}>{mode==='login'?'Welcome back':'Create account'}</h1>
        <p style={{ margin:'0 0 26px', color:'var(--txt-3)', fontSize:14, lineHeight:1.45 }}>Disposable numbers for sign-ups & verification. No phone of your own required.</p>

        <label className="eyebrow" style={{ display:'block', marginBottom:7 }}>Email</label>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 14px', background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line-2)', borderRadius:13, marginBottom:12 }}>
          <Icon name="user" size={18} stroke="var(--txt-3)"/>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--txt)', fontSize:15, fontFamily:'var(--sans)' }}/>
        </div>
        <label className="eyebrow" style={{ display:'block', marginBottom:7 }}>Password</label>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 14px', background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line-2)', borderRadius:13, marginBottom:20 }}>
          <Icon name="lock" size={18} stroke="var(--txt-3)"/>
          <input type="password" defaultValue="········"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--txt)', fontSize:15, fontFamily:'var(--sans)' }}/>
        </div>
        <button onClick={onAuth} className="btn btn-primary" style={{ width:'100%', padding:'15px', borderRadius:13, fontSize:16 }}>
          {mode==='login'?'Sign in':'Create account'}<Icon name="chevR" size={17}/>
        </button>
        <div style={{ textAlign:'center', marginTop:18, fontSize:13.5, color:'var(--txt-3)' }}>
          {mode==='login'?"New here? ":"Have an account? "}
          <button onClick={()=>setMode(mode==='login'?'signup':'login')} className="btn" style={{ background:'transparent', color:'var(--accent-bright)', padding:0, fontSize:13.5, fontWeight:600 }}>
            {mode==='login'?'Create one':'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

window.MobileScreens3 = { WalletScreen, OrdersScreen, SettingsScreen, AuthScreen };
