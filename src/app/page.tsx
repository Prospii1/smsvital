'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SERVICES, COUNTRIES, priceFor, availFor } from '@/lib/data';
import { Monogram, fmt } from '@/components/ui/Primitives';

/* Dynamic import keeps Three.js off the server */
const Beams = dynamic(() => import('@/components/ui/Beams'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#07080b' }} />,
});

/* ── tiny icon set ── */
function Ic({ n, size = 20, stroke = 'currentColor', sw = 1.7 }: {
  n: string; size?: number; stroke?: string; sw?: number;
}) {
  const p = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    bolt:    <path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p}/>,
    check:   <path d="M4 12.5l5 5L20 6.5" {...p}/>,
    chevR:   <path d="M9 5l7 7-7 7" {...p}/>,
    chevD:   <path d="M5 9l7 7 7-7" {...p}/>,
    chevU:   <path d="M19 15l-7-7-7 7" {...p}/>,
    search:  <><circle cx="11" cy="11" r="7" {...p}/><path d="M21 21l-4-4" {...p}/></>,
    shield:  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...p}/>,
    phone:   <><rect x="6" y="2.5" width="12" height="19" rx="3" {...p}/><path d="M10 18.5h4" {...p}/></>,
    globe:   <><circle cx="12" cy="12" r="9" {...p}/><path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" {...p}/></>,
    zap:     <path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p}/>,
    users:   <><circle cx="9" cy="8" r="3.2" {...p}/><path d="M3 19c1.2-3 3.4-4.3 6-4.3S13.8 16 15 19" {...p}/><path d="M16 5.2A3.2 3.2 0 0 1 18 11M17 14.8c2 .5 3.4 1.9 4 4.2" {...p}/></>,
    lock:    <><rect x="5" y="10.5" width="14" height="10" rx="2.4" {...p}/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...p}/></>,
    refresh: <><path d="M20 8a8 8 0 1 0 1 5" {...p}/><path d="M21 4v4h-4" {...p}/></>,
    x:       <path d="M6 6l12 12M18 6L6 18" {...p}/>,
    menu:    <path d="M4 6h16M4 12h16M4 18h16" {...p}/>,
    quote:   <path d="M3 21c3-3 4-8 4-12H3m10 12c3-3 4-8 4-12h-4" {...p}/>,
    star:    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" {...p}/>,
    tag:     <><path d="M3 12l8.5-8.5H20V12l-8.5 8.5z" {...p}/><circle cx="15.5" cy="8.5" r="1.4" {...p}/></>,
    code:    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" {...p}/>,
    eye:     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...p}/><circle cx="12" cy="12" r="2.8" {...p}/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{paths[n]}</svg>;
}

/* ── animated counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      const steps = 60, dur = 1600;
      let i = 0;
      const t = setInterval(() => {
        i++;
        setVal(Math.round((i / steps) * target));
        if (i >= steps) clearInterval(t);
      }, dur / steps);
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── FAQ accordion item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 0', gap: 16, textAlign: 'left',
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--txt)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: 'var(--accent-bright)', flexShrink: 0, transition: 'transform .2s', display: 'flex',
          transform: open ? 'rotate(180deg)' : 'none' }}>
          <Ic n="chevD" size={18}/>
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20, paddingRight: 40, color: 'var(--txt-3)', fontSize: 15, lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}


/* ── testimonials ── */
const TESTIMONIALS = [
  {
    quote: "I do a lot of freelance work and need fresh accounts constantly for testing. I used to juggle physical SIM cards — now I just use Smsvital. Five dollars literally lasts me weeks.",
    name: "Adaeze C.",
    role: "Software Engineer, Lagos",
    stars: 5,
  },
  {
    quote: "Needed a US OpenAI account. Sorted it in under two minutes. At ₦2,600 I honestly expected something to go wrong — it didn't. The code came through in about 8 seconds.",
    name: "Kwame A.",
    role: "Researcher, Accra",
    stars: 5,
  },
  {
    quote: "We run regression tests that require fresh accounts. Smsvital's REST API is clean, the webhook delivery is fast, and the refund on timeout is automatic. Exactly what we needed.",
    name: "Temi B.",
    role: "Engineering Lead, Lagos",
    stars: 5,
  },
];

