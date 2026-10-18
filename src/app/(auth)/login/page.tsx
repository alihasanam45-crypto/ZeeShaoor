'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROUTE_CONFIG } from '@/config/routes'
import type { UserRole } from '@/types/auth'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Send, CheckCircle, Check, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '../../landing-parts'

const AUTH_ERRORS: Record<string, string> = {
  EMAIL_PASSWORD_REQUIRED: 'Please enter your email and password.',
  USER_NOT_FOUND:          'No account found with this email address.',
  INVALID_PASSWORD:        'Incorrect password. Please try again.',
  INVALID_ROLE:            'Account configuration error. Contact support.',
  ACCOUNT_PENDING:         'Your account is awaiting admin approval. You will be able to sign in once verified.',
  ACCOUNT_SUSPENDED:       'This account has been suspended. Contact support.',
  DEFAULT:                 'Something went wrong. Please try again.',
}

function resolveError(e: string | null) {
  if (!e) return ''
  return AUTH_ERRORS[e] ?? AUTH_ERRORS.DEFAULT
}

const BENEFITS = [
  'Institution-branded documents',
  'Secure approval workflows',
  'QR and document verification',
  'AI-assisted paper quality checks',
]

const TRUST = [
  'Secure institution workspace',
  'Role-based access',
  'Traceable document activity',
]

// --------- Forgot Password Panel -------------------------------------------------------------

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j.message ?? 'Email not found in system.')
        setLoading(false); return
      }
      setSent(true)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  if (sent) return (
    <div className="zl-sent">
      <div className="zl-sent-icon"><CheckCircle size={26} /></div>
      <h3>Email sent</h3>
      <p>Check your inbox at <span>{email}</span></p>
      <p className="zl-sent-note">Password reset link valid for 30 minutes</p>
      <button onClick={onBack} className="zl-back"><ArrowLeft size={13} /> Back to login</button>
    </div>
  )

  return (
    <div>
      <p className="zl-eyebrow"><i />Reset password</p>
      <h2>Recover your account</h2>
      <p className="zl-lede">Enter your email and we&apos;ll send you a reset link.</p>

      {error && <div className="zl-msg zl-msg-error">{error}</div>}

      <form onSubmit={handleSend}>
        <div className="zl-field">
          <label><Mail size={11} /> Email address</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="name@school.edu.pk" required
          />
        </div>

        <button type="submit" disabled={loading || !email} className="zl-btn zl-btn-solid zl-btn-full">
          {loading ? 'Sending…' : <><Send size={15} /> Send reset link</>}
        </button>
      </form>

      <button onClick={onBack} className="zl-back zl-back-center"><ArrowLeft size={13} /> Back to login</button>
    </div>
  )
}

