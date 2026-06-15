'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  return (
    <div className="min-h-screen bg-[#0C0E0E] flex flex-col items-center justify-center px-4 relative">

      {/* Nexforce white wordmark */}
      <img
        src="https://github.com/wteodosionx/nx-logo/raw/0ba05bc3bccba383d907e22aadd647514d03114d/NF%20-%20BRNCO-02.png"
        alt="Nexforce"
        className="h-9 w-auto mb-12"
      />

      {/* App identity */}
      <h1 className="text-white text-2xl font-black tracking-tight mb-1 font-sans">
        Sienge RaaS
      </h1>
      <p className="text-[#9C9B9B] text-sm mb-10 font-sans">
        Documentação de processos
      </p>

      {/* Google sign-in */}
      <button
        onClick={() => signIn('google', { callbackUrl })}
        className="flex items-center gap-3 bg-[#215A9F] hover:bg-[#1a4780] active:bg-[#163d6e] text-white text-sm font-bold px-6 py-3 rounded-md transition-colors font-sans cursor-pointer"
      >
        <GoogleIcon />
        Entrar com Google
      </button>

      {/* Domain restriction note */}
      <p className="text-[#9C9B9B] text-xs mt-6 font-sans">
        Acesso restrito a <span className="text-[#777777]">@nexforce.ai</span>
      </p>

      {/* Footer icon-mark — brand rule: icon bottom-left on dark */}
      <div className="absolute bottom-6 left-6">
        <img
          src="https://github.com/wteodosionx/nx-logo/raw/ea215a8901d977e88355d82a440e69992dcdaf94/icon-white.png"
          alt=""
          aria-hidden="true"
          className="h-4 w-auto opacity-60"
        />
      </div>

    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="currentColor" fillOpacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" fillOpacity=".9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" fillOpacity=".9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="currentColor" fillOpacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
