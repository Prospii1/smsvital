/* mobile-screens-2.jsx — purchase config + HERO live order */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

/* ============ PURCHASE CONFIG (service -> country) ============ */
function ConfigScreen({ svc, balance, go, onBuy, tweaks }) {
  const [ccId, setCcId] = useStateM('us');
  const [q, setQ] = useStateM('');
  const cc = ccById(ccId);
  const price = priceFor(svc, cc);
  const avail = availFor(svc, cc);
  const canPay = balance >= price;
  const list = COUNTRIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="screen-in" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <TopBar balance={balance} back={()=>go('browse')}/>
      <div style={{ padding:'0 18px 10px', display:'flex', alignItems:'center', gap:13 }}>
        <Monogram svc={svc} size={52}/>
        <div>
          <div style={{ fontWeight:700, fontSize:20, letterSpacing:'-0.01em' }}>{svc.name}</div>
          <div style={{ fontSize:12.5, color:'var(--txt-3)' }}>One-time SMS verification</div>
        </div>
      </div>

      <div style={{ padding:'4px 18px 8px' }}>
        <div className="eyebrow" style={{ marginBottom:8 }}>Choose a country</div>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px',
          background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--line)', borderRadius:12, marginBottom:10 }}>
          <Icon name="search" size={16} stroke="var(--txt-3)"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter countries…"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--txt)', fontSize:14, fontFamily:'var(--sans)' }}/>
        </div>
      </div>

      <div className="noscroll" style={{ flex:1, overflowY:'auto', padding:'0 18px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {list.map(c=>{
            const cp = priceFor(svc,c); const ca = availFor(svc,c);
            const sel = c.id===ccId;
            const low = ca < 1500;
            return (
              <button key={c.id} onClick={()=>setCcId(c.id)} className="btn focusable" style={{
                justifyContent:'flex-start', gap:12, padding:'10px 12px', borderRadius:13, color:'var(--txt)',
                background: sel ? 'var(--accent-soft)' : 'var(--surface)',
                boxShadow: sel ? 'inset 0 0 0 1.5px var(--accent-line)' : 'inset 0 0 0 1px var(--line)' }}>
                <CC cc={c} size={38}/>
                <div style={{ textAlign:'left', flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{c.name}</div>
                  <div style={{ fontSize:11, color: low?'var(--warn)':'var(--txt-3)', marginTop:1 }}>
                    {low ? `Low stock · ${fmtBig(ca)}` : `${fmtBig(ca)} available`}
                  </div>
                </div>
                <span className="mono" style={{ fontSize:13, fontWeight:700, color: sel?'var(--accent-bright)':'var(--txt-2)' }}>{fmt(cp)}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: 130 }}/>
      </div>

      {/* sticky buy bar */}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'14px 18px 30px',
        background:'linear-gradient(transparent, var(--bg) 26%)' }}>
        <div className="card" style={{ padding:14, borderRadius:16, background:'var(--surface-2)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11.5, color:'var(--txt-3)' }}>{svc.name} · {cc.name}</div>
              <div className="mono" style={{ fontSize:24, fontWeight:700, marginTop:1 }}>{fmt(price)}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="chip" style={{ background:'var(--surface)' }}><span className="live-dot"/>{fmtBig(avail)} live</div>
              <div style={{ fontSize:10.5, color:'var(--txt-3)', marginTop:6 }}>Refunded if no SMS</div>
            </div>
          </div>
          <button disabled={!canPay} onClick={()=>onBuy(svc, cc, price)} className="btn btn-primary focusable" style={{
            width:'100%', padding:'15px', borderRadius:13, fontSize:16 }}>
            {canPay ? <>Buy number · {fmt(price)}</> : 'Insufficient balance'}
          </button>
          {!canPay && <button onClick={()=>go('wallet')} className="btn" style={{ width:'100%', marginTop:8, background:'transparent', color:'var(--accent-bright)', fontSize:13 }}>Top up wallet<Icon name="chevR" size={15}/></button>}
        </div>
      </div>
    </div>
  );
}

/* ============ HERO — LIVE ORDER ============ */
function LiveOrderScreen({ order, go, onDone, tweaks, pushToast }) {
  // phases: waiting -> received
  const [phase, setPhase] = useStateM('waiting');
  const [secs, setSecs] = useStateM(0);
  const [code, setCode] = useStateM(null);
  const [copied, setCopied] = useStateM(false);
  const TOTAL = 600; // 10 min window
  const arrival = 7; // seconds to fake-arrival
  const svc = svcById(order.svc), cc = ccById(order.cc);

  useEffectM(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffectM(() => {
    if (secs === arrival && phase === 'waiting') {
      const otp = genOtp();
      setCode(otp);
      setPhase('received');
      pushToast({ kind:'ok', icon:'sms', msg:`Code received — ${otp}` });
      if (navigator.vibrate) navigator.vibrate(40);
    }
  }, [secs]);

  const remaining = Math.max(0, TOTAL - secs);
  const mm = String(Math.floor(remaining/60)).padStart(2,'0');
  const ss = String(remaining%60).padStart(2,'0');
  const progress = phase==='received' ? 1 : Math.min(1, secs/arrival);

  const copy = () => {
    setCopied(true); pushToast({ kind:'ok', msg:'Code copied to clipboard' });
    try { navigator.clipboard?.writeText(code); } catch(e){}
    setTimeout(()=>setCopied(false), 1600);
  };

  const arrivalStyle = tweaks.otpArrival; // 'flip' | 'pop' | 'type'

  return (
    <div className="screen-in tgrid" style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <TopBar balance={null} back={()=>go('orders')}/>
      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', padding:'4px 22px', overflowY:'auto' }} className="noscroll">

        {/* service header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <Monogram svc={svc} size={40}/>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>{svc.name}</div>
            <div style={{ fontSize:12, color:'var(--txt-3)' }}>{cc.name} · {order.id}</div>
          </div>
        </div>

        {/* ring / state */}
        <CountdownRing progress={progress} size={172}
          color={phase==='received' ? 'var(--ok)' : 'var(--accent)'}
          label={
            phase==='waiting'
              ? <><span className="mono" style={{ fontSize:30, fontWeight:700, letterSpacing:'0.02em' }}>{mm}:{ss}</span></>
              : <Icon name="check" size={46} stroke="var(--ok)" sw={2.4}/>
          }
          sub={
            <span className="mono" style={{ fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase',
              color: phase==='received'?'var(--ok)':'var(--txt-3)', marginTop:6 }}>
              {phase==='waiting' ? 'awaiting sms' : 'code received'}
            </span>
          }/>

        {/* the assigned number */}
        <div style={{ marginTop:22, width:'100%' }}>
          <div className="eyebrow" style={{ textAlign:'center', marginBottom:8 }}>Your temporary number</div>
          <div onClick={()=>{ navigator.clipboard?.writeText(order.number); pushToast({msg:'Number copied'}); }}
            className="card" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            padding:'14px', borderRadius:14, cursor:'pointer', background:'var(--surface-2)' }}>
            <span className="mono" style={{ fontSize:21, fontWeight:600, letterSpacing:'0.03em' }}>{order.number}</span>
            <Icon name="copy" size={17} stroke="var(--txt-3)"/>
          </div>
        </div>

        {/* OTP slot */}
        <div style={{ marginTop:14, width:'100%' }}>
          {phase==='waiting' ? (
            <div className="card" style={{ padding:'18px', borderRadius:16, background:'var(--surface)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:12, minHeight:78 }}>
              <div style={{ display:'flex', gap:7 }}>
                {[0,1,2].map(i=>(<span key={i} className="skel" style={{ width:34, height:44, borderRadius:8, animationDelay:`${i*0.15}s` }}/>))}
                <span style={{ width:8 }}/>
                {[0,1,2].map(i=>(<span key={i} className="skel" style={{ width:34, height:44, borderRadius:8, animationDelay:`${(i+3)*0.15}s` }}/>))}
              </div>
            </div>
          ) : (
            <OtpReveal code={code} style={arrivalStyle} copied={copied} onCopy={copy}/>
          )}
        </div>

        {/* actions */}
        <div style={{ marginTop:'auto', paddingTop:20, width:'100%', display:'flex', flexDirection:'column', gap:9 }}>
          {phase==='received' ? (
            <>
              <button onClick={onDone} className="btn btn-primary" style={{ width:'100%', padding:'15px', borderRadius:13, fontSize:15.5 }}>Done</button>
              <button onClick={()=>{ setPhase('waiting'); setSecs(0); setCode(null); pushToast({msg:'Requesting another SMS…'}); }}
                className="btn btn-ghost" style={{ width:'100%', padding:'13px', borderRadius:13, fontSize:14 }}>
                <Icon name="refresh" size={16}/>Request another SMS
              </button>
            </>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, color:'var(--txt-3)', fontSize:12.5 }}>
                <span className="live-dot"/> Listening for incoming SMS…
              </div>
              <button onClick={()=>{ pushToast({kind:'bad', icon:'x', msg:'Order cancelled · refunded'}); go('orders'); }}
                className="btn" style={{ width:'100%', padding:'13px', borderRadius:13, fontSize:14, background:'transparent', color:'var(--txt-3)', boxShadow:'inset 0 0 0 1px var(--line)' }}>
                Cancel & refund
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* OTP reveal with 3 animation styles */
function OtpReveal({ code, style, copied, onCopy }) {
  const digits = code.split('');
  const [shown, setShown] = useStateM(style==='type' ? 0 : digits.length);
  useEffectM(()=>{
    if (style!=='type') return;
    let i=0; const t=setInterval(()=>{ i++; setShown(i); if(i>=digits.length) clearInterval(t); }, 110);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div onClick={onCopy} className="card focusable" style={{ padding:'16px 14px', borderRadius:16, cursor:'pointer',
      background:'linear-gradient(180deg, var(--accent-soft), var(--surface))',
      boxShadow:'inset 0 0 0 1.5px var(--accent-line), 0 0 30px -8px var(--accent-glow)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span className="eyebrow" style={{ color:'var(--accent-bright)' }}>Verification code</span>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color: copied?'var(--ok)':'var(--accent-bright)', fontWeight:600 }}>
          <Icon name={copied?'check':'copy'} size={14}/>{copied?'Copied':'Tap to copy'}
        </span>
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
        {digits.map((d,i)=>(
          <span key={i} className="mono" style={{
            flex:1, textAlign:'center', fontSize:34, fontWeight:700, color:'var(--txt)',
            padding:'8px 0', borderRadius:10, background:'rgba(0,0,0,0.25)',
            boxShadow:'inset 0 0 0 1px var(--line)',
            opacity: i<shown?1:0,
            animation: i<shown ? `${style==='flip'?'flipin':'popglow'} .5s cubic-bezier(.2,.9,.3,1.2) both` : 'none',
            animationDelay: `${i*0.07}s`, transformOrigin:'center',
          }}>{i<shown?d:''}</span>
        ))}
      </div>
    </div>
  );
}

window.MobileScreens2 = { ConfigScreen, LiveOrderScreen };
