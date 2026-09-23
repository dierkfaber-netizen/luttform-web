import { useState, useEffect, useCallback } from 'react';
import { useForm, ValidationError } from '@formspree/react';

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------
const imgHero = '/images/upload-6.png';           // Gesamtansicht schräg oben
const imgVorherNachher = '/images/upload-5.png'; // Vorher/Nachher Split
const imgHoehe = '/images/upload-4.png';      // Höhenverstellung Split
const imgLifestyle = '/images/upload-3.png';   // Elternteil + Baby
const imgVerstaut = '/images/upload-2.png'; // Verstaut + freie Wanne
const imgAblage = '/images/upload-1.png';          // Ablage Detailbild

// ---------------------------------------------------------------------------
// Tracking
// ---------------------------------------------------------------------------
type TrackingEvent = 'page_view' | 'cta_click' | 'price_cta_click' | 'generate_lead' | 'price_answer';
interface TrackPayload { event: TrackingEvent; [key: string]: unknown; }

function track(payload: TrackPayload) {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(payload);
  }
  console.log('[track]', payload);
}

// ---------------------------------------------------------------------------
// UTM
// ---------------------------------------------------------------------------
function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
      .flatMap((k) => (p.has(k) ? [[k, p.get(k)!]] : []))
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

const FORMSPREE_ID = 'xqpaqpbv';
const PRICE_OPTIONS = ['unter 129 €', '129–149 €', '150–179 €', '180–219 €', 'ab 220 €'] as const;
type PriceOption = (typeof PRICE_OPTIONS)[number];

