import { useEffect } from 'react'

import { useToken } from '@/application/token'
import { RAYMint } from '@/application/token'

import { useSwap } from './useSwap'
import toPubString from '@/functions/format/toMintString'
import { QuantumSOLVersionSOL } from '../token'
import { getURLQueryEntry } from '@/functions/dom/getURLQueryEntries'

export default function useSwapInitCoinFiller() {
  const getToken = useToken((s) => s.getToken)
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
