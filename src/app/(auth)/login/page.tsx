'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROUTE_CONFIG } from '@/config/routes'
import type { UserRole } from '@/types/auth'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Send, CheckCircle } from 'lucide-react'

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

// --------- Forgot Password Panel ------------------------------------------------------------------------------------------------------------------------------------------------------------

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
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="h-16 w-16 rounded-full bg-green-950 border-2 border-green-500 flex items-center justify-center shadow-xl">
        <CheckCircle size={30} className="text-green-400"/>
      </div>
      <div>
        <h3 className="font-black text-white">Email Sent!</h3>
        <p className="mt-1 text-sm text-slate-500">Check your inbox at <span className="text-cyan-400">{email}</span></p>
        <p className="mt-1 text-xs text-slate-600">Password reset link valid for 30 minutes</p>
      </div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
        <ArrowLeft size={14}/> Back to Login
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h3 className="text-lg font-black text-white">Reset Password</h3>
        <p className="mt-1 text-sm text-slate-500">Enter your email — we&apos;ll send a reset link</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      <form onSubmit={handleSend} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Mail size={11}/> Email Address
          </label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="zeeshaoorofficial@gmail.com" required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        <button type="submit" disabled={loading || !email}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading
            ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>Sending...</>
            : <><Send size={15}/>Send Reset Link</>
          }
        </button>
      </form>

      <button onClick={onBack} className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors">
        <ArrowLeft size={12}/> Back to Login
      </button>
    </div>
  )
}

// --------- Login Page ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
        const s    = await fetch('/api/auth/session')
        const sess = await s.json()
        const role = sess?.user?.role as UserRole | undefined
        router.replace(role && ROUTE_CONFIG.redirectAfterLogin[role] ? ROUTE_CONFIG.redirectAfterLogin[role] : '/')
      }
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020817] px-4">

      {/* Glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-cyan-500 opacity-[0.08] blur-3xl"/>
      <div className="pointer-events-none absolute bottom-0 -right-16 h-80 w-80 rounded-full bg-violet-600 opacity-[0.08] blur-3xl"/>
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-blue-700 opacity-[0.06] blur-3xl"/>

      {/* Grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]"/>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="h-px w-full bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500"/>

        <div className="p-8">

          {forgotPw ? (
            <>
              {/* Logo small top */}
              <div className="flex items-center gap-2 mb-6">
                <Image src="/logo.png" alt="ZeeShaoor.pk" width={32} height={32} className="rounded-lg"/>
                <span className="text-sm font-black"><span className="text-cyan-400">ZeeShaoor</span><span className="text-white">.pk</span></span>
              </div>
              <ForgotPassword onBack={() => setForgotPw(false)}/>
            </>
          ) : (
            <>
              {/* Header — centered */}
              <div className="mb-8 flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 blur-xl"/>
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    <Image src="/logo.png" alt="ZeeShaoor.pk" width={64} height={64} className="object-contain" priority/>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight">
                    <span className="text-cyan-400">ZeeShaoor</span>
                    <span className="text-white">.pk</span>
                  </div>
                  <h1 className="mt-1 text-lg font-bold text-white">Welcome Back</h1>
                  <p className="text-sm text-slate-500">Sign in to your portal</p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <span className="text-sm text-red-300">{resolveError(error)}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <Mail size={11}/> Email Address
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="zeeshaoorofficial@gmail.com" autoComplete="email" required disabled={isPending}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/20 transition-all disabled:opacity-40"/>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <Lock size={11}/> Password
                  </label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" autoComplete="current-password" required disabled={isPending}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/20 transition-all disabled:opacity-40 pr-12"/>
                    <button type="button" onClick={() => setShowPwd(!showPwd)} disabled={isPending}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setForgotPw(true)}
                      className="text-xs text-slate-500 hover:text-cyan-400 transition-colors font-medium">
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isPending || !email || !password}
                  className="group relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"/>
                  {isPending
                    ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>Verifying...</>
                    : 'Sign in to Portal'
                  }
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-xs text-slate-600">
                  Don&apos;t have an account?{' '}
                  <a href="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Create Account →</a>
                </p>
                <div className="flex items-center gap-1.5">
                  <svg className="h-3 w-3 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-[11px] text-slate-700">256-bit encrypted · JWT secured · RBAC enforced</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
