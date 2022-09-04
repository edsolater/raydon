import { createAtomEffect, createXEffect } from '@edsolater/xstore'
import { refreshTokenPrice } from '../token/utils/refreshTokenPrice'

export const autoRefreshTokenPrice = createXEffect(() => {
  const timeIntervalId = setInterval(() => {
    if (document.visibilityState === 'hidden') return
    refreshTokenPrice()
  }, 1000 * 60 * 2)
  return () => clearInterval(timeIntervalId) // TODO: not imply clean function yet
}, [])
