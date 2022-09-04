import { inClient } from '@/functions/judgers/isSSR'
import { createAtomEffect, createXEffect } from '@edsolater/xstore'
import { refreshTokenPrice } from '../token/utils/refreshTokenPrice'

const duration = 1000 * 60 * 2

export const autoRefreshTokenPrice = createXEffect(() => {
  const timeIntervalId = globalThis.setInterval(() => {
    if (inClient && window.document.visibilityState === 'hidden') return
    refreshTokenPrice()
  }, duration)
  return () => globalThis.clearInterval(timeIntervalId)
}, [])
