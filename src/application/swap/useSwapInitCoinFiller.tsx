import { useEffect } from 'react'

import { RAYMint, tokenAtom } from '@/application/token'

import { getURLQueryEntry } from '@/functions/dom/getURLQueryEntries'
import toPubString from '@/functions/format/toMintString'
import { useXStore } from '@edsolater/xstore'
import { QuantumSOLVersionSOL } from '../token'
import { useSwap } from './useSwap'

export default function useSwapInitCoinFiller() {
  const { getToken } = useXStore(tokenAtom)
  useEffect(() => {
    const { coin1, coin2 } = useSwap.getState()
    const query = getURLQueryEntry()
    const queryHaveSetCoin = ['inputCurrency', 'outputCurrency'].some((i) => Object.keys(query).includes(i))
    if (!coin1 && toPubString(coin2?.mint) !== toPubString(QuantumSOLVersionSOL.mint) && !queryHaveSetCoin) {
      useSwap.setState({ coin1: QuantumSOLVersionSOL })
    }
    if (!coin2 && toPubString(coin1?.mint) !== toPubString(RAYMint) && !queryHaveSetCoin) {
      useSwap.setState({ coin2: getToken(RAYMint) })
    }
  }, [getToken])
}
