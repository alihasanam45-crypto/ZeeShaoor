"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload, ArrowRight, ArrowLeft, ShieldCheck, X } from "lucide-react";
import { registerInstitution, type AuthFormState } from "@/actions/auth";
import { ThemeToggle } from "../landing-parts";

const initialState: AuthFormState = { status: "idle", message: "" };

const STEPS = [
  { n: 1, label: "Account" },
  { n: 2, label: "Institution" },
  { n: 3, label: "Branding" },
  { n: 4, label: "Security" },
];

const ROLES = [
  "School owner",
  "Principal",
  "Administrator",
  "Examination controller",
  "Teacher",
  "Academy owner",
  "Other",
];

const INSTITUTION_TYPES = [
  "School",
  "College",
  "Academy",
  "University",
  "Coaching centre",
  "Training institute",
  "Other",
];

const TEMPLATES = [
  { id: "classic", name: "Classic academic" },
  { id: "minimal", name: "Modern minimal" },
  { id: "board", name: "Official board style" },
];

const WATERMARK_TYPES = [
  "Center logo",
  "Diagonal logo and name",
  "Repeated micro-watermark",
  "Institution name only",
];

const MFA_METHODS = [
  { id: "authenticator", label: "Authenticator app", note: "Recommended — works offline" },
  { id: "email", label: "Email verification", note: "A code sent to your inbox" },
  { id: "later", label: "Set up later", note: "You can enable this anytime from settings" },
];

const BENEFITS = [
  "Institution-branded documents",
  "Secure approval workflows",
  "QR and document verification",
  "AI-assisted paper quality checks",
];

