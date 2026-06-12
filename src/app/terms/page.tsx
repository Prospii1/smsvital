'use client';

import Link from 'next/link';

function Ic({ n, size = 20, stroke = 'currentColor', sw = 1.7 }: {
  n: string; size?: number; stroke?: string; sw?: number;
}) {
  const p = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    bolt:    <path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p}/>,
    chevR:   <path d="M9 5l7 7-7 7" {...p}/>,
    scroll:  <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...p}/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" {...p}/></>,
    users:   <><circle cx="9" cy="8" r="3.2" {...p}/><path d="M3 19c1.2-3 3.4-4.3 6-4.3S13.8 16 15 19" {...p}/><path d="M16 5.2A3.2 3.2 0 0 1 18 11M17 14.8c2 .5 3.4 1.9 4 4.2" {...p}/></>,
    ban:     <><circle cx="12" cy="12" r="9" {...p}/><path d="M4.93 4.93l14.14 14.14" {...p}/></>,
    wallet:  <><rect x="2" y="6" width="20" height="14" rx="2" {...p}/><path d="M16 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill={stroke}/><path d="M22 10H17a2 2 0 0 0 0 4h5" {...p}/></>,
    refresh: <><path d="M20 8a8 8 0 1 0 1 5" {...p}/><path d="M21 4v4h-4" {...p}/></>,
    alert:   <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" {...p}/><path d="M12 9v4M12 17h.01" {...p}/></>,
    shield:  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...p}/>,
    mail:    <><rect x="2" y="4" width="20" height="16" rx="2" {...p}/><path d="M2 7l10 7 10-7" {...p}/></>,
    check:   <path d="M4 12.5l5 5L20 6.5" {...p}/>,
    scale:   <><path d="M12 3v18M3 8l9-5 9 5M5 19h14" {...p}/><path d="M4 12l4 7H4zM20 12l-4 7h4z" {...p}/></>,
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