// ---------------------------------------------------------------------------
// Shared layout pieces
// ---------------------------------------------------------------------------
function SiteHeader({ showCTA, onCTA }: { showCTA?: boolean; onCTA?: (s: string) => void }) {
  return (
    <header className="border-b border-[#eae3db] flex items-center justify-between px-5 md:px-[80px] py-5 md:py-[28px]">
      <a href="/" className="font-['Instrument_Sans:Bold'] font-bold text-[#2a2827] text-[18px] md:text-[22px] leading-normal whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100' }}>
        LÜTTFORM
      </a>
      {showCTA && onCTA && <CTAButton label="Vormerken" source="header" onClick={onCTA} />}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#eae3db] flex flex-col md:flex-row items-center md:justify-between gap-4 px-5 md:px-[80px] py-8 md:py-[40px]">
      <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[13px] leading-normal"
        style={{ fontVariationSettings: '"wdth" 100' }}>
        © 2026 LÜTTFORM. Alle Rechte vorbehalten.
      </p>
      <div className="flex gap-6 items-center">
        <a href="/impressum" className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[12px] hover:text-[#2a2827] transition-colors">Impressum</a>
        <a href="/datenschutz" className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[12px] hover:text-[#2a2827] transition-colors">Datenschutz</a>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Noindex hook — injects meta tags and cleans up on unmount
// ---------------------------------------------------------------------------
function useNoindex() {
  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, follow';
    const googlebot = document.createElement('meta');
    googlebot.name = 'googlebot';
    googlebot.content = 'noindex, follow';
    document.head.appendChild(robots);
    document.head.appendChild(googlebot);
    return () => {
      document.head.removeChild(robots);
      document.head.removeChild(googlebot);
    };
  }, []);
}

// ---------------------------------------------------------------------------
// Legal page prose wrapper
// ---------------------------------------------------------------------------
function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  useNoindex();
  useEffect(() => { document.title = `${title} – LÜTTFORM`; return () => { document.title = 'LÜTTFORM'; }; }, [title]);

  return (
    <div className="bg-[#faf8f5] w-full min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 md:px-[80px] py-12 md:py-[64px]">
        <div className="max-w-[640px] mx-auto flex flex-col gap-8">
          <a href="/" className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[13px] hover:text-[#2a2827] transition-colors inline-flex items-center gap-1">
            ← Zurück
          </a>
          <h1 className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[28px] md:text-[36px] leading-[1.2]"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            {title}
          </h1>
          <div className="flex flex-col gap-6 font-['Inter:Regular'] font-normal text-[#605d5b] text-[15px] leading-[1.75]">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[14px]"
        style={{ fontVariationSettings: '"wdth" 100' }}>{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// /impressum
// ---------------------------------------------------------------------------
function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <LegalSection title="Angaben gemäß § 5 DDG">
        <p>Dierk Faber<br />Moorweg 20<br />26316 Varel<br />Deutschland</p>
      </LegalSection>
      <LegalSection title="Kontakt">
        <p>E-Mail: <a href="mailto:dierk.faber@gmail.com" className="underline hover:text-[#2a2827] transition-colors">dierk.faber@gmail.com</a></p>
      </LegalSection>
    </LegalPage>
  );
}

// ---------------------------------------------------------------------------
// /datenschutz
// ---------------------------------------------------------------------------
function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <LegalSection title="1. Verantwortlicher">
        <p>Dierk Faber<br />Moorweg 20<br />26316 Varel<br />Deutschland</p>
        <p>E-Mail: <a href="mailto:dierk.faber@gmail.com" className="underline hover:text-[#2a2827] transition-colors">dierk.faber@gmail.com</a></p>
      </LegalSection>
      <LegalSection title="2. Hosting">
        <p>Diese Website wird über Vercel bereitgestellt. Beim Aufruf der Website werden technisch erforderliche Daten verarbeitet, insbesondere IP-Adresse, Zeitpunkt des Zugriffs, Browserinformationen und aufgerufene Seiten. Die Verarbeitung erfolgt zur sicheren und zuverlässigen Bereitstellung der Website.</p>
      </LegalSection>
      <LegalSection title="3. Vormerkliste">
        <p>Wenn du dich für LÜTTFORM vormerken lässt, verarbeiten wir deine E-Mail-Adresse, um dich über die Verfügbarkeit und den Marktstart von LÜTTFORM zu informieren.</p>
        <p>Rechtsgrundlage ist deine Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, z. B. per E-Mail an <a href="mailto:dierk.faber@gmail.com" className="underline hover:text-[#2a2827] transition-colors">dierk.faber@gmail.com</a>.</p>
        <p>Deine Daten werden gelöscht, wenn sie für diesen Zweck nicht mehr benötigt werden oder du deine Einwilligung widerrufst, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
      </LegalSection>
      <LegalSection title="4. Deine Rechte">
        <p>Du hast im Rahmen der gesetzlichen Voraussetzungen insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerruf einer erteilten Einwilligung. Außerdem hast du das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren.</p>
      </LegalSection>
      <p className="text-[#aaa49e] text-[13px]">Stand: September 2026</p>
    </LegalPage>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
interface ModalProps { onClose: () => void; onSuccess: (email: string) => void; utm: Record<string, string>; }

function Modal({ onClose, onSuccess, utm }: ModalProps) {
  const [email, setEmail] = useState('');
  const [clientError, setClientError] = useState('');
  const [state, handleFormspreeSubmit] = useForm(FORMSPREE_ID);

  useEffect(() => {
    if (state.succeeded) {
      track({ event: 'generate_lead', email_domain: email.trim().split('@')[1] ?? '', ...utm });
      onSuccess(email);
    }
  }, [state.succeeded, email, utm, onSuccess]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setClientError('Bitte gib eine gültige E-Mail-Adresse ein.'); return; }
    setClientError('');
    handleFormspreeSubmit(e, {
      email: email.trim().toLowerCase(),
      signed_up_at: new Date().toISOString(),
      ...utm,
      _replyto: email.trim().toLowerCase(),
    } as any);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-[8px] w-full max-w-[480px] p-8 md:p-[48px] flex flex-col gap-6 shadow-xl relative">
        <button onClick={onClose} aria-label="Schließen"
          className="absolute top-5 right-5 text-[#aaa49e] hover:text-[#2a2827] transition-colors text-xl leading-none">✕</button>

        <div className="flex flex-col gap-2">
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[22px] md:text-[26px] leading-[1.2]"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            LÜTTFORM vormerken
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[14px] leading-[1.6]">
            Hinterlasse deine E-Mail-Adresse und wir informieren dich, sobald LÜTTFORM erhältlich ist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <div className="flex flex-col gap-2">
            <label htmlFor="modal-email"
              className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[13px] leading-normal"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              E-Mail-Adresse
            </label>
            <input id="modal-email" type="email" name="email" required autoFocus autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (clientError) setClientError(''); }}
              onBlur={() => { if (email && !isValidEmail(email)) setClientError('Bitte gib eine gültige E-Mail-Adresse ein.'); }}
              placeholder="beispiel@mail.de"
              aria-invalid={!!clientError}
              className={`bg-[#faf8f5] border font-['Inter:Regular'] font-normal text-[#2a2827] text-[14px] p-[14px] rounded-[4px] w-full outline-none transition-colors placeholder:text-[#aaa49e] ${
                clientError ? 'border-red-400' : 'border-[#eae3db] focus:border-[#3e4a3f]'}`} />
            {clientError && <p role="alert" className="font-['Inter:Regular'] text-red-500 text-[12px] leading-[1.4]">{clientError}</p>}
            <ValidationError field="email" prefix="E-Mail" errors={state.errors}
              className="font-['Inter:Regular'] text-red-500 text-[12px] leading-[1.4]" />
          </div>

          {state.errors && state.errors.length > 0 && (
            <p role="alert" className="font-['Inter:Regular'] text-red-500 text-[12px]">
              Ein Fehler ist aufgetreten. Bitte versuche es erneut.
            </p>
          )}

          <button type="submit" disabled={state.submitting}
            className="bg-[#3e4a3f] flex items-center justify-center px-[32px] py-[16px] rounded-[4px] w-full hover:bg-[#2f382f] transition-colors cursor-pointer disabled:opacity-60">
            <span className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#faf8f5] text-[15px] leading-normal"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              {state.submitting ? 'Wird eingetragen …' : 'Unverbindlich vormerken'}
            </span>
          </button>

          <p className="font-['Inter:Regular'] font-normal text-[#aaa49e] text-[11px] leading-[1.5] text-center">
            Mit dem Eintragen stimmst du zu, dass wir dich per E-Mail über die Verfügbarkeit von LÜTTFORM informieren dürfen. Keine Bestellung, keine Zahlung. Jederzeit abmeldbar.{' '}
            <a href="/datenschutz" target="_blank" rel="noopener noreferrer"
              className="underline hover:text-[#605d5b] transition-colors">Datenschutzerklärung</a>
          </p>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thank-you
// ---------------------------------------------------------------------------
function ThankYou({ onClose, utm }: { onClose: () => void; utm: Record<string, string> }) {
  const [selected, setSelected] = useState<PriceOption | null>(null);

  const handlePrice = (option: PriceOption) => {
    if (selected) return;
    setSelected(option);
    track({ event: 'price_answer', price_option: option, ...utm });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
      <div className="bg-white rounded-[8px] w-full max-w-[480px] p-8 md:p-[48px] flex flex-col gap-6 shadow-xl relative">
        <button onClick={onClose} aria-label="Schließen"
          className="absolute top-5 right-5 text-[#aaa49e] hover:text-[#2a2827] transition-colors text-xl leading-none">✕</button>

        <div className="flex flex-col gap-3">
          <p className="text-[28px]">✓</p>
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[22px] leading-[1.2]"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Danke, du bist dabei.
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[15px] leading-[1.6]">
            Wir informieren dich, sobald es Neuigkeiten zur Verfügbarkeit von LÜTTFORM gibt.
          </p>
        </div>

        <div className="border-t border-[#eae3db] pt-6 flex flex-col gap-4">
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[14px] leading-normal"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Bei welchem Preis würdest du LÜTTFORM wahrscheinlich kaufen?{' '}
            <span className="font-['Inter:Regular'] font-normal text-[#aaa49e] text-[12px]">(optional)</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PRICE_OPTIONS.map((option) => (
              <button key={option} onClick={() => handlePrice(option)} disabled={!!selected}
                className={`flex items-center justify-center px-3 py-[10px] rounded-[4px] border text-[13px] transition-colors cursor-pointer disabled:cursor-default ${
                  selected === option
                    ? 'bg-[rgba(62,74,63,0.08)] border-[#3e4a3f] text-[#3e4a3f] font-semibold'
                    : selected
                    ? 'bg-[#faf8f5] border-[#eae3db] text-[#aaa49e]'
                    : 'bg-[#faf8f5] border-[#eae3db] text-[#605d5b] hover:border-[#3e4a3f]'}`}>
                <span className="font-['Inter:Regular'] font-normal">{option}</span>
              </button>
            ))}
          </div>
          {selected && (
            <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[13px]">
              Danke für dein Feedback – das hilft uns sehr!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CTA Button
// ---------------------------------------------------------------------------
function CTAButton({ label = 'Unverbindlich vormerken', fullWidth, source, onClick }: {
  label?: string; fullWidth?: boolean; source: string; onClick: (s: string) => void;
}) {
  return (
    <button onClick={() => onClick(source)}
      className={`bg-[#3e4a3f] flex items-center justify-center px-[32px] py-[16px] rounded-[4px] hover:bg-[#2f382f] transition-colors cursor-pointer ${fullWidth ? 'w-full' : ''}`}>
      <span className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#faf8f5] text-[15px] leading-normal whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100' }}>
        {label}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Landing page (/)
// ---------------------------------------------------------------------------
function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [thankyouOpen, setThankyouOpen] = useState(false);
  const [utm] = useState(() => getUtmParams());

  useEffect(() => { track({ event: 'page_view', ...utm }); }, [utm]);

  const openModal = useCallback((source: string) => {
    track({ event: source.includes('price') ? 'price_cta_click' : 'cta_click', source, ...utm });
    setModalOpen(true);
  }, [utm]);

  const handleSuccess = useCallback(() => { setModalOpen(false); setThankyouOpen(true); }, []);
  const closeAll = useCallback(() => { setModalOpen(false); setThankyouOpen(false); }, []);

  return (
    <div className="bg-[#faf8f5] w-full min-h-screen">
      {modalOpen && <Modal onClose={closeAll} onSuccess={handleSuccess} utm={utm} />}
      {thankyouOpen && <ThankYou onClose={closeAll} utm={utm} />}

      <SiteHeader showCTA onCTA={openModal} />

      {/* ── Hero ── */}
      <section className="flex flex-col md:flex-row gap-8 md:gap-[64px] items-center px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="flex flex-col gap-5 md:gap-[28px] items-start w-full md:flex-1 order-2 md:order-1">
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase leading-normal tracking-widest"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Wickelaufsatz für die Badewanne
          </p>
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[36px] md:text-[52px] leading-[1.1]"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Wickeln, ohne Platz zu verschwenden.
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[16px] md:text-[18px] leading-[1.6]">
            Ein höhenverstellbarer Wickelaufsatz für die Badewanne – für Familien, die keinen zusätzlichen Wickeltisch brauchen.
          </p>

          {/* Mobile image */}
          <div className="md:hidden w-full h-[260px] rounded-[8px] overflow-hidden relative order-first">
            <img alt="LÜTTFORM Wickelaufsatz auf der Badewanne" className="absolute inset-0 w-full h-full object-cover" src={imgHero} />
          </div>

          <div className="flex flex-wrap gap-2">
            {['Höhenverstellbar', 'Platzsparend', 'Schnell wieder weg'].map((f) => (
              <span key={f} className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[13px] bg-[#f4efea] px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#3e4a3f] text-[15px]"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Geplanter Preis: 149 €
            </p>
            <CTAButton label="Unverbindlich vormerken" source="hero_price" onClick={openModal} fullWidth />
            <p className="font-['Inter:Regular'] font-normal text-[#aaa49e] text-[12px] leading-normal">
              Noch kein Kauf und keine Zahlung.
            </p>
          </div>
        </div>

        <div className="hidden md:block h-[500px] overflow-hidden rounded-[8px] shrink-0 w-[600px] order-2 relative">
          <img alt="LÜTTFORM Wickelaufsatz auf der Badewanne" className="absolute inset-0 w-full h-full object-cover" src={imgHero} />
        </div>
      </section>

      {/* ── Problem + Vorher/Nachher ── */}
      <section className="bg-[#f4efea] px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 max-w-[640px]">
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase tracking-widest"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Das Konzept
            </p>
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[26px] md:text-[36px] leading-[1.2]"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Kein Platz für einen Wickeltisch? Kein Problem.
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[16px] leading-[1.6]">
              LÜTTFORM nutzt den Raum über deiner Badewanne und schafft einen komfortablen Wickelplatz, ohne dauerhaft zusätzliche Stellfläche zu beanspruchen.
            </p>
          </div>

          <div className="w-full h-[220px] md:h-[440px] rounded-[8px] overflow-hidden relative">
            <img alt="Vorher: leere Badewanne – Nachher: LÜTTFORM montiert" className="absolute inset-0 w-full h-full object-cover" src={imgVorherNachher} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              { num: '01', title: 'Kein zusätzlicher Stellplatz.', sub: 'Nutzt den Raum, der ohnehin vorhanden ist.' },
              { num: '02', title: 'Auf angenehmer Höhe wickeln.', sub: 'Die Höhe lässt sich an unterschiedliche Bedürfnisse anpassen.' },
              { num: '03', title: 'Badewanne schnell wieder frei.', sub: 'LÜTTFORM lässt sich nach dem Wickeln abnehmen und platzsparend verstauen.' },
            ].map((b) => (
              <div key={b.num} className="flex flex-col gap-2">
                <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#aaa49e] text-[22px]"
                  style={{ fontVariationSettings: '"wdth" 100' }}>{b.num}</p>
                <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[16px] leading-[1.3]"
                  style={{ fontVariationSettings: '"wdth" 100' }}>{b.title}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[14px] leading-[1.5]">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Baden / Verstauen ── */}
      <section className="px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-[64px] items-center">
          <div className="w-full md:flex-1 h-[280px] md:h-[460px] rounded-[8px] overflow-hidden relative">
            <img alt="LÜTTFORM verstaut neben der freien Badewanne" className="absolute inset-0 w-full h-full object-cover" src={imgVerstaut} />
          </div>
          <div className="flex flex-col gap-5 md:flex-1">
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase tracking-widest"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Flexibilität
            </p>
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[24px] md:text-[32px] leading-[1.2]"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Wickelplatz, wenn du ihn brauchst. Badewanne, wenn du ihn nicht brauchst.
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[16px] leading-[1.6]">
              Mit wenigen Handgriffen abnehmen und platzsparend verstauen. Die Badewanne bleibt jederzeit frei nutzbar.
            </p>
          </div>
        </div>
      </section>

      {/* ── Ergonomie / Lifestyle ── */}
      <section className="bg-[#f4efea] px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-[64px] items-center">
          <div className="w-full md:flex-1 h-[280px] md:h-[460px] rounded-[8px] overflow-hidden relative">
            <img alt="Elternteil wickelt Baby auf LÜTTFORM in aufrechter Haltung" className="absolute inset-0 w-full h-full object-cover" src={imgLifestyle} />
          </div>
          <div className="flex flex-col gap-5 md:flex-1">
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase tracking-widest"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Ergonomie
            </p>
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[24px] md:text-[32px] leading-[1.2]"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Auf angenehmer Höhe wickeln.
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[16px] leading-[1.6]">
              Die einstellbare Höhe ermöglicht eine angenehmere Haltung beim Wickeln – statt sich über Bett oder niedrige Möbel zu beugen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Höhenverstellung ── */}
      <section className="px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="w-full h-[220px] md:h-[420px] rounded-[8px] overflow-hidden relative">
          <img alt="LÜTTFORM in zwei Höhenpositionen mit Verstellpfeilen" className="absolute inset-0 w-full h-full object-cover" src={imgHoehe} />
        </div>
      </section>

      {/* ── Design / Ablage ── */}
      <section className="bg-[#f4efea] px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-[64px] items-center">
          <div className="w-full md:flex-1 h-[260px] md:h-[420px] rounded-[8px] overflow-hidden relative">
            <img alt="Holzablage unter der LÜTTFORM-Wickelauflage mit Pflegeprodukten" className="absolute inset-0 w-full h-full object-cover" src={imgAblage} />
          </div>
          <div className="flex flex-col gap-5 md:flex-1">
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase tracking-widest"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Design
            </p>
            <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[24px] md:text-[32px] leading-[1.2]"
              style={{ fontVariationSettings: '"wdth" 100' }}>
              Alles Wichtige in Griffweite.
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[16px] leading-[1.6]">
              Eine dezente Ablage bietet Platz für Windeln, Tücher und Pflegeprodukte – integriert statt zusätzlich angebaut.
            </p>
          </div>
        </div>
      </section>

      {/* ── Kompatibilität ── */}
      <section className="px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="max-w-[640px] mx-auto flex flex-col gap-4 text-center items-center">
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase tracking-widest"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Kompatibilität
          </p>
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[22px] md:text-[30px] leading-[1.2]"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Passt LÜTTFORM auf unsere Badewanne?
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[16px] leading-[1.6]">
            LÜTTFORM wird für unterschiedliche Badewannenbreiten und -höhen entwickelt. Genaue Maße und einen einfachen Kompatibilitätscheck veröffentlichen wir vor Marktstart.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="bg-[#f4efea] px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="max-w-[640px] mx-auto flex flex-col gap-4 text-center items-center">
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase tracking-widest"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Unsere Geschichte
          </p>
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[22px] md:text-[30px] leading-[1.2]"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Weil wir selbst genau danach gesucht haben.
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[15px] leading-[1.7]">
            Wir haben selbst nach einem modernen Wickelaufsatz für die Badewanne gesucht – und kaum überzeugende Optionen gefunden. Aus dieser Suche entstand LÜTTFORM: ruhig gestaltet und platzbewusst gedacht.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 md:px-[80px] py-12 md:py-[80px]">
        <div className="max-w-[560px] mx-auto flex flex-col gap-6 items-center text-center">
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#605d5b] text-[11px] uppercase tracking-widest"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Jetzt vormerken
          </p>
          <p className="font-['Instrument_Sans:SemiBold'] font-semibold text-[#2a2827] text-[26px] md:text-[36px] leading-[1.2]"
            style={{ fontVariationSettings: '"wdth" 100' }}>
            Wickelplatz statt Wickeltisch.
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#605d5b] text-[16px] leading-[1.6]">
            LÜTTFORM zum geplanten Preis von <strong className="text-[#2a2827]">149 €</strong> unverbindlich vormerken.
          </p>
          <div className="flex flex-col gap-2 items-center w-full">
            <CTAButton label="Unverbindlich vormerken" source="bottom_price" onClick={openModal} fullWidth />
            <p className="font-['Inter:Regular'] font-normal text-[#aaa49e] text-[12px]">
              Noch kein Kauf und keine Zahlung. Jederzeit abmeldbar.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Router — pathname-based, no dependency
// ---------------------------------------------------------------------------
export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/impressum') return <ImpressumPage />;
  if (path === '/datenschutz') return <DatenschutzPage />;
  return <LandingPage />;
}
