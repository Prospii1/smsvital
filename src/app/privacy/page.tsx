'use client';

import Link from 'next/link';

function Ic({ n, size = 20, stroke = 'currentColor', sw = 1.7 }: {
  n: string; size?: number; stroke?: string; sw?: number;
}) {
  const p = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    bolt:   <path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p}/>,
    chevR:  <path d="M9 5l7 7-7 7" {...p}/>,
    shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...p}/>,
    lock:   <><rect x="5" y="10.5" width="14" height="10" rx="2.4" {...p}/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...p}/></>,
    eye:    <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...p}/><circle cx="12" cy="12" r="2.8" {...p}/></>,
    mail:   <><rect x="2" y="4" width="20" height="16" rx="2" {...p}/><path d="M2 7l10 7 10-7" {...p}/></>,
    trash:  <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" {...p}/></>,
    globe:  <><circle cx="12" cy="12" r="9" {...p}/><path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" {...p}/></>,
    server: <><rect x="2" y="3" width="20" height="5" rx="1" {...p}/><rect x="2" y="10" width="20" height="5" rx="1" {...p}/><rect x="2" y="17" width="20" height="4" rx="1" {...p}/></>,
    check:  <path d="M4 12.5l5 5L20 6.5" {...p}/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{paths[n]}</svg>;
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 52 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-bright)', boxShadow: 'inset 0 0 0 1px var(--accent-line)', flexShrink: 0 }}>
          <Ic n={icon} size={18}/>
        </div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em' }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: 50, color: 'var(--txt-3)', fontSize: 15, lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 16px' }}>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '0 0 16px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ paddingLeft: 4 }}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  const lastUpdated = 'June 12, 2026';

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,8,11,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px -3px var(--accent-glow)' }}>
              <Ic n="bolt" size={18} stroke="#0a0612"/>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18,
              letterSpacing: '-0.02em', color: 'var(--txt)' }}>smsvital</span>
          </Link>
          <div style={{ flex: 1 }}/>
          <Link href="/signup" style={{ padding: '9px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700,
            background: 'var(--accent)', color: '#0a0612', textDecoration: 'none',
            boxShadow: '0 0 18px -4px var(--accent-glow)' }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '72px 24px 64px',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
        position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 400, borderRadius: '50%',
          filter: 'blur(90px)', background: 'var(--accent-soft)', top: '-20%', left: '50%',
          transform: 'translateX(-50%)', pointerEvents: 'none', opacity: 0.6 }}/>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
            marginBottom: 24 }}>
            <Ic n="shield" size={14} stroke="var(--accent-bright)" sw={2}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-bright)',
              fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Privacy Policy
            </span>
          </div>
          <h1 style={{ margin: '0 0 18px', fontSize: 'clamp(30px, 5vw, 52px)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            We take your privacy<br/><span className="grad-text">seriously.</span>
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 17, color: 'var(--txt-2)', lineHeight: 1.65, maxWidth: 560 }}>
            Smsvital was built on a simple idea: you should be able to verify accounts without
            handing over your identity. That principle extends to how we handle your data too.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: 'shield', label: 'No real name required' },
              { icon: 'trash',  label: 'No data sold, ever' },
              { icon: 'lock',   label: 'Minimal data collection' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 9, background: 'var(--surface-2)',
                border: '1px solid var(--line-2)', fontSize: 13, color: 'var(--txt-2)', fontWeight: 500 }}>
                <Ic n={icon} size={14} stroke="var(--ok)"/>
                {label}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, fontSize: 13, color: 'var(--txt-3)', fontFamily: 'var(--mono)' }}>
            Last updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 100px' }}>

        <Section icon="globe" title="Who We Are">
          <P>
            Smsvital is an online platform that provides disposable virtual phone numbers for the purpose of receiving
            SMS verification codes. We are operated by Smsvital (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
          </P>
          <P>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@smsvital.com" style={{ color: 'var(--accent-bright)', textDecoration: 'none' }}>
              support@smsvital.com
            </a>.
          </P>
        </Section>

        <Section icon="eye" title="What Information We Collect">
          <P>We collect only the minimum information needed to operate the service:</P>
          <P><strong style={{ color: 'var(--txt)' }}>Account information</strong></P>
          <Ul items={[
            'Email address — required to create your account and send transactional emails (payment receipts, password resets).',
            'Password — stored as a one-way cryptographic hash (bcrypt via Supabase Auth). We cannot read your password.',
          ]}/>
          <P><strong style={{ color: 'var(--txt)' }}>Transaction and usage data</strong></P>
          <Ul items={[
            'Wallet top-up amounts and the payment reference issued by our payment processor.',
            'Records of numbers purchased: the service name, country, price paid, and timestamp.',
            'SMS verification codes received on numbers you purchased — visible only to you and automatically deleted when the order expires.',
          ]}/>
          <P><strong style={{ color: 'var(--txt)' }}>Technical data</strong></P>
          <Ul items={[
            'IP address — logged at the server level for security monitoring and rate limiting. Not linked to your profile.',
            'Standard HTTP request metadata (browser type, referring page) — collected in server logs, not stored in your account.',
          ]}/>
          <P>
            We do <strong style={{ color: 'var(--txt)' }}>not</strong> collect your real name, physical address, date of birth,
            or any government-issued identification. You are identified solely by your email address.
          </P>
        </Section>

        <Section icon="server" title="How We Use Your Information">
          <P>We use your information only to:</P>
          <Ul items={[
            'Provide and operate the Smsvital service, including processing payments and delivering virtual numbers.',
            'Send transactional emails you explicitly trigger: account confirmation, password reset, payment receipts.',
            'Detect and prevent fraud, abuse, and violations of our Terms of Service.',
            'Comply with applicable laws and respond to lawful requests from authorities.',
            'Maintain and improve service reliability and performance.',
          ]}/>
          <P>
            We do <strong style={{ color: 'var(--txt)' }}>not</strong> use your data for advertising,
            analytics profiling, or any form of marketing targeting. We do not sell, rent, or share
            your personal data with third parties for their own marketing purposes.
          </P>
        </Section>

        <Section icon="lock" title="Data Storage and Security">
          <P>
            Your account data is stored in Supabase, a cloud database provider with SOC 2 Type II certification.
            All data is encrypted at rest and in transit (TLS 1.2+).
          </P>
          <P>
            Access to your account data is restricted by Row-Level Security (RLS) policies — meaning database
            queries automatically enforce that you can only ever read your own records.
          </P>
          <P>
            Payment processing is handled by TransactPay. We do not store card numbers, bank account details,
            or any raw payment credentials on our servers. All payment data is handled entirely within TransactPay&apos;s
            PCI-compliant environment.
          </P>
          <P>
            Despite our best efforts, no system is 100% secure. In the event of a data breach affecting your
            personal information, we will notify you by email within 72 hours of becoming aware of the incident.
          </P>
        </Section>

        <Section icon="globe" title="Third-Party Services">
          <P>We share data with the following third parties only to the extent necessary to operate the service:</P>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {[
              { name: 'Supabase',    role: 'Database and authentication hosting',   url: 'supabase.com/privacy' },
              { name: 'TransactPay', role: 'Payment processing',                    url: 'transactpay.ai' },
              { name: 'SMSPVA',      role: 'Virtual number and SMS delivery',        url: 'smspva.com' },
              { name: 'Vercel',      role: 'Application hosting and serverless infrastructure', url: 'vercel.com/legal/privacy-policy' },
            ].map(tp => (
              <div key={tp.name} style={{ display: 'flex', gap: 14, padding: '14px 18px',
                borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, color: 'var(--accent-bright)' }}>
                  {tp.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--txt)', fontSize: 14 }}>{tp.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--txt-3)', marginTop: 2 }}>{tp.role}</div>
                </div>
              </div>
            ))}
          </div>
          <P>
            Each third party has their own privacy policy governing how they handle data.
            We encourage you to review them if you have concerns.
          </P>
        </Section>

        <Section icon="mail" title="Emails We Send You">
          <P>We send only the following transactional emails — no newsletters, no marketing:</P>
          <Ul items={[
            'Account confirmation email when you sign up.',
            'Password reset email when you request one.',
            'Payment receipt when a top-up is successfully processed.',
            'Security notices in the event of suspicious activity on your account.',
          ]}/>
          <P>
            All transactional emails can be identified by the sender address{' '}
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--txt)' }}>noreply@smsvital.com</span>.
            If you receive marketing emails claiming to be from Smsvital, please report them to{' '}
            <a href="mailto:support@smsvital.com" style={{ color: 'var(--accent-bright)', textDecoration: 'none' }}>
              support@smsvital.com
            </a>.
          </P>
        </Section>

        <Section icon="trash" title="Data Retention and Deletion">
          <P>We retain your data for as long as your account is active. Specifically:</P>
          <Ul items={[
            'SMS codes received on virtual numbers are deleted automatically when the order expires (within 10 minutes of purchase).',
            'Transaction history is retained for 24 months to support dispute resolution and regulatory compliance.',
            'Server logs containing IP addresses are retained for 30 days and then purged.',
            'Account data (email, balance) is retained until you request account deletion.',
          ]}/>
          <P>
            To delete your account and all associated data, email{' '}
            <a href="mailto:support@smsvital.com" style={{ color: 'var(--accent-bright)', textDecoration: 'none' }}>
              support@smsvital.com
            </a>{' '}
            with the subject line &ldquo;Account Deletion Request&rdquo;. We will process your request within 14 business days.
            Note that we may retain some transaction records for the minimum period required by applicable law.
          </P>
        </Section>

        <Section icon="shield" title="Your Rights">
          <P>Depending on your location, you may have the following rights regarding your personal data:</P>
          <Ul items={[
            'Access — request a copy of the personal data we hold about you.',
            'Correction — request that we correct inaccurate data.',
            'Deletion — request deletion of your personal data.',
            'Portability — request your data in a machine-readable format.',
            'Objection — object to processing of your data in certain circumstances.',
          ]}/>
          <P>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:support@smsvital.com" style={{ color: 'var(--accent-bright)', textDecoration: 'none' }}>
              support@smsvital.com
            </a>.
            We will respond within 30 days.
          </P>
        </Section>

        <Section icon="check" title="Cookies">
          <P>
            Smsvital uses only strictly necessary cookies. We use a session cookie to keep you logged in,
            and a short-lived cookie to protect against CSRF attacks. We do not use advertising cookies,
            analytics cookies, or any third-party tracking cookies.
          </P>
          <P>
            Because we only use strictly necessary cookies, no cookie consent banner is displayed.
            Disabling cookies entirely will prevent you from staying logged in to your account.
          </P>
        </Section>

        <Section icon="globe" title="Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. When we make material changes, we will
            notify you by email and update the &ldquo;Last updated&rdquo; date at the top of this page.
            Your continued use of Smsvital after the effective date of changes constitutes acceptance
            of the revised policy.
          </P>
        </Section>

        {/* contact card */}
        <div style={{ padding: '28px 32px', borderRadius: 18,
          background: 'linear-gradient(135deg, var(--accent-soft), rgba(251,115,22,0.04))',
          border: '1px solid var(--accent-line)', marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Questions about your privacy?</div>
          <p style={{ margin: '0 0 18px', color: 'var(--txt-3)', fontSize: 14, lineHeight: 1.6 }}>
            We&apos;re a small team and we actually read every email. If something in this policy is unclear
            or you want to exercise any of your rights, reach out directly.
          </p>
          <a href="mailto:support@smsvital.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px',
              borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'var(--accent)', color: '#0a0612', textDecoration: 'none' }}>
            <Ic n="mail" size={15} stroke="#0a0612"/>
            support@smsvital.com
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '36px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ic n="bolt" size={14} stroke="#0a0612"/>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 15, color: 'var(--txt)', letterSpacing: '-0.02em' }}>
              smsvital
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <Link href="/terms" style={{ fontSize: 13, color: 'var(--txt-3)', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/privacy" style={{ fontSize: 13, color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
            <Link href="/" style={{ fontSize: 13, color: 'var(--txt-3)', textDecoration: 'none' }}>Home</Link>
          </div>
          <span style={{ fontSize: 13, color: 'var(--txt-3)', fontFamily: 'var(--mono)' }}>© 2026 Smsvital</span>
        </div>
      </footer>
    </div>
  );
}