const TRUST = [
  "Secure institution workspace",
  "Role-based access",
  "Traceable document activity",
];

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerInstitution, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // Branding studio + extra profile fields — UI only until the backend
  // supports them. None of these have a `name`, so they are never sent
  // with the real form submission.
  const [role, setRole] = useState(ROLES[0]);
  const [institutionType, setInstitutionType] = useState(INSTITUTION_TYPES[0]);
  const [institutionNamePreview, setInstitutionNamePreview] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#087A55");
  const [accentColor, setAccentColor] = useState("#D6AD32");
  const [headerTemplate, setHeaderTemplate] = useState("classic");
  const [watermarkType, setWatermarkType] = useState(WATERMARK_TYPES[0]);
  const [watermarkOpacity, setWatermarkOpacity] = useState(8);
  const [mfaMethod, setMfaMethod] = useState("later");

  useEffect(() => {
    if (state.status !== "success") return;
    const t = setTimeout(() => router.replace("/login"), 1800);
    return () => clearTimeout(t);
  }, [state.status, router]);

  const fieldErrors = state.fieldErrors ?? {};

  function validateStep(n: number) {
    const stepEl = formRef.current?.querySelector(`[data-step="${n}"]`);
    if (!stepEl) return true;
    const inputs = stepEl.querySelectorAll("input[required], select[required]");
    for (const el of Array.from(inputs)) {
      const input = el as HTMLInputElement;
      if (!input.checkValidity()) {
        input.reportValidity();
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    const next = Math.min(step + 1, 4);
    setStep(next);
    setMaxStepReached((m) => Math.max(m, next));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function goToStep(n: number) {
    if (n <= maxStepReached) setStep(n);
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        precedence="high"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap"
      />
      <style href="zs-wizard" precedence="high">{WIZ_CSS}</style>

      <div className="zw">
        <div className="zw-theme-fixed"><ThemeToggle /></div>
        {/* ================= LEFT BRAND PANEL ================= */}
        <aside className="zw-brand">
          <div className="zw-brand-glow" aria-hidden />

          <div className="zw-brand-top">
            <div className="zw-brand-mark">
              <img src="/logo.png" alt="" className="zw-logo-img" />
              <span className="zw-brand-word">ZeeShaoor<span className="zw-tld">.Pk</span></span>
            </div>
            <p className="zw-tagline">Awakening intellect, anchoring truth</p>
          </div>

          <div className="zw-brand-mid">
            <h1>Create secure, institution-branded examination papers.</h1>
            <p className="zw-brand-sub">
              Generate, review, approve and verify professional question papers
              from one protected workspace.
            </p>

            <ul className="zw-benefits">
              {BENEFITS.map((b) => (
                <li key={b}>
                  <Check aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* live paper preview — reflects branding studio choices */}
            <div className="zw-preview" style={{ borderColor: primaryColor }}>
              <div className="zw-preview-head">
                <div className="zw-preview-logo" style={{ borderColor: primaryColor }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="" />
                  ) : (
                    <span style={{ color: primaryColor }}>Logo</span>
                  )}
                </div>
                <div>
                  <p className="zw-preview-inst">
                    {institutionNamePreview || "Your institution name"}
                  </p>
                  <p className="zw-preview-meta">Branch · Annual examination 2026</p>
                </div>
              </div>
              <div className="zw-preview-rule" />
              <p className="zw-preview-title">Physics — Class 9</p>
              <div className="zw-preview-grid">
                <span>Class 9</span>
                <span>Time — 2:30 hrs</span>
                <span>Marks — 60</span>
              </div>
              <div className="zw-preview-water" style={{ opacity: watermarkOpacity / 100, color: primaryColor }}>
                {institutionNamePreview || "ZeeShaoor"}
              </div>
              <div className="zw-preview-foot">
                <span className="zw-mono">Doc. ID — ZS-PAK-2026-1045</span>
                <span className="zw-preview-qr" style={{ borderColor: accentColor }}>QR</span>
              </div>
              <div className="zw-preview-sign">
                <span>Prepared by</span>
                <span>Approved by</span>
              </div>
            </div>

            <ul className="zw-trust">
              {TRUST.map((t) => (
                <li key={t}>
                  <ShieldCheck aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="zw-brand-foot">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/#contact">Help</a>
            <span>© {new Date().getFullYear()} ZeeShaoor.Pk</span>
          </div>
        </aside>

        {/* ================= RIGHT ONBOARDING PANEL ================= */}
        <main className="zw-main">
          <div className="zw-mobile-head">
            <img src="/logo.png" alt="" className="zw-logo-img" />
            <span className="zw-brand-word">ZeeShaoor<span className="zw-tld">.Pk</span></span>
            <span className="zw-mobile-step">Step {step} of 4</span>
          </div>

          <nav className="zw-stepper" aria-label="Onboarding progress">
            {STEPS.map((s, i) => {
              const done = s.n < step;
              const active = s.n === step;
              const reachable = s.n <= maxStepReached;
              return (
                <button
                  key={s.n}
                  type="button"
                  className={`zw-step${active ? " zw-step-active" : ""}${done ? " zw-step-done" : ""}`}
                  onClick={() => goToStep(s.n)}
                  disabled={!reachable}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="zw-step-dot">{done ? <Check aria-hidden /> : s.n}</span>
                  <span className="zw-step-label">{s.label}</span>
                  {i < STEPS.length - 1 && <span className="zw-step-line" aria-hidden />}
                </button>
              );
            })}
          </nav>

          <form ref={formRef} action={formAction} className="zw-form">
            {state.status === "error" && <div className="zw-msg zw-msg-error">{state.message}</div>}
            {state.status === "success" && (
              <div className="zw-msg zw-msg-success">{state.message} Redirecting to login…</div>
            )}

            {/* ---------------- STEP 1 — ACCOUNT ---------------- */}
            <div data-step="1" style={{ display: step === 1 ? "block" : "none" }}>
              <p className="zw-eyebrow"><i />Step 1 of 4</p>
              <h2>Create your institution workspace</h2>
              <p className="zw-lede">Set up a secure, branded environment for your examination team.</p>

              <div className="zw-grid-2">
                <div className="zw-field">
                  <label>Full name</label>
                  <input name="ownerName" placeholder="e.g. Ali Hasan" required disabled={pending} />
                  {fieldErrors.ownerName && <p className="zw-field-err">{fieldErrors.ownerName}</p>}
                </div>
                <div className="zw-field">
                  <label>Professional role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} disabled={pending}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="zw-field">
                <label>Email address</label>
                <input type="email" name="email" placeholder="name@school.edu.pk" required disabled={pending} autoComplete="email" />
                {fieldErrors.email && <p className="zw-field-err">{fieldErrors.email}</p>}
              </div>

              <div className="zw-field">
                <label>Phone number</label>
                <div className="zw-phone">
                  <span className="zw-phone-code">+92</span>
                  <input name="phone" placeholder="03XX-XXXXXXX" required disabled={pending} />
                </div>
                {fieldErrors.phone && <p className="zw-field-err">{fieldErrors.phone}</p>}
              </div>

              <div className="zw-grid-2">
                <div className="zw-field">
                  <label>Password</label>
                  <input type="password" name="password" placeholder="••••••••" required disabled={pending} minLength={8} autoComplete="new-password" />
                  {fieldErrors.password && <p className="zw-field-err">{fieldErrors.password}</p>}
                </div>
                <div className="zw-field">
                  <label>Confirm password</label>
                  <input type="password" name="confirmPassword" placeholder="••••••••" required disabled={pending} autoComplete="new-password" />
                  {fieldErrors.confirmPassword && <p className="zw-field-err">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              <label className="zw-check">
                <input type="checkbox" required />
                <span>I agree to the <a href="/terms">terms of service</a> and <a href="/privacy">privacy policy</a></span>
              </label>

              <div className="zw-actions">
                <span />
                <button type="button" className="zw-btn zw-btn-solid" onClick={goNext}>
                  Continue to institution <ArrowRight aria-hidden />
                </button>
              </div>
              <p className="zw-alt">Already have an account? <span onClick={() => router.push("/login")}>Sign in</span></p>
            </div>

            {/* ---------------- STEP 2 — INSTITUTION ---------------- */}
            <div data-step="2" style={{ display: step === 2 ? "block" : "none" }}>
              <p className="zw-eyebrow"><i />Step 2 of 4</p>
              <h2>Tell us about your institution</h2>
              <p className="zw-lede">Only the essentials are required — the rest can be completed later from settings.</p>

              <div className="zw-grid-2">
                <div className="zw-field">
                  <label>Institution name</label>
                  <input
                    name="institutionName"
                    placeholder="e.g. ZeeShaoor Sci Academy"
                    required
                    disabled={pending}
                    onChange={(e) => setInstitutionNamePreview(e.target.value)}
                  />
                  {fieldErrors.institutionName && <p className="zw-field-err">{fieldErrors.institutionName}</p>}
                </div>
                <div className="zw-field">
                  <label>Institution type</label>
                  <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} disabled={pending}>
                    {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="zw-field">
                <label>Branch / campus address</label>
                <input name="branchAddress" placeholder="e.g. Main Campus, Lahore" required disabled={pending} />
                {fieldErrors.branchAddress && <p className="zw-field-err">{fieldErrors.branchAddress}</p>}
              </div>

              <div className="zw-grid-2">
                <div className="zw-field">
                  <label>City</label>
                  <input placeholder="Lahore" disabled={pending} />
                </div>
                <div className="zw-field">
                  <label>Country</label>
                  <input placeholder="Pakistan" defaultValue="Pakistan" disabled={pending} />
                </div>
              </div>

              <div className="zw-grid-2">
                <div className="zw-field">
                  <label>Official phone <em>(optional)</em></label>
                  <input placeholder="042-XXXXXXX" disabled={pending} />
                </div>
                <div className="zw-field">
                  <label>Official email <em>(optional)</em></label>
                  <input type="email" placeholder="info@school.edu.pk" disabled={pending} />
                </div>
              </div>

              <div className="zw-field">
                <label>Website <em>(optional)</em></label>
                <input placeholder="https://your-school.edu.pk" disabled={pending} />
              </div>

              <div className="zw-actions">
                <button type="button" className="zw-btn zw-btn-outline" onClick={goBack}><ArrowLeft aria-hidden /> Back</button>
                <button type="button" className="zw-btn zw-btn-solid" onClick={goNext}>
                  Save and continue <ArrowRight aria-hidden />
                </button>
              </div>
            </div>

            {/* ---------------- STEP 3 — BRANDING STUDIO ---------------- */}
            <div data-step="3" style={{ display: step === 3 ? "block" : "none" }}>
              <p className="zw-eyebrow"><i />Step 3 of 4</p>
              <h2>Institution branding studio</h2>
              <p className="zw-lede">Upload a high-resolution transparent PNG or SVG for the best paper and watermark quality.</p>

              <div className="zw-field">
                <label>Institution logo</label>
                <label className="zw-drop">
                  {logoPreview ? (
                    <span className="zw-drop-preview">
                      <img src={logoPreview} alt="" />
                      <button
                        type="button"
                        className="zw-drop-remove"
                        onClick={(e) => { e.preventDefault(); setLogoPreview(null); }}
                        aria-label="Remove logo"
                      >
                        <X aria-hidden />
                      </button>
                    </span>
                  ) : (
                    <span className="zw-drop-empty">
                      <Upload aria-hidden />
                      <span>Drag and drop, or browse files</span>
                      <span className="zw-drop-hint">PNG or SVG, transparent background, up to 4 MB</span>
                    </span>
                  )}
                  <input type="file" accept="image/png,image/svg+xml" onChange={handleLogoChange} disabled={pending} />
                </label>
              </div>

              <div className="zw-grid-2">
                <div className="zw-field">
                  <label>Primary brand colour</label>
                  <div className="zw-color-row">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} disabled={pending} />
                    <span className="zw-mono">{primaryColor}</span>
                  </div>
                </div>
                <div className="zw-field">
                  <label>Accent colour</label>
                  <div className="zw-color-row">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} disabled={pending} />
                    <span className="zw-mono">{accentColor}</span>
                  </div>
                </div>
              </div>

              <div className="zw-field">
                <label>Header template</label>
                <div className="zw-template-row">
                  {TEMPLATES.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`zw-template${headerTemplate === t.id ? " zw-template-active" : ""}`}
                      onClick={() => setHeaderTemplate(t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="zw-grid-2">
                <div className="zw-field">
                  <label>Watermark style</label>
                  <select value={watermarkType} onChange={(e) => setWatermarkType(e.target.value)} disabled={pending}>
                    {WATERMARK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="zw-field">
                  <label>Watermark opacity — {watermarkOpacity}%</label>
                  <input
                    type="range"
                    min={4}
                    max={12}
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    disabled={pending}
                  />
                </div>
              </div>
              <p className="zw-help">Your watermark appears lightly behind question-paper content and helps identify the issuing institution. See the live preview on the left.</p>

              <div className="zw-actions">
                <button type="button" className="zw-btn zw-btn-outline" onClick={goBack}><ArrowLeft aria-hidden /> Back</button>
                <button type="button" className="zw-btn zw-btn-solid" onClick={goNext}>
                  Continue to security <ArrowRight aria-hidden />
                </button>
              </div>
            </div>

            {/* ---------------- STEP 4 — SECURITY ---------------- */}
            <div data-step="4" style={{ display: step === 4 ? "block" : "none" }}>
              <p className="zw-eyebrow"><i />Step 4 of 4</p>
              <h2>Secure your workspace</h2>
              <p className="zw-lede">Protect confidential exam content with verified access, role-based permissions and traceable document activity.</p>

              <div className="zw-verify-row">
                <span>Email verification</span>
                <span className="zw-tag zw-tag-pending">Sent after account creation</span>
              </div>
              <div className="zw-verify-row">
                <span>Phone verification</span>
                <span className="zw-tag zw-tag-pending">Available after account creation</span>
              </div>

              <p className="zw-section-label">Multi-factor authentication</p>
              <div className="zw-mfa-list">
                {MFA_METHODS.map((m) => (
                  <label key={m.id} className={`zw-mfa${mfaMethod === m.id ? " zw-mfa-active" : ""}`}>
                    <input type="radio" name="mfa-ui" checked={mfaMethod === m.id} onChange={() => setMfaMethod(m.id)} />
                    <span>
                      <strong>{m.label}</strong>
                      <em>{m.note}</em>
                    </span>
                  </label>
                ))}
              </div>

              <div className="zw-summary">
                <p className="zw-section-label">Security summary</p>
                <ul>
                  <li><Check aria-hidden /> Institution workspace will be created</li>
                  <li><Check aria-hidden /> Branding configured for {institutionNamePreview || "your institution"}</li>
                  <li><Check aria-hidden /> Administrator role assigned to you</li>
                  <li><Check aria-hidden /> Document traceability enabled by default</li>
                  <li>{mfaMethod === "later" ? <X aria-hidden /> : <Check aria-hidden />} MFA — {MFA_METHODS.find((m) => m.id === mfaMethod)?.label}</li>
                </ul>
              </div>

              <div className="zw-actions">
                <button type="button" className="zw-btn zw-btn-outline" onClick={goBack}><ArrowLeft aria-hidden /> Back</button>
                <button type="submit" className="zw-btn zw-btn-solid" disabled={pending}>
                  {pending ? "Creating account…" : "Create and verify institution account"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

const WIZ_CSS = `
.zw{
  --ink:#07110E; --ink-2:#0B1713; --ink-3:#10201A;
  --line:rgba(244,239,227,.10); --line-2:rgba(244,239,227,.18);
  --paper:#FBF7EC; --paper-2:#F1EADA; --paper-rule:#D8CFB9;
  --green:#087A55; --green-lit:#39C995; --brass:#D6AD32; --red:#B93B2B;
  --fg:#F4EFE3; --fg-mute:#A9B3AD;
  --serif:'Instrument Serif',Georgia,serif;
  --sans:'Instrument Sans',ui-sans-serif,system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,monospace;
  min-height:100vh; display:grid; grid-template-columns:1fr; background:var(--ink); color:var(--fg);
  font-family:var(--sans); -webkit-font-smoothing:antialiased;
}
.zw *{box-sizing:border-box}
.zw a{color:var(--green-lit)}
.zw :focus-visible{outline:2px solid var(--green-lit); outline-offset:2px; border-radius:6px}

.zw-brand{position:relative; overflow:hidden; padding:2.2rem 2.4rem; display:none; flex-direction:column; justify-content:space-between; border-right:1px solid var(--line)}
.zw-brand-glow{position:absolute; inset:-20% 20% 50% -20%; background:radial-gradient(closest-side,rgba(8,122,85,.32),transparent); filter:blur(40px); pointer-events:none}
.zw-brand-top{position:relative; z-index:1}
.zw-brand-mark{display:flex; align-items:center; gap:.6rem}
.zw-logo-img{width:32px; height:32px; object-fit:contain; border-radius:8px}
.zw-brand-word{font-family:var(--serif); font-size:1.25rem}
.zw-tld{color:var(--green-lit)}
.zw-tagline{font-family:var(--mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--brass); margin:.7rem 0 0}

.zw-brand-mid{position:relative; z-index:1; margin:2rem 0}
.zw-brand-mid h1{font-family:var(--serif); font-weight:400; font-size:1.9rem; line-height:1.12; margin:0 0 .8rem; letter-spacing:-.01em}
.zw-brand-sub{font-size:.86rem; line-height:1.6; color:var(--fg-mute); margin:0 0 1.4rem; max-width:26rem}
.zw-benefits{list-style:none; padding:0; margin:0 0 1.6rem; display:grid; gap:.55rem}
.zw-benefits li{display:flex; align-items:center; gap:.6rem; font-size:.85rem; color:var(--fg)}
.zw-benefits svg{width:.95rem; height:.95rem; color:var(--green-lit); flex:none}

.zw-preview{background:var(--paper); color:#1A1F1C; border-radius:4px; padding:1rem 1.1rem; border:1px solid var(--paper-rule); position:relative; box-shadow:0 20px 50px rgba(0,0,0,.35)}
.zw-preview-head{display:flex; align-items:center; gap:.7rem}
.zw-preview-logo{width:2.2rem; height:2.2rem; border-radius:6px; border:1.5px solid; display:grid; place-items:center; font-family:var(--mono); font-size:.55rem; overflow:hidden; flex:none}
.zw-preview-logo img{width:100%; height:100%; object-fit:contain}
.zw-preview-inst{font-family:var(--serif); font-size:1rem; margin:0}
.zw-preview-meta{font-size:.62rem; color:#6E6857; margin:.1rem 0 0}
.zw-preview-rule{height:1px; background:var(--paper-rule); margin:.7rem 0}
.zw-preview-title{font-size:.8rem; font-weight:600; margin:0 0 .4rem}
.zw-preview-grid{display:flex; gap:.8rem; font-family:var(--mono); font-size:.56rem; letter-spacing:.08em; text-transform:uppercase; color:#7C7460; margin-bottom:.9rem}
.zw-preview-water{position:absolute; inset:0; display:grid; place-items:center; font-family:var(--serif); font-size:2rem; pointer-events:none; text-align:center; word-break:break-word; padding:1rem}
.zw-preview-foot{display:flex; align-items:center; justify-content:space-between; padding-top:.6rem; border-top:1px dashed var(--paper-rule)}
.zw-preview-qr{width:1.6rem; height:1.6rem; border:1.5px solid; border-radius:4px; display:grid; place-items:center; font-family:var(--mono); font-size:.5rem}
.zw-preview-sign{display:flex; justify-content:space-between; margin-top:.6rem; font-family:var(--mono); font-size:.54rem; letter-spacing:.08em; text-transform:uppercase; color:#7C7460}
.zw-mono{font-family:var(--mono); font-size:.56rem; letter-spacing:.06em; text-transform:uppercase; color:#7C7460}

.zw-trust{list-style:none; padding:1rem 0 0; margin:1.6rem 0 0; border-top:1px solid var(--line); display:grid; gap:.5rem}
.zw-trust li{display:flex; align-items:center; gap:.55rem; font-family:var(--mono); font-size:.62rem; letter-spacing:.06em; text-transform:uppercase; color:var(--fg-mute)}
.zw-trust svg{width:.85rem; height:.85rem; color:var(--brass)}

.zw-brand-foot{position:relative; z-index:1; display:flex; flex-wrap:wrap; gap:1rem; font-size:.75rem; color:var(--fg-mute)}
.zw-brand-foot span{margin-left:auto; font-family:var(--mono); font-size:.6rem; letter-spacing:.06em; text-transform:uppercase}

.zw-main{padding:2.2rem 1.2rem 3.5rem; display:flex; flex-direction:column; align-items:center}
.zw-mobile-head{display:flex; align-items:center; gap:.55rem; width:100%; max-width:34rem; margin-bottom:1.4rem}
.zw-mobile-step{margin-left:auto; font-family:var(--mono); font-size:.62rem; letter-spacing:.1em; text-transform:uppercase; color:var(--fg-mute)}

.zw-stepper{display:flex; align-items:center; width:100%; max-width:34rem; margin-bottom:1.6rem}
.zw-step{display:flex; align-items:center; gap:.5rem; background:none; border:none; padding:0; cursor:pointer; color:var(--fg-mute); flex:none}
.zw-step:disabled{cursor:not-allowed; opacity:.5}
.zw-step-dot{width:1.7rem; height:1.7rem; border-radius:999px; border:1px solid var(--line-2); display:grid; place-items:center; font-family:var(--mono); font-size:.7rem; flex:none; transition:.2s ease}
.zw-step-dot svg{width:.85rem; height:.85rem}
.zw-step-active .zw-step-dot{border-color:var(--green-lit); color:var(--green-lit); background:rgba(57,201,149,.1)}
.zw-step-done .zw-step-dot{background:var(--green); border-color:var(--green); color:var(--paper)}
.zw-step-label{font-size:.78rem; display:none}
.zw-step-active .zw-step-label{color:var(--fg)}
.zw-step-line{width:1.2rem; height:1px; background:var(--line-2); margin:0 .35rem}
@media(min-width:560px){ .zw-step-label{display:inline} .zw-step-line{width:2rem} }

.zw-form{width:100%; max-width:34rem}
.zw-msg{border-radius:8px; padding:.75rem 1rem; font-size:.8rem; font-weight:600; margin-bottom:1.2rem}
.zw-msg-error{background:rgba(185,59,43,.1); border:1px solid rgba(185,59,43,.28); color:#F5A899}
.zw-msg-success{background:rgba(8,122,85,.12); border:1px solid rgba(8,122,85,.3); color:var(--green-lit)}

.zw-eyebrow{display:inline-flex; align-items:center; gap:.5rem; font-family:var(--mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--brass); margin:0 0 .8rem}
.zw-eyebrow i{width:.35rem; height:.35rem; border-radius:999px; background:var(--brass); display:inline-block}
.zw-form h2{font-family:var(--serif); font-weight:400; font-size:1.7rem; margin:0 0 .4rem; letter-spacing:-.01em}
.zw-lede{font-size:.85rem; line-height:1.55; color:var(--fg-mute); margin:0 0 1.6rem; max-width:28rem}

.zw-grid-2{display:grid; grid-template-columns:1fr; gap:1rem}
@media(min-width:560px){ .zw-grid-2{grid-template-columns:1fr 1fr} }
.zw-field{margin-bottom:1rem}
.zw-field label{display:block; font-family:var(--mono); font-size:.62rem; letter-spacing:.1em; text-transform:uppercase; color:var(--fg-mute); margin-bottom:.45rem}
.zw-field label em{font-style:normal; color:#6E766F; text-transform:none; letter-spacing:0}
.zw-field input,.zw-field select{
  width:100%; font-family:var(--sans); font-size:.88rem; color:var(--fg);
  background:var(--ink-2); border:1px solid var(--line-2); border-radius:8px;
  padding:.7rem .85rem; outline:none; transition:border-color .18s ease;
}
.zw-field input::placeholder{color:#5A6560}
.zw-field input:focus,.zw-field select:focus{border-color:var(--green-lit)}
.zw-field input:disabled,.zw-field select:disabled{opacity:.55}
.zw-field-err{color:#F5A899; font-size:.72rem; font-weight:600; margin:.4rem 0 0}
.zw-phone{display:flex; align-items:stretch; border:1px solid var(--line-2); border-radius:8px; overflow:hidden}
.zw-phone-code{display:grid; place-items:center; padding:0 .8rem; background:var(--ink-3); font-family:var(--mono); font-size:.8rem; color:var(--fg-mute); flex:none}
.zw-phone input{border:none; border-radius:0}
.zw-phone:focus-within{outline:2px solid var(--green-lit); outline-offset:1px}

.zw-check{display:flex; align-items:flex-start; gap:.6rem; font-size:.8rem; color:var(--fg-mute); line-height:1.5; margin:.4rem 0 1.6rem; cursor:pointer}
.zw-check input{margin-top:.2rem; accent-color:var(--green-lit)}

.zw-actions{display:flex; align-items:center; justify-content:space-between; gap:.8rem; margin-top:.6rem}
.zw-btn{display:inline-flex; align-items:center; gap:.5rem; padding:.8rem 1.3rem; border-radius:999px; font-size:.88rem; font-weight:600; border:1px solid transparent; cursor:pointer; transition:.18s ease}
.zw-btn svg{width:.95rem; height:.95rem}
.zw-btn-solid{background:var(--paper); color:#0B1210}
.zw-btn-solid:hover{background:#fff; transform:translateY(-1px)}
.zw-btn-solid:disabled{opacity:.55; cursor:not-allowed; transform:none}
.zw-btn-outline{background:none; border-color:var(--line-2); color:var(--fg)}
.zw-btn-outline:hover{border-color:var(--green-lit); color:var(--green-lit)}
.zw-alt{text-align:center; margin-top:1.3rem; font-size:.82rem; color:var(--fg-mute)}
.zw-alt span{color:var(--green-lit); font-weight:600; cursor:pointer}
.zw-alt span:hover{text-decoration:underline}

.zw-drop{position:relative; display:block; border:1px dashed var(--line-2); border-radius:12px; padding:1.6rem 1rem; text-align:center; cursor:pointer; background:var(--ink-2); transition:border-color .18s ease}
.zw-drop:hover{border-color:var(--green-lit)}
.zw-drop input[type="file"]{position:absolute; inset:0; opacity:0; cursor:pointer}
.zw-drop-empty{display:flex; flex-direction:column; align-items:center; gap:.5rem; color:var(--fg-mute); font-size:.82rem}
.zw-drop-empty svg{width:1.4rem; height:1.4rem; color:var(--green-lit)}
.zw-drop-hint{font-size:.7rem; color:#5A6560}
.zw-drop-preview{position:relative; display:inline-flex}
.zw-drop-preview img{max-height:4rem; max-width:100%; object-fit:contain}
.zw-drop-remove{position:absolute; top:-.6rem; right:-.6rem; width:1.5rem; height:1.5rem; border-radius:999px; background:var(--red); border:none; color:#fff; display:grid; place-items:center; cursor:pointer}
.zw-drop-remove svg{width:.8rem; height:.8rem}

.zw-color-row{display:flex; align-items:center; gap:.6rem}
.zw-color-row input[type="color"]{width:2.2rem; height:2.2rem; border:1px solid var(--line-2); border-radius:8px; background:none; padding:2px; cursor:pointer}

.zw-template-row{display:grid; grid-template-columns:1fr; gap:.6rem}
@media(min-width:560px){ .zw-template-row{grid-template-columns:repeat(3,1fr)} }
.zw-template{padding:.7rem .6rem; border-radius:8px; border:1px solid var(--line-2); background:var(--ink-2); color:var(--fg-mute); font-size:.78rem; cursor:pointer; transition:.18s ease}
.zw-template-active{border-color:var(--green-lit); color:var(--fg); background:rgba(57,201,149,.08)}

.zw-field input[type="range"]{accent-color:var(--green-lit); padding:0}
.zw-help{font-size:.78rem; line-height:1.55; color:var(--fg-mute); margin:.2rem 0 1.6rem}

.zw-verify-row{display:flex; align-items:center; justify-content:space-between; padding:.9rem 0; border-bottom:1px solid var(--line); font-size:.85rem}
.zw-tag{font-family:var(--mono); font-size:.6rem; letter-spacing:.08em; text-transform:uppercase; padding:.3rem .6rem; border-radius:999px}
.zw-tag-pending{background:rgba(214,173,50,.12); color:var(--brass); border:1px solid rgba(214,173,50,.3)}

.zw-section-label{font-family:var(--mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--fg-mute); margin:1.5rem 0 .8rem}
.zw-mfa-list{display:grid; gap:.6rem}
.zw-mfa{display:flex; align-items:flex-start; gap:.7rem; padding:.85rem 1rem; border:1px solid var(--line-2); border-radius:10px; cursor:pointer; transition:.18s ease}
.zw-mfa-active{border-color:var(--green-lit); background:rgba(57,201,149,.06)}
.zw-mfa input{margin-top:.25rem; accent-color:var(--green-lit)}
.zw-mfa strong{display:block; font-size:.85rem; font-weight:600}
.zw-mfa em{font-style:normal; font-size:.74rem; color:var(--fg-mute)}

.zw-summary{background:var(--ink-2); border:1px solid var(--line); border-radius:12px; padding:1.2rem 1.3rem; margin-top:1.4rem}
.zw-summary ul{list-style:none; padding:0; margin:0; display:grid; gap:.55rem}
.zw-summary li{display:flex; align-items:center; gap:.6rem; font-size:.82rem; color:var(--fg-mute)}
.zw-summary svg{width:.9rem; height:.9rem; color:var(--green-lit); flex:none}

@media(min-width:1024px){
  .zw{grid-template-columns:minmax(360px,40%) 1fr; height:100vh}
  .zw-brand{display:flex; height:100vh; overflow-y:auto}
  .zw-mobile-head{display:none}
  .zw-main{padding:3.2rem 3rem; height:100vh; overflow-y:auto}
}

.zw-theme-fixed{position:fixed; top:1.1rem; right:1.1rem; z-index:80}

html[data-theme='light'] .zw{
  --ink:#F4F7F5; --ink-2:#FFFFFF; --ink-3:#EAF0ED;
  --line:rgba(16,24,21,.12); --line-2:rgba(16,24,21,.22);
  --paper:#FFFDF7; --paper-2:#F3EDDF;
  --green:#087A55; --green-lit:#087A55; --brass:#8A6700;
  --fg:#101815; --fg-mute:#52605A;
}
html[data-theme='light'] .zw-btn-solid{background:#0B1210; color:#FFFFFF}
html[data-theme='light'] .zw-btn-solid:hover{background:#1A2420}

.zw-theme-fixed .zs-theme-toggle{
  position:relative;display:inline-grid;place-items:center;flex:none;
  width:42px;height:42px;border-radius:999px;padding:0;
  border:1px solid var(--line-2);background:color-mix(in srgb,var(--ink-2) 70%,transparent);
  backdrop-filter:blur(10px);color:var(--fg);cursor:pointer;
  transition:border-color .22s ease,box-shadow .22s ease,transform .22s ease;
}
.zw-theme-fixed .zs-theme-toggle:hover{
  border-color:var(--green-lit);
  box-shadow:0 0 0 1px var(--green-lit),0 8px 22px -12px var(--green-lit);
}
.zw-theme-fixed .zs-theme-toggle:active{transform:scale(.95)}
.zw-theme-fixed .zs-theme-toggle svg{
  grid-area:1/1;width:1.05rem;height:1.05rem;
  transition:opacity .22s ease,transform .22s ease;
}
.zw-theme-fixed .zs-theme-toggle .zs-ticon-sun{opacity:0;transform:rotate(-45deg) scale(.6)}
.zw-theme-fixed .zs-theme-toggle .zs-ticon-moon{opacity:1;transform:none}
html[data-theme='light'] .zw-theme-fixed .zs-theme-toggle .zs-ticon-sun{opacity:1;transform:none}
html[data-theme='light'] .zw-theme-fixed .zs-theme-toggle .zs-ticon-moon{opacity:0;transform:rotate(45deg) scale(.6)}

@media (prefers-reduced-motion:reduce){
  .zw *{transition:none!important}
}
`;
