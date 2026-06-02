/* components.jsx — shared UI primitives (exported to window) */
const { useState, useEffect, useRef } = React;

const fmt = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toFixed(2);
const fmtBig = (n) => n.toLocaleString('en-US');

/* ---------- icon set (simple line glyphs) ---------- */
function Icon({ name, size = 20, stroke = 'currentColor', sw = 1.7, style }) {
  const p = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search:  <><circle cx="11" cy="11" r="7" {...p}/><path d="M21 21l-4-4" {...p}/></>,
    wallet:  <><rect x="3" y="6" width="18" height="13" rx="3" {...p}/><path d="M3 10h18M16 14h2" {...p}/></>,
    clock:   <><circle cx="12" cy="12" r="8.5" {...p}/><path d="M12 7.5V12l3 2" {...p}/></>,
    home:    <><path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" {...p}/></>,
    grid:    <><rect x="4" y="4" width="7" height="7" rx="1.6" {...p}/><rect x="13" y="4" width="7" height="7" rx="1.6" {...p}/><rect x="4" y="13" width="7" height="7" rx="1.6" {...p}/><rect x="13" y="13" width="7" height="7" rx="1.6" {...p}/></>,
    gear:    <><circle cx="12" cy="12" r="3.2" {...p}/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7L5.6 5.6" {...p}/></>,
    copy:    <><rect x="9" y="9" width="11" height="11" rx="2.4" {...p}/><path d="M5 15V6a2 2 0 0 1 2-2h8" {...p}/></>,
    check:   <><path d="M4 12.5l5 5L20 6.5" {...p}/></>,
    chevR:   <><path d="M9 5l7 7-7 7" {...p}/></>,
    chevL:   <><path d="M15 5l-7 7 7 7" {...p}/></>,
    chevD:   <><path d="M5 9l7 7 7-7" {...p}/></>,
    plus:    <><path d="M12 5v14M5 12h14" {...p}/></>,
    bolt:    <><path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p}/></>,
    shield:  <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...p}/></>,
    refresh: <><path d="M20 8a8 8 0 1 0 1 5" {...p}/><path d="M21 4v4h-4" {...p}/></>,
    x:       <><path d="M6 6l12 12M18 6L6 18" {...p}/></>,
    user:    <><circle cx="12" cy="8" r="3.6" {...p}/><path d="M5 20c1.4-3.6 4-5 7-5s5.6 1.4 7 5" {...p}/></>,
    sms:     <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z" {...p}/><path d="M8 10h8M8 13h5" {...p}/></>,
    users:   <><circle cx="9" cy="8" r="3.2" {...p}/><path d="M3 19c1.2-3 3.4-4.3 6-4.3S13.8 16 15 19" {...p}/><path d="M16 5.2A3.2 3.2 0 0 1 18 11M17 14.8c2 .5 3.4 1.9 4 4.2" {...p}/></>,
    chart:   <><path d="M4 20V4M4 20h16" {...p}/><path d="M8 16l3.5-4 3 2.5L20 8" {...p}/></>,
    server:  <><rect x="4" y="4" width="16" height="7" rx="2" {...p}/><rect x="4" y="13" width="16" height="7" rx="2" {...p}/><path d="M8 7.5h.01M8 16.5h.01" {...p}/></>,
    tag:     <><path d="M3 12l8.5-8.5H20V12l-8.5 8.5z" {...p}/><circle cx="15.5" cy="8.5" r="1.4" {...p}/></>,
    logout:  <><path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M9 12h11m0 0l-3-3m3 3l-3 3" {...p}/></>,
    flag:    <><path d="M5 21V4M5 4h11l-2 4 2 4H5" {...p}/></>,
    eye:     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...p}/><circle cx="12" cy="12" r="2.8" {...p}/></>,
    lock:    <><rect x="5" y="10.5" width="14" height="10" rx="2.4" {...p}/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...p}/></>,
    phone:   <><rect x="6" y="2.5" width="12" height="19" rx="3" {...p}/><path d="M10 18.5h4" {...p}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>{paths[name]}</svg>
  );
}

