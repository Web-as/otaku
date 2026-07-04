'use client'

import { useAuth } from '@/contexts/AuthContext'
import { buildLoginUrl } from '@/shared/utils/authRedirect'

interface Props {
  episodeNumber: number
  questBookId: string
  children: React.ReactNode
}

/** Episode 1 free; QuestBook unlock via Stripe (Phase 6). */
export function VnPremiumGate({ episodeNumber, questBookId, children }: Props) {
  const { user } = useAuth()
  const isPrologue = episodeNumber <= 1
  const isPremium = user?.tier === 'premium' || user?.role === 'op' || user?.role === 'super_user'
  const unlockedParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('unlocked') === '1'

  if (isPrologue || isPremium || unlockedParam) {
    return <>{children}</>
  }

  const handleUnlock = async () => {
    if (!user) {
      window.location.href = buildLoginUrl('/login', typeof window !== 'undefined' ? window.location.href : '/vn')
      return
    }
    const res = await fetch('/api/vn/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        userEmail: user.email,
        questBookId,
        successUrl: `${window.location.origin}/vn/play/${questBookId}?unlocked=1`,
        cancelUrl: `${window.location.origin}/vn`,
      }),
    })
    const data = await res.json()
    if (data.url) window.location.assign(data.url)
    else alert(data.error ?? 'Checkout unavailable — set STRIPE_VN_QUESTBOOK_PRICE_ID')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center px-6 gap-6">
      <h2 className="text-2xl font-bold text-amber-200">Episode {episodeNumber} — Premium Quest Book</h2>
      <p className="text-gray-400 max-w-md">
        Episode 1 (Prologue) is free. Unlock the full Quest Book to continue your visual novel adventure.
      </p>
      <button type="button" onClick={() => void handleUnlock()} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold">
        Unlock Quest Book
      </button>
      <a href="/vn" className="text-sm text-gray-500 hover:text-gray-300">← Back to VN Maker</a>
    </div>
  )
}