/* ── SVC monogram (fallback, no logo) ── */
function Mono({ name, c, size = 44 }: { name: string; c: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28), flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--mono)', fontWeight: 700, fontSize: size * 0.42, color: c,
      background: `color-mix(in oklab, ${c} 16%, var(--surface-2))`,
      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c} 30%, transparent)`,
    }}>{name[0]}</div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [catalog, setCatalog] = useState<any>(null);

  useEffect(() => {
    fetch('/api/sms/catalog').then(r => r.json()).then(setCatalog).catch(() => {});
  }, []);

  const services = catalog?.services || SERVICES;

  const numbersLive = useMemo(() => {
    if (!catalog?.prices) return null;
    return Object.values(catalog.prices as Record<string, any>).reduce((s: number, e: any) => s + (e.count ?? 0), 0);
  }, [catalog]);

  // Cheapest price per service (across all countries)
  function cheapestPrice(svc: any): number {
    if (catalog?.prices) {
      const vals = COUNTRIES.map(cc => catalog.prices[`${svc.smspvaCode}_${cc.smspvaCode}`]?.price ?? priceFor(svc, cc));
      return Math.min(...vals);
    }
    return Math.min(...COUNTRIES.map(cc => priceFor(svc, cc)));
  }

  // Top 5 cheapest combos for the price table
  const priceExamples = useMemo(() => {
    const combos: { svc: any; cc: any; price: number }[] = [];
    for (const svc of services) {
      for (const cc of COUNTRIES) {
        const entry = catalog?.prices?.[`${svc.smspvaCode}_${cc.smspvaCode}`];
        const price = entry?.price ?? priceFor(svc, cc);
        const count = entry?.count ?? availFor(svc, cc);
        if (count < 50) continue;
        combos.push({ svc, cc, price });
      }
    }
    return combos.sort((a, b) => a.price - b.price).slice(0, 5);
  }, [catalog, services]);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)', fontFamily: 'var(--sans)', overflowX: 'hidden' }}>

      {/* ══ NAV ══════════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,8,11,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px -3px var(--accent-glow)' }}>
              <Ic n="bolt" size={18} stroke="#0a0612"/>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18,
              letterSpacing: '-0.02em', color: 'var(--txt)' }}>smsvital</span>
          </Link>

          <div style={{ display: 'flex', gap: 28, flex: 1, alignItems: 'center' }} className="hide-mobile">
            <a href="#how-it-works" className="lnav">How it works</a>
            <a href="#services" className="lnav">Services</a>
            <a href="#pricing" className="lnav">Pricing</a>
            <a href="#faq" className="lnav">FAQ</a>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
            <Link href="/login" className="hide-mobile" style={{
              padding: '8px 16px', borderRadius: 9, fontSize: 14, fontWeight: 600,
              color: 'var(--txt-2)', textDecoration: 'none',
            }}>Sign in</Link>
            <Link href="/signup" style={{
              padding: '9px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700,
              background: 'var(--accent)', color: '#0a0612', textDecoration: 'none',
              boxShadow: '0 0 18px -4px var(--accent-glow)',
            }}>Get started free</Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="show-mobile" style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--txt)', padding: 4 }}>
              <Ic n={mobileMenu ? 'x' : 'menu'} size={22}/>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--line)',
            display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--bg)' }}>
            {[['#how-it-works','How it works'],['#services','Services'],['#pricing','Pricing'],['#faq','FAQ']].map(([h,l])=>(
              <a key={h} href={h} onClick={() => setMobileMenu(false)} style={{
                padding: '13px 0', color: 'var(--txt-2)', fontSize: 15, fontWeight: 500,
                textDecoration: 'none', borderBottom: '1px solid var(--line)' }}>{l}</a>
            ))}
            <Link href="/login" onClick={() => setMobileMenu(false)} style={{
              padding: '13px 0', color: 'var(--txt-2)', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        )}
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        {/* Beams background */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Beams
            beamWidth={2.5}
            beamHeight={22}
            beamNumber={10}
            lightColor="#f97316"
            speed={1.4}
            noiseIntensity={1.6}
            scale={0.18}
            rotation={18}
          />
        </div>
        {/* gradient overlay — keeps text readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(7,8,11,0.45) 0%, rgba(7,8,11,0.72) 55%, #07080b 92%)',
        }}/>

        {/* hero content */}
        <div style={{
          position: 'relative', zIndex: 1, height: '100%', maxWidth: 1160,
          margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 760 }}>
            {/* trust strip */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0,
              padding: '8px 20px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
              marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center', rowGap: 6 }}>
              {[
                { icon: 'bolt', label: 'Code in under 10s' },
                { icon: 'globe', label: `${COUNTRIES.length} countries` },
                { icon: 'lock', label: 'Zero personal info' },
              ].map(({ icon, label }, i) => (
                <span key={icon} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && <span style={{ width: 1, height: 13, background: 'rgba(255,255,255,0.15)', margin: '0 14px' }}/>}
                  <Ic n={icon} size={14} stroke="var(--accent-bright)" sw={2}/>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--txt-2)',
                    fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{label}</span>
                </span>
              ))}
            </div>

            <h1 style={{ margin: '0 0 22px', fontSize: 'clamp(36px, 6vw, 68px)',
              fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.04 }}>
              Stop handing out<br/>
              <span className="grad-text">your real number.</span>
            </h1>

            <p style={{ margin: '0 0 40px', fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--txt-2)', lineHeight: 1.65, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Get a disposable phone number for any SMS verification — WhatsApp, OpenAI, Telegram, and 600&nbsp;more.
              Your code arrives in&nbsp;under&nbsp;10&nbsp;seconds.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                padding: '15px 30px', borderRadius: 13, fontSize: 16, fontWeight: 700,
                background: 'var(--accent)', color: '#0a0612', textDecoration: 'none',
                boxShadow: '0 6px 40px -6px var(--accent-glow)',
              }}>
                Get your first number <Ic n="chevR" size={18} stroke="#0a0612"/>
              </Link>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 26px', borderRadius: 13, fontSize: 16, fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.14)', color: 'var(--txt-2)', textDecoration: 'none',
              }}>
                See how it works
              </a>
            </div>

            {/* micro-stats */}
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                [String(services.length), 'services'],
                [String(COUNTRIES.length), 'countries'],
                [numbersLive ? numbersLive.toLocaleString() : '…', 'numbers live'],
              ].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-bright)',
                    fontFamily: 'var(--mono)', letterSpacing: '-0.02em' }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══ PROBLEM ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ maxWidth: 600, marginBottom: 56 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--txt-3)', marginBottom: 14 }}>
              The real problem
            </div>
            <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(26px, 4vw, 42px)',
              fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Your real number is attached<br/>to <span className="grad-text">way too many apps.</span>
            </h2>
            <p style={{ margin: 0, color: 'var(--txt-3)', fontSize: 16, lineHeight: 1.7 }}>
              Every time you sign up for something with your real number, you're handing over
              a permanent identifier — one that's now inside a database you have no control over.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { icon: 'phone', title: 'Spam calls start immediately', body: "Your number ends up in marketing lists within hours. Unknown calls, suspicious texts — it never stops once it starts." },
              { icon: 'eye',   title: 'You become trackable', body: "A phone number is a permanent identifier. Platforms use it to track you across devices, merge your profiles, and sell the data." },
              { icon: 'lock',  title: "You can't easily leave", body: "When an account is tied to your real number, closing it doesn't remove you from their database. Your number stays on file." },
              { icon: 'shield',title: 'One breach exposes everything', body: "That fitness app you signed up for in 2022? Their database leaked. Your number is now in a spam list you didn't consent to." },
            ].map(card => (
              <div key={card.title} className="lcard" style={{
                padding: '22px', borderRadius: 16, border: '1px solid var(--line)',
                background: 'var(--surface)',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(251,111,132,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--bad)', marginBottom: 14,
                  boxShadow: 'inset 0 0 0 1px rgba(251,111,132,0.2)' }}>
                  <Ic n={card.icon} size={18}/>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 15.5, fontWeight: 700 }}>{card.title}</h3>
                <p style={{ margin: 0, color: 'var(--txt-3)', fontSize: 14, lineHeight: 1.65 }}>{card.body}</p>
              </div>
            ))}
          </div>

          {/* bridge line */}
          <div style={{ marginTop: 56, padding: '28px 32px', borderRadius: 18,
            background: 'linear-gradient(135deg, var(--accent-soft), rgba(251,115,22,0.06))',
            border: '1px solid var(--accent-line)' }}>
            <p style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, color: 'var(--txt-2)' }}>
              <span style={{ color: 'var(--accent-bright)', fontWeight: 700 }}>The fix is simple:</span>{' '}
              use a disposable number for the signup, receive the code, and forget it exists.
              Your real number never touches the app. Smsvital handles the rest.
            </p>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 24px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--txt-3)', marginBottom: 14 }}>Simple process</div>
            <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(26px, 4vw, 44px)',
              fontWeight: 800, letterSpacing: '-0.025em' }}>
              From zero to verified in <span className="grad-text">five steps</span>
            </h2>
            <p style={{ margin: 0, color: 'var(--txt-3)', fontSize: 16, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              No SIM card. No waiting. No drama. Here's exactly what happens when you use Smsvital.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 740, margin: '0 auto' }}>
            {[
              { n: '01', icon: 'search', title: 'Find the service you need to verify',
                body: "Search for the app you're signing up for — WhatsApp, OpenAI, Tinder, whatever it is. We have 600+ platforms and update the list regularly." },
              { n: '02', icon: 'globe', title: 'Pick a country',
                body: 'Numbers are from real carriers in real countries. Some platforms require a specific country. Prices vary by country, so you can pick the cheapest available option.' },
              { n: '03', icon: 'lock', title: 'Top up your wallet',
                body: 'Minimum top-up is ₦500. Pay via Flutterwave — card, bank transfer, USSD, or mobile money. Your balance is credited instantly.' },
              { n: '04', icon: 'phone', title: 'Buy the number',
                body: 'One click. A real phone number is assigned to your account immediately. Go enter it in the app you\'re trying to verify on.' },
              { n: '05', icon: 'bolt', title: 'Grab your code — usually in under 10 seconds',
                body: 'The SMS arrives in your Smsvital order screen. Copy the code, paste it into the app. Done. If no SMS arrives within 10 minutes, you\'re refunded automatically — no questions.' },
            ].map((step, i) => (
              <div key={step.n} style={{ display: 'flex', gap: 20, padding: '22px', borderRadius: 16,
                border: '1px solid var(--line)', background: 'var(--surface-2)', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0, paddingTop: 2 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--accent-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-bright)', boxShadow: 'inset 0 0 0 1px var(--accent-line)' }}>
                    <Ic n={step.icon} size={18}/>
                  </div>
                  {i < 4 && <div style={{ width: 1, height: 28, background: 'var(--line-2)', marginTop: 6 }}/>}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent-bright)',
                      fontWeight: 700, letterSpacing: '0.08em' }}>{step.n}</span>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700 }}>{step.title}</h3>
                  </div>
                  <p style={{ margin: 0, color: 'var(--txt-3)', fontSize: 14, lineHeight: 1.7 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════ */}
      <section id="services" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--txt-3)', marginBottom: 12 }}>{services.length} platforms</div>
              <h2 style={{ margin: 0, fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Popular platforms
              </h2>
            </div>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 14, fontWeight: 600, color: 'var(--accent-bright)', textDecoration: 'none' }}>
              Browse all <Ic n="chevR" size={16}/>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {services.slice(0, 24).map((svc: any, i: number) => (
              <Link key={svc.id} href="/signup" className="lcard" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)',
                textDecoration: 'none', color: 'var(--txt)', position: 'relative', overflow: 'hidden',
              }}>
                {i === 0 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 999, background: 'var(--accent-soft)',
                    color: 'var(--accent-bright)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                    Most popular
                  </div>
                )}
                <Monogram svc={svc} size={40}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{svc.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt-3)', marginTop: 2, fontFamily: 'var(--mono)' }}>
                    from {fmt(cheapestPrice(svc))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Built to actually <span className="grad-text">work reliably</span>
            </h2>
            <p style={{ margin: 0, color: 'var(--txt-3)', fontSize: 16, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              We sweat the details you shouldn't have to think about.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: 'zap',     title: 'Under 10 seconds, every time',
                body: "Numbers are pre-provisioned. When you buy, you're not waiting for a slow API. Average SMS delivery is 8–9 seconds, measured across millions of orders." },
              { icon: 'refresh', title: 'Automatic refund, no forms',
                body: "If your SMS doesn't arrive within 10 minutes, your wallet is credited back automatically. No support tickets. No waiting. It just happens." },
              { icon: 'globe',   title: '150+ countries, real carriers',
                body: "Numbers come from genuine mobile network operators and licensed MVNOs. Not VoIP numbers that get flagged — real SIM-based lines." },
              { icon: 'shield',  title: 'Just an email to sign up',
                body: "We don't ask for your name, address, or real phone number. An email is all you need. Your identity stays separate from every number you buy." },
              { icon: 'code',    title: 'Developer-ready REST API',
                body: "Full API with webhooks for code delivery. Automate number purchasing, receive SMS events in real time. Ideal for QA test suites and account automation." },
              { icon: 'star',    title: 'Pay your way, no subscription',
                body: "No monthly fee. No minimum spend. Top up what you need via Flutterwave — debit card, bank transfer, USSD, or mobile money. Pay per use." },
            ].map(f => (
              <div key={f.title} className="lcard" style={{
                padding: '26px', borderRadius: 18, border: '1px solid var(--line)', background: 'var(--surface)',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--accent-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-bright)', marginBottom: 16,
                  boxShadow: 'inset 0 0 0 1px var(--accent-line)' }}>
                  <Ic n={f.icon} size={20}/>
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: 16.5, fontWeight: 700 }}>{f.title}</h3>
                <p style={{ margin: 0, color: 'var(--txt-3)', fontSize: 14, lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', background: 'var(--surface)',
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, textAlign: 'center' }}>
          {[
            { target: numbersLive ?? 0, suffix: '+', label: 'Active numbers right now' },
            { target: services.length,  suffix: '',  label: 'Supported platforms' },
            { target: COUNTRIES.length, suffix: '',  label: 'Countries covered' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: 'var(--accent-bright)',
                fontFamily: 'var(--mono)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                <Counter target={s.target} suffix={s.suffix}/>
              </div>
              <div style={{ fontSize: 14, color: 'var(--txt-3)', marginTop: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--txt-3)', marginBottom: 14 }}>Real users</div>
            <h2 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              What people actually say
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="lcard" style={{
                padding: '28px', borderRadius: 18, border: '1px solid var(--line)', background: 'var(--surface)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                {/* stars */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} style={{ color: '#fbbf24' }}><Ic n="star" size={14} stroke="#fbbf24" sw={1.5}/></span>
                  ))}
                </div>
                <p style={{ margin: 0, color: 'var(--txt-2)', fontSize: 15, lineHeight: 1.75, flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4,
                  borderTop: '1px solid var(--line)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-bright)', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 15 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt-3)', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* left: copy */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--txt-3)', marginBottom: 14 }}>Transparent pricing</div>
            <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Pay per use.<br/><span className="grad-text">No subscription ever.</span>
            </h2>
            <p style={{ margin: '0 0 28px', color: 'var(--txt-3)', fontSize: 16, lineHeight: 1.7 }}>
              Prices vary by platform and country. You see the exact price before you pay — no surprises.
              The cost covers the real carrier number rental plus our operating fee.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {[
                ["Numbers start at", "₦ 200"],
                ["Minimum top-up",   "₦ 500"],
                ["Refund on failure","100% automatic"],
                ["Monthly fee",      "None, ever"],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 14.5, color: 'var(--txt-3)' }}>{l}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14.5,
                    color: v === 'None, ever' ? 'var(--ok)' : v === '100% automatic' ? 'var(--ok)' : 'var(--accent-bright)' }}>{v}</span>
                </div>
              ))}
            </div>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 26px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: 'var(--accent)', color: '#0a0612', textDecoration: 'none',
              boxShadow: '0 4px 24px -6px var(--accent-glow)' }}>
              Get started free <Ic n="chevR" size={17} stroke="#0a0612"/>
            </Link>
          </div>

          {/* right: example prices table */}
          <div className="card" style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid var(--line)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--txt-3)', textTransform: 'uppercase' }}>Example prices</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Service', 'Country', 'Price'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11,
                      fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--txt-3)',
                      fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {priceExamples.map(({ svc, cc, price }, i) => (
                  <tr key={svc.id + cc.id} className="trow" style={{ borderBottom: i < priceExamples.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Monogram svc={svc} size={28}/>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{svc.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--txt-3)', fontSize: 13.5 }}>
                      {cc.name}
                      {i === 0 && <span style={{ display: 'block', fontSize: 11, color: 'var(--accent-bright)', marginTop: 2 }}>Cheapest option</span>}
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'var(--mono)', fontWeight: 700,
                      fontSize: 15, color: 'var(--accent-bright)' }}>{fmt(price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '14px 20px', background: 'var(--surface-2)', borderTop: '1px solid var(--line)',
              fontSize: 12.5, color: 'var(--txt-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ic n="refresh" size={14} stroke="var(--ok)"/>
              <span>Full refund if no SMS arrives within 10 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: '0 24px 100px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--txt-3)', marginBottom: 14 }}>Questions</div>
            <h2 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Honest answers
            </h2>
          </div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 18, background: 'var(--surface)', overflow: 'hidden', padding: '0 28px' }}>
            {[
              { q: "Is this legal?",
                a: "Yes. Receiving SMS on virtual numbers is legal in virtually every country. It's the same technology businesses use for two-factor authentication, customer verification, and testing. There's nothing illegal about using a virtual number to receive a text." },
              { q: "Will the number actually work for the platform I need?",
                a: "All numbers in our pool are from real mobile carriers and licensed MVNOs — not VoIP lines that platforms flag. Our overall success rate is above 92%. If it doesn't work, you get a full refund automatically." },
              { q: "What if I don't receive a code?",
                a: "If no SMS arrives within 10 minutes, your wallet is refunded automatically. No forms, no support tickets, no waiting. It just happens. You can then try a different country or service." },
              { q: "What payment methods do you accept?",
                a: "We use Flutterwave, which supports debit and credit cards (Visa, Mastercard), Nigerian bank transfers, USSD codes, and mobile money across Africa. Funds are credited to your wallet instantly after payment." },
              { q: "Do I have to give you my real name or phone number?",
                a: "No. You sign up with just an email address. We don't ask for your real name, address, or phone number. Your identity is completely separate from every number you purchase." },
              { q: "Can I use this via API?",
                a: "Yes. We have a full REST API with webhook delivery for verification codes. Contact us for API access details. It's used by developers for QA test suites, account management automation, and research." },
              { q: "How long does the number stay active?",
                a: "Numbers are assigned for a 10-minute window — long enough to receive your verification SMS. You can request additional SMS within that window if needed (e.g. if you need to resend the code)." },
            ].map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', textAlign: 'center',
        background: 'var(--surface)', borderTop: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 500, borderRadius: '50%',
          filter: 'blur(90px)', background: 'var(--accent-soft)', top: '-15%', left: '50%',
          transform: 'translateX(-50%)', pointerEvents: 'none', opacity: 0.7 }}/>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--txt-3)', marginBottom: 20 }}>Ready when you are</div>
          <h2 style={{ margin: '0 0 18px', fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Your next verification<br/>
            <span className="grad-text">takes 30 seconds.</span>
          </h2>
          <p style={{ margin: '0 0 40px', color: 'var(--txt-2)', fontSize: 17, lineHeight: 1.65 }}>
            Free account. No credit card to sign up. Top up when you're ready,
            and get your first number for as little as $0.17.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '16px 34px', borderRadius: 14, fontSize: 17, fontWeight: 800,
              background: 'var(--accent)', color: '#0a0612', textDecoration: 'none',
              boxShadow: '0 8px 48px -8px var(--accent-glow)' }}>
              Create free account <Ic n="chevR" size={20} stroke="#0a0612"/>
            </Link>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--txt-3)' }}>
            Already have one?{' '}
            <Link href="/login" style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '56px 24px 36px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 52, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic n="bolt" size={16} stroke="#0a0612"/>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 16, color: 'var(--txt)', letterSpacing: '-0.02em' }}>smsvital</span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--txt-3)', lineHeight: 1.7, maxWidth: 280 }}>
                Instant disposable numbers for SMS verification. Private, fast, and refund-guaranteed.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['shield','Private by design'],['refresh','Auto-refund'],['lock','No data stored']].map(([ic,l])=>(
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 8, background: 'var(--surface-2)',
                    fontSize: 11.5, color: 'var(--txt-3)' }}>
                    <Ic n={ic} size={12}/>{l}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Browse services','How it works','Pricing','API docs','Changelog'] },
              { title: 'Company', links: ['About us','Blog','Careers','Contact','Status'] },
              { title: 'Legal',   links: ['Privacy policy','Terms of service','Refund policy','Cookie policy'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--txt-2)', marginBottom: 16,
                  textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontSize: 14, color: 'var(--txt-3)', textDecoration: 'none',
                      transition: 'color .15s' }} className="lnav">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 28,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--txt-3)', fontFamily: 'var(--mono)' }}>
              © 2026 Smsvital. All rights reserved.
            </span>
            <span style={{ fontSize: 13, color: 'var(--txt-3)' }}>
              Payments powered by <strong style={{ color: 'var(--txt-2)' }}>Flutterwave</strong>
            </span>
          </div>
        </div>
      </footer>

      {/* ── responsive helpers ── */}
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        @media (max-width: 900px) {
          #pricing > div > div { grid-template-columns: 1fr !important; }
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