// --------- Login Page -------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [forgotPw, setForgotPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null)
    startTransition(async () => {
      const result = await signIn('credentials', { email: email.trim().toLowerCase(), password, redirect: false })
      if (!result)        { setError('DEFAULT'); return }
      if (result.error)   { setError(result.error); return }
      if (result.ok) {
        // Small retry loop: session cookie may not be ready immediately
        let role: UserRole | undefined
        for (let i = 0; i < 3; i++) {
          if (i > 0) await new Promise((r) => setTimeout(r, 200))
          try {
            const s    = await fetch('/api/auth/session')
            const sess = await s.json()
            role = sess?.user?.role as UserRole | undefined
            if (role && ROUTE_CONFIG.redirectAfterLogin[role]) break
          } catch { /* retry */ }
        }
        if (role && ROUTE_CONFIG.redirectAfterLogin[role]) {
          router.replace(ROUTE_CONFIG.redirectAfterLogin[role])
        } else {
          router.replace('/login')
        }
      }
    })
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
      <style href="zs-login" precedence="high">{LOGIN_CSS}</style>

      <div className="zl">
        <div className="zl-theme-fixed"><ThemeToggle /></div>
        {/* ================= LEFT BRAND PANEL ================= */}
        <aside className="zl-brand">
          <div className="zl-brand-glow" aria-hidden />

          <div className="zl-brand-top">
            <div className="zl-brand-mark">
              <Image src="/logo.png" alt="" width={32} height={32} className="zl-logo-img" />
              <span className="zl-brand-word">ZeeShaoor<span className="zl-tld">.Pk</span></span>
            </div>
            <p className="zl-tagline">Awakening intellect, anchoring truth</p>
          </div>

          <div className="zl-brand-mid">
            <h1>Continue building secure examination papers.</h1>
            <p className="zl-brand-sub">
              Sign in to pick up where your institution&apos;s workspace left off.
            </p>

            <ul className="zl-benefits">
              {BENEFITS.map((b) => (
                <li key={b}><Check aria-hidden /><span>{b}</span></li>
              ))}
            </ul>

            <div className="zl-preview">
              <div className="zl-preview-head">
                <div className="zl-preview-logo"><span>Logo</span></div>
                <div>
                  <p className="zl-preview-inst">Your institution name</p>
                  <p className="zl-preview-meta">Branch · Annual examination 2026</p>
                </div>
              </div>
              <div className="zl-preview-rule" />
              <p className="zl-preview-title">Physics — Class 9</p>
              <div className="zl-preview-grid">
                <span>Class 9</span><span>Time — 2:30 hrs</span><span>Marks — 60</span>
              </div>
              <div className="zl-preview-foot">
                <span className="zl-mono">Doc. ID — ZS-PAK-2026-1045</span>
                <span className="zl-preview-qr">QR</span>
              </div>
            </div>

            <ul className="zl-trust">
              {TRUST.map((t) => (
                <li key={t}><ShieldCheck aria-hidden />{t}</li>
              ))}
            </ul>
          </div>

          <div className="zl-brand-foot">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/#contact">Help</a>
            <span>© {new Date().getFullYear()} ZeeShaoor.Pk</span>
          </div>
        </aside>

        {/* ================= RIGHT FORM PANEL ================= */}
        <main className="zl-main">
          <div className="zl-mobile-head">
            <Image src="/logo.png" alt="" width={28} height={28} className="zl-logo-img" />
            <span className="zl-brand-word">ZeeShaoor<span className="zl-tld">.Pk</span></span>
          </div>

          <div className="zl-card">
            {forgotPw ? (
              <ForgotPassword onBack={() => setForgotPw(false)} />
            ) : (
              <>
                <p className="zl-eyebrow"><i />Institute access</p>
                <h2>Welcome back</h2>
                <p className="zl-lede">Sign in to your portal to continue.</p>

                {error && <div className="zl-msg zl-msg-error">{resolveError(error)}</div>}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="zl-field">
                    <label><Mail size={11} /> Email address</label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="name@school.edu.pk" autoComplete="email" required disabled={isPending}
                    />
                  </div>

                  <div className="zl-field">
                    <label><Lock size={11} /> Password</label>
                    <div className="zl-pwd">
                      <input
                        type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" autoComplete="current-password" required disabled={isPending}
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} disabled={isPending} aria-label={showPwd ? 'Hide password' : 'Show password'}>
                        {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isPending || !email || !password} className="zl-btn zl-btn-solid zl-btn-full">
                    {isPending ? 'Verifying…' : 'Sign in to portal'}
                  </button>

                  <button type="button" onClick={() => setForgotPw(true)} className="zl-forgot">
                    Forgot password?
                  </button>
                </form>

                <div className="zl-foot">
                  <p>Don&apos;t have an account? <a href="/register">Create account →</a></p>
                  <p className="zl-mono zl-secure"><Lock size={11} /> 256-bit encrypted · JWT secured · RBAC enforced</p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

const LOGIN_CSS = `
.zl{
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
.zl *{box-sizing:border-box}
.zl a{color:var(--green-lit); text-decoration:none}
.zl a:hover{text-decoration:underline}
.zl :focus-visible{outline:2px solid var(--green-lit); outline-offset:2px; border-radius:6px}

.zl-brand{position:relative; overflow:hidden; padding:2.2rem 2.4rem; display:none; flex-direction:column; justify-content:space-between; border-right:1px solid var(--line)}
.zl-brand-glow{position:absolute; inset:-20% 20% 50% -20%; background:radial-gradient(closest-side,rgba(8,122,85,.32),transparent); filter:blur(40px); pointer-events:none}
.zl-brand-top{position:relative; z-index:1}
.zl-brand-mark{display:flex; align-items:center; gap:.6rem}
.zl-logo-img{border-radius:8px}
.zl-brand-word{font-family:var(--serif); font-size:1.25rem}
.zl-tld{color:var(--green-lit)}
.zl-tagline{font-family:var(--mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--brass); margin:.7rem 0 0}

.zl-brand-mid{position:relative; z-index:1; margin:2rem 0}
.zl-brand-mid h1{font-family:var(--serif); font-weight:400; font-size:1.9rem; line-height:1.12; margin:0 0 .8rem; letter-spacing:-.01em}
.zl-brand-sub{font-size:.86rem; line-height:1.6; color:var(--fg-mute); margin:0 0 1.4rem; max-width:26rem}
.zl-benefits{list-style:none; padding:0; margin:0 0 1.6rem; display:grid; gap:.55rem}
.zl-benefits li{display:flex; align-items:center; gap:.6rem; font-size:.85rem; color:var(--fg)}
.zl-benefits svg{width:.95rem; height:.95rem; color:var(--green-lit); flex:none}

.zl-preview{background:var(--paper); color:#1A1F1C; border-radius:4px; padding:1rem 1.1rem; border:1px solid var(--paper-rule); box-shadow:0 20px 50px rgba(0,0,0,.35)}
.zl-preview-head{display:flex; align-items:center; gap:.7rem}
.zl-preview-logo{width:2.2rem; height:2.2rem; border-radius:6px; border:1.5px solid var(--green); display:grid; place-items:center; font-family:var(--mono); font-size:.55rem; color:var(--green); flex:none}
.zl-preview-inst{font-family:var(--serif); font-size:1rem; margin:0}
.zl-preview-meta{font-size:.62rem; color:#6E6857; margin:.1rem 0 0}
.zl-preview-rule{height:1px; background:var(--paper-rule); margin:.7rem 0}
.zl-preview-title{font-size:.8rem; font-weight:600; margin:0 0 .4rem}
.zl-preview-grid{display:flex; gap:.8rem; font-family:var(--mono); font-size:.56rem; letter-spacing:.08em; text-transform:uppercase; color:#7C7460; margin-bottom:.9rem}
.zl-preview-foot{display:flex; align-items:center; justify-content:space-between; padding-top:.6rem; border-top:1px dashed var(--paper-rule)}
.zl-preview-qr{width:1.6rem; height:1.6rem; border:1.5px solid var(--brass); border-radius:4px; display:grid; place-items:center; font-family:var(--mono); font-size:.5rem}
.zl-mono{font-family:var(--mono); font-size:.56rem; letter-spacing:.06em; text-transform:uppercase; color:#7C7460}

.zl-trust{list-style:none; padding:1rem 0 0; margin:1.6rem 0 0; border-top:1px solid var(--line); display:grid; gap:.5rem}
.zl-trust li{display:flex; align-items:center; gap:.55rem; font-family:var(--mono); font-size:.62rem; letter-spacing:.06em; text-transform:uppercase; color:var(--fg-mute)}
.zl-trust svg{width:.85rem; height:.85rem; color:var(--brass)}

.zl-brand-foot{position:relative; z-index:1; display:flex; flex-wrap:wrap; gap:1rem; font-size:.75rem; color:var(--fg-mute)}
.zl-brand-foot span{margin-left:auto; font-family:var(--mono); font-size:.6rem; letter-spacing:.06em; text-transform:uppercase}

.zl-main{padding:2.2rem 1.2rem 3.5rem; display:flex; flex-direction:column; align-items:center; justify-content:center}
.zl-mobile-head{display:flex; align-items:center; gap:.55rem; width:100%; max-width:26rem; margin-bottom:1.6rem}

.zl-card{width:100%; max-width:26rem}
.zl-msg{border-radius:8px; padding:.75rem 1rem; font-size:.8rem; font-weight:600; margin-bottom:1.2rem}
.zl-msg-error{background:rgba(185,59,43,.1); border:1px solid rgba(185,59,43,.28); color:#F5A899}

.zl-eyebrow{display:inline-flex; align-items:center; gap:.5rem; font-family:var(--mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--brass); margin:0 0 .8rem}
.zl-eyebrow i{width:.35rem; height:.35rem; border-radius:999px; background:var(--brass); display:inline-block}
.zl-card h2{font-family:var(--serif); font-weight:400; font-size:1.9rem; margin:0 0 .4rem; letter-spacing:-.01em}
.zl-lede{font-size:.85rem; line-height:1.55; color:var(--fg-mute); margin:0 0 1.8rem; max-width:26rem}

.zl-field{margin-bottom:1.1rem}
.zl-field label{display:flex; align-items:center; gap:.4rem; font-family:var(--mono); font-size:.62rem; letter-spacing:.1em; text-transform:uppercase; color:var(--fg-mute); margin-bottom:.5rem}
.zl-field input{
  width:100%; font-family:var(--sans); font-size:.9rem; color:var(--fg);
  background:var(--ink-2); border:1px solid var(--line-2); border-radius:10px;
  padding:.85rem 1rem; outline:none; transition:border-color .18s ease;
}
.zl-field input::placeholder{color:#5A6560}
.zl-field input:focus{border-color:var(--green-lit)}
.zl-field input:disabled{opacity:.5}
.zl-pwd{position:relative}
.zl-pwd input{padding-right:2.8rem}
.zl-pwd button{position:absolute; right:.85rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--fg-mute); cursor:pointer; display:grid; place-items:center}
.zl-pwd button:hover{color:var(--fg)}

.zl-btn{display:inline-flex; align-items:center; justify-content:center; gap:.5rem; padding:.9rem 1.3rem; border-radius:999px; font-size:.9rem; font-weight:600; border:1px solid transparent; cursor:pointer; transition:.18s ease}
.zl-btn-solid{background:var(--paper); color:#0B1210}
.zl-btn-solid:hover{background:#fff; transform:translateY(-1px)}
.zl-btn-solid:disabled{opacity:.5; cursor:not-allowed; transform:none}
.zl-btn-full{width:100%; margin-top:.4rem}

.zl-forgot{display:block; width:100%; text-align:center; background:none; border:none; color:var(--green-lit); font-size:.82rem; font-weight:600; cursor:pointer; margin-top:1.1rem; padding:.4rem}
.zl-forgot:hover{text-decoration:underline; color:var(--fg)}

.zl-foot{margin-top:1.8rem; padding-top:1.4rem; border-top:1px solid var(--line); text-align:center; display:grid; gap:.7rem}
.zl-foot p{font-size:.82rem; color:var(--fg-mute); margin:0}
.zl-foot a{font-weight:600}
.zl-secure{display:flex; align-items:center; justify-content:center; gap:.4rem; color:#5A6560!important}

.zl-back{display:inline-flex; align-items:center; gap:.4rem; background:none; border:none; color:var(--fg-mute); font-size:.78rem; cursor:pointer; margin-top:.6rem; padding:.3rem}
.zl-back:hover{color:var(--green-lit)}
.zl-back-center{display:flex; width:100%; justify-content:center; margin-top:1.4rem}

.zl-sent{text-align:center; padding:1rem 0}
.zl-sent-icon{width:3.4rem; height:3.4rem; margin:0 auto 1rem; border-radius:999px; background:rgba(8,122,85,.12); border:1px solid rgba(8,122,85,.3); color:var(--green-lit); display:grid; place-items:center}
.zl-sent h3{font-family:var(--serif); font-weight:400; font-size:1.4rem; margin:0 0 .5rem}
.zl-sent p{font-size:.85rem; color:var(--fg-mute); margin:.2rem 0}
.zl-sent p span{color:var(--green-lit)}
.zl-sent-note{font-size:.75rem!important; color:#5A6560!important}

@media(min-width:1024px){
  .zl{grid-template-columns:minmax(360px,40%) 1fr; height:100vh}
  .zl-brand{display:flex; height:100vh; overflow-y:auto}
  .zl-mobile-head{display:none}
  .zl-main{padding:3.2rem 3rem; height:100vh; overflow-y:auto}
}
.zl-theme-fixed{position:fixed; top:1.1rem; right:1.1rem; z-index:80}
.zl-theme-fixed .zs-theme-toggle{
  position:relative;display:inline-grid;place-items:center;flex:none;
  width:42px;height:42px;border-radius:999px;padding:0;
  border:1px solid var(--line-2);background:color-mix(in srgb,var(--ink-2) 70%,transparent);
  backdrop-filter:blur(10px);color:var(--fg);cursor:pointer;
  transition:border-color .22s ease,box-shadow .22s ease,transform .22s ease;
}
.zl-theme-fixed .zs-theme-toggle:hover{
  border-color:var(--green-lit);
  box-shadow:0 0 0 1px var(--green-lit),0 8px 22px -12px var(--green-lit);
}
.zl-theme-fixed .zs-theme-toggle:active{transform:scale(.95)}
.zl-theme-fixed .zs-theme-toggle svg{
  grid-area:1/1;width:1.05rem;height:1.05rem;
  transition:opacity .22s ease,transform .22s ease;
}
.zl-theme-fixed .zs-theme-toggle .zs-ticon-sun{opacity:0;transform:rotate(-45deg) scale(.6)}
.zl-theme-fixed .zs-theme-toggle .zs-ticon-moon{opacity:1;transform:none}
html[data-theme='light'] .zl-theme-fixed .zs-theme-toggle .zs-ticon-sun{opacity:1;transform:none}
html[data-theme='light'] .zl-theme-fixed .zs-theme-toggle .zs-ticon-moon{opacity:0;transform:rotate(45deg) scale(.6)}
html[data-theme='dark']{color-scheme:dark}
html[data-theme='light']{color-scheme:light}
html[data-theme='light'] .zl{
  --ink:#F4F7F5; --ink-2:#FFFFFF; --ink-3:#EAF0ED;
  --line:rgba(16,24,21,.12); --line-2:rgba(16,24,21,.22);
  --paper:#FFFDF7; --paper-2:#F3EDDF;
  --green:#087A55; --green-lit:#087A55; --brass:#8A6700;
  --fg:#101815; --fg-mute:#52605A;
}
html[data-theme='light'] .zl-btn-solid{background:#0B1210; color:#FFFFFF}
html[data-theme='light'] .zl-btn-solid:hover{background:#1A2420}
@media (prefers-reduced-motion:reduce){ .zl *{transition:none!important} }
`
