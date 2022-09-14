import { createXEffect } from '@edsolater/xstore'
import { poolsAtom } from '../atom'
import { routerAtom } from '@/application/router/atom'

export const startPoolIntervalRefresh = createXEffect(
  ([pathname]) => {
    if (!pathname.includes('/pools/') && !pathname.includes('/liquidity/')) return
    const timeoutId = setInterval(poolsAtom.get().refreshPools, 15 * 60 * 1000)
    return () => clearInterval(timeoutId)
  },
  [routerAtom.subscribe.pathname]
)
