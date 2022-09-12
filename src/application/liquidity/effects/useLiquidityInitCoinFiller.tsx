import { useEffect } from 'react'

import { RAYMint, tokenAtom } from '@/application/token'

import { QuantumSOLVersionSOL } from '@/application/token'
import { getURLQueryEntry } from '@/functions/dom/getURLQueryEntries'
import toPubString from '@/functions/format/toMintString'
import { useXStore } from '@edsolater/xstore'
import useLiquidity from '../useLiquidity'
import { liquidityAtom } from '../atom'

export default function useLiquidityInitCoinFiller() {
  const { getToken } = useXStore(tokenAtom)
  useEffect(() => {
    setTimeout(() => {
      // NOTE this effect must later than ammid parser
      const { coin1, coin2, ammId } = liquidityAtom.get()
      const query = getURLQueryEntry()
      const isNotReady = Boolean(ammId && !coin1 && !coin2)
      if (isNotReady) return
      const queryHaveSetCoin = ['coin0', 'coin1', 'ammId'].some((i) => Object.keys(query).includes(i))
      const needFillCoin1 =
        !coin1 && !ammId && toPubString(coin2?.mint) !== toPubString(QuantumSOLVersionSOL.mint) && !queryHaveSetCoin
      if (needFillCoin1) {
        liquidityAtom.set({ coin1: QuantumSOLVersionSOL })
      }
      const needFillCoin2 = !coin2 && !ammId && toPubString(coin1?.mint) !== toPubString(RAYMint) && !queryHaveSetCoin
      if (needFillCoin2) {
        liquidityAtom.set({ coin2: getToken(RAYMint) })
      }
    }, 100)
  }, [getToken])
}