export default function TermsPage() {
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
            <Ic n="scroll" size={14} stroke="var(--accent-bright)" sw={2}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-bright)',
              fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Terms of Service
            </span>
          </div>
          <h1 style={{ margin: '0 0 18px', fontSize: 'clamp(30px, 5vw, 52px)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Plain-language rules<br/><span className="grad-text">for a fair service.</span>
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 17, color: 'var(--txt-2)', lineHeight: 1.65, maxWidth: 560 }}>
            We&apos;ve written these terms to be readable, not to trap you in legalese.
            The short version: use the service lawfully, don&apos;t abuse it, and we&apos;ll
            keep it reliable for everyone.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: 'check',   label: 'No auto-renewals' },
              { icon: 'refresh', label: 'Auto-refund on failure' },
              { icon: 'shield',  label: 'Your balance is yours' },
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

        <Section icon="scroll" title="1. Agreement to Terms">
          <P>
            By creating an account or using Smsvital (&ldquo;the Service&rdquo;), you agree to be bound
            by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service.
          </P>
          <P>
            These Terms form a legally binding agreement between you and Smsvital. We may update these Terms
            from time to time. Material changes will be communicated by email. Continued use of the Service
            after the effective date constitutes acceptance of the updated Terms.
          </P>
          <P>
            You must be at least 18 years old to create an account. By using the Service you confirm
            that you meet this requirement.
          </P>
        </Section>

        <Section icon="check" title="2. What the Service Does">
          <P>
            Smsvital provides temporary virtual phone numbers that can receive SMS messages for the purpose
            of completing verification flows on third-party platforms (such as account registration,
            two-factor authentication, and similar processes).
          </P>
          <P>Key characteristics of the Service:</P>
          <Ul items={[
            'Numbers are valid for a single-use window (approximately 10 minutes from purchase).',
            'A number may receive one or more SMS messages during the active window.',
            'Numbers cannot make or receive voice calls.',
            'Numbers cannot send outbound SMS messages.',
            'The same number is never guaranteed to be available again after it expires.',
          ]}/>
        </Section>

        <Section icon="users" title="3. Your Account">
          <P>
            You are responsible for maintaining the confidentiality of your account credentials. Do not share
            your password with others. You are responsible for all activity that occurs under your account.
          </P>
          <P>
            You must provide a valid email address when signing up. You agree to keep your email
            address current, as it is our only means of contacting you regarding your account.
          </P>
          <P>
            You must not create multiple accounts to circumvent restrictions, refund limits, or bans.
            We reserve the right to merge or close duplicate accounts.
          </P>
        </Section>

        <Section icon="ban" title="4. Prohibited Uses">
          <P>
            You may use Smsvital only for lawful purposes. The following uses are strictly prohibited and
            will result in immediate account suspension without refund:
          </P>
          <Ul items={[
            'Creating fraudulent accounts on any platform with intent to deceive, defraud, or manipulate.',
            'Using the Service to facilitate spam, phishing, or unsolicited commercial communications.',
            'Registering accounts in violation of a platform\'s own terms of service in a manner that causes harm to others.',
            'Using the Service as part of any scheme to launder money or evade financial regulation.',
            'Attempting to access, probe, or exploit the Smsvital infrastructure or its third-party dependencies.',
            'Reselling access to the Service or acting as an intermediary without written permission from Smsvital.',
            'Automating bulk purchases in a way that degrades service availability for other users.',
            'Using numbers to receive or facilitate illegal content of any kind.',
          ]}/>
          <P>
            We reserve the right to determine, in our sole discretion, whether a use violates these
            prohibitions and to act accordingly without advance notice.
          </P>
        </Section>

        <Section icon="wallet" title="5. Payments, Wallet, and Refunds">
          <P><strong style={{ color: 'var(--txt)' }}>Wallet top-ups</strong></P>
          <Ul items={[
            'Funds added to your Smsvital wallet are non-refundable to your original payment method unless required by law.',
            'The minimum top-up amount is ₦500.',
            'Top-ups are processed by TransactPay. Smsvital does not handle card or bank account data.',
            'Funds are credited to your wallet in Nigerian Naira (NGN).',
          ]}/>
          <P><strong style={{ color: 'var(--txt)' }}>Number purchases</strong></P>
          <Ul items={[
            'The price of each number is shown before you confirm the purchase.',
            'Funds are deducted from your wallet at the moment of purchase.',
            'If no SMS is received within 10 minutes of purchase, your wallet is automatically refunded the full purchase price.',
            'If you receive an SMS (even if the code does not work for your intended purpose), the purchase is considered fulfilled and no refund is issued.',
            'If a number fails to be assigned due to a system error, you are refunded immediately.',
          ]}/>
          <P><strong style={{ color: 'var(--txt)' }}>Wallet balance</strong></P>
          <Ul items={[
            'Wallet balances do not expire under normal circumstances.',
            'In the event of account closure or termination for violations, wallet balances are forfeited.',
            'If we close your account for reasons other than a violation of these Terms, we will refund your remaining wallet balance.',
          ]}/>
        </Section>

        <Section icon="refresh" title="6. Service Availability">
          <P>
            We aim to maintain high availability but do not guarantee uninterrupted access to the Service.
            Planned maintenance will be communicated in advance where possible.
          </P>
          <P>
            Number availability varies by country, service, and carrier. A number showing as &ldquo;available&rdquo;
            in the catalog may become unavailable between the time you view the price and the time you
            attempt to purchase it. In this case, your purchase will fail and you will not be charged.
          </P>
          <P>
            We are not responsible for failures in SMS delivery caused by the third-party platforms you are
            attempting to verify on, carrier-level filtering, or SMSPVA (our number supplier). In all such
            cases, the automatic 10-minute refund policy applies.
          </P>
        </Section>

        <Section icon="alert" title="7. Disclaimer of Warranties">
          <P>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranty of any kind,
            express or implied. We make no warranty that:
          </P>
          <Ul items={[
            'The Service will be available at any particular time or without interruption.',
            'Numbers will successfully receive SMS from any specific third-party platform.',
            'Verification codes received will be accepted by the platform you are verifying on.',
            'The Service will meet your particular requirements or expectations.',
          ]}/>
        </Section>

        <Section icon="scale" title="8. Limitation of Liability">
          <P>
            To the fullest extent permitted by applicable law, Smsvital shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your use of
            the Service, including but not limited to: loss of business, loss of data, lost profits,
            or damages resulting from a failure to receive an SMS verification code.
          </P>
          <P>
            Our total liability to you for any claim arising out of or relating to these Terms or the
            Service shall not exceed the total amount you paid to Smsvital in the 30 days preceding the event
            giving rise to the claim.
          </P>
        </Section>

        <Section icon="shield" title="9. Intellectual Property">
          <P>
            All content, design, code, branding, and trademarks on the Smsvital platform are owned by or
            licensed to Smsvital. You may not copy, reproduce, or use any part of the platform for commercial
            purposes without our written consent.
          </P>
          <P>
            You retain ownership of any content you provide to the Service (such as your email address).
            By using the Service, you grant Smsvital a limited license to use your information solely to
            provide the Service as described in these Terms and our Privacy Policy.
          </P>
        </Section>

        <Section icon="ban" title="10. Termination">
          <P>
            We may suspend or terminate your account at any time, with or without notice, if:
          </P>
          <Ul items={[
            'You violate these Terms or our Privacy Policy.',
            'We reasonably believe your account is being used for fraudulent or illegal activity.',
            'Your account has been inactive for more than 24 consecutive months.',
            'We discontinue the Service.',
          ]}/>
          <P>
            You may close your account at any time by contacting{' '}
            <a href="mailto:support@smsvital.com" style={{ color: 'var(--accent-bright)', textDecoration: 'none' }}>
              support@smsvital.com
            </a>.
          </P>
          <P>
            Sections 4, 7, 8, and 9 survive any termination of these Terms.
          </P>
        </Section>

        <Section icon="scroll" title="11. Governing Law">
          <P>
            These Terms are governed by and construed in accordance with the laws of the Federal Republic
            of Nigeria. Any disputes arising under or in connection with these Terms shall be subject to
            the exclusive jurisdiction of the courts of Nigeria.
          </P>
          <P>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will
            continue in full force and effect.
          </P>
        </Section>

        <Section icon="mail" title="12. Contact">
          <P>
            Questions, complaints, or legal notices can be directed to:
          </P>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 20px',
            borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Smsvital</div>
            <a href="mailto:support@smsvital.com"
              style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontSize: 14, fontFamily: 'var(--mono)' }}>
              support@smsvital.com
            </a>
          </div>
          <P>
            We aim to respond to all inquiries within 3 business days.
          </P>
        </Section>

        {/* quick-nav */}
        <div style={{ padding: '28px 32px', borderRadius: 18,
          background: 'var(--surface)', border: '1px solid var(--line)', marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Also read</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--accent-soft)', color: 'var(--accent-bright)',
              border: '1px solid var(--accent-line)', textDecoration: 'none' }}>
              <Ic n="shield" size={15} stroke="var(--accent-bright)"/>
              Privacy Policy
            </Link>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--surface-2)', color: 'var(--txt-2)',
              border: '1px solid var(--line-2)', textDecoration: 'none' }}>
              Back to home
              <Ic n="chevR" size={15}/>
            </Link>
          </div>
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
            <Link href="/terms" style={{ fontSize: 13, color: 'var(--accent-bright)', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
            <Link href="/privacy" style={{ fontSize: 13, color: 'var(--txt-3)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/" style={{ fontSize: 13, color: 'var(--txt-3)', textDecoration: 'none' }}>Home</Link>
          </div>
          <span style={{ fontSize: 13, color: 'var(--txt-3)', fontFamily: 'var(--mono)' }}>© 2026 Smsvital</span>
        </div>
      </footer>
    </div>
  );
}