/* ---------- service monogram tile ---------- */
function Monogram({ svc, size = 44, radius }) {
  const r = radius != null ? radius : Math.round(size * 0.28);
  return (
    <div className="monogram" style={{
      width: size, height: size, borderRadius: r, fontSize: size * 0.42,
      color: svc.c,
      background: `color-mix(in oklab, ${svc.c} 16%, var(--surface-2))`,
      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${svc.c} 30%, transparent)`,
    }}>{svc.name[0]}</div>
  );
}

/* ---------- country code tile ---------- */
function CC({ cc, size = 40 }) {
  return (
    <div className="monogram mono" style={{
      width: size, height: size, borderRadius: Math.round(size*0.28),
      fontSize: size*0.30, color: 'var(--txt-2)',
      background: 'var(--surface-2)', boxShadow: 'inset 0 0 0 1px var(--line)',
      letterSpacing: '0.04em',
    }}>{cc.id.toUpperCase()}</div>
  );
}

/* ---------- status badge ---------- */
function Badge({ kind, children }) {
  const map = {
    received: { c: 'var(--ok)',   bg: 'var(--ok-soft)' },
    waiting:  { c: 'var(--accent-bright)', bg: 'var(--accent-soft)' },
    expired:  { c: 'var(--txt-3)', bg: 'var(--surface-2)' },
    cancelled:{ c: 'var(--bad)',   bg: 'var(--bad-soft)' },
    healthy:  { c: 'var(--ok)',    bg: 'var(--ok-soft)' },
    degraded: { c: 'var(--warn)',  bg: 'rgba(251,191,36,0.13)' },
    down:     { c: 'var(--bad)',   bg: 'var(--bad-soft)' },
    high:     { c: 'var(--bad)',   bg: 'var(--bad-soft)' },
    med:      { c: 'var(--warn)',  bg: 'rgba(251,191,36,0.13)' },
    low:      { c: 'var(--txt-2)', bg: 'var(--surface-2)' },
    active:   { c: 'var(--ok)',    bg: 'var(--ok-soft)' },
    flagged:  { c: 'var(--warn)',  bg: 'rgba(251,191,36,0.13)' },
    banned:   { c: 'var(--bad)',   bg: 'var(--bad-soft)' },
  };
  const s = map[kind] || map.low;
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase',
      fontWeight: 600, color: s.c, background: s.bg,
      padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap',
    }}>{children || kind}</span>
  );
}

/* ---------- countdown ring ---------- */
function CountdownRing({ progress, size = 168, label, sub, color = 'var(--accent)' }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line-2)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 6px var(--accent-glow))' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {label}{sub}
      </div>
    </div>
  );
}

/* ---------- sparkline / bars ---------- */
function Bars({ data, h = 48, color = 'var(--accent)', gap = 3 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap, height: h }}>
      {data.map((d, i) => (
        <div key={i} className="sb" style={{ flex: 1, height: `${(d/max)*100}%`, background: color }}/>
      ))}
    </div>
  );
}
function Sparkline({ data, w = 120, h = 36, color = 'var(--accent-bright)' }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={h - ((data[data.length-1]-min)/(max-min||1))*(h-4)-2} r="3" fill={color}/>
    </svg>
  );
}

/* ---------- toast system ---------- */
const ToastCtx = React.createContext(() => {});
function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), t.dur || 3200);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} className="card" style={{
            animation: 'toastIn .25s ease', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 12,
            boxShadow: '0 12px 40px -12px rgba(0,0,0,0.7)', maxWidth: 340,
            borderColor: t.kind === 'ok' ? 'var(--accent-line)' : 'var(--line-2)',
          }}>
            <span style={{ color: t.kind === 'ok' ? 'var(--ok)' : t.kind === 'bad' ? 'var(--bad)' : 'var(--accent-bright)', display:'flex' }}>
              <Icon name={t.icon || (t.kind==='ok'?'check':'bolt')} size={17}/>
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => React.useContext(ToastCtx);

Object.assign(window, {
  fmt, fmtBig, Icon, Monogram, CC, Badge, CountdownRing, Bars, Sparkline,
  ToastHost, useToast,
});
