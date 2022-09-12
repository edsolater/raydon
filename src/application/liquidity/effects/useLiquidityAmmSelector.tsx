import { useEffect } from 'react'

import { tokenAtom } from '@/application/token'
import { isMintEqual } from '@/functions/judgers/areEqual'
import useAsyncEffect from '@/hooks/useAsyncEffect'

import useLiquidity from '../useLiquidity'
import { liquidityAtom } from '../atom'

/** coin1 coin2 ammId */
export default function useLiquidityAmmSelector() {
  const coin1 = useLiquidity((s) => s.coin1)
  const coin2 = useLiquidity((s) => s.coin2)
  const ammId = useLiquidity((s) => s.ammId)
  const currentJsonInfo = useLiquidity((s) => s.currentJsonInfo)

  /** update `coin1` and `coin2` (to match `ammId`) */
  useEffect(() => {
    if (!ammId) return
    const { coin1, coin2, jsonInfos } = liquidityAtom.get()
    const targetInfo = jsonInfos.find((info) => info.id === ammId)
    // current is right, no need to sync again
    if (isMintEqual(coin1?.mint, targetInfo?.baseMint) && isMintEqual(coin2?.mint, targetInfo?.quoteMint)) return
    if (isMintEqual(coin1?.mint, targetInfo?.quoteMint) && isMintEqual(coin2?.mint, targetInfo?.baseMint)) return

    const { getToken } = tokenAtom.get()
    const baseCoin = getToken(jsonInfos.find((i) => i.id === ammId)?.baseMint)
    const quoteCoin = getToken(jsonInfos.find((i) => i.id === ammId)?.quoteMint)
    liquidityAtom.set({
      coin1: baseCoin,
      coin2: quoteCoin
    })
  }, [ammId])

  /** update `ammId` (to match `coin1` and `coin2`) */
  useAsyncEffect(async () => {
    if (!coin1 || !coin2) return
    const { findLiquidityInfoByTokenMint, ammId } = liquidityAtom.get()

    const computeResult = await findLiquidityInfoByTokenMint(coin1?.mint, coin2?.mint)

    const resultPool = ammId
      ? computeResult.availables.find((p) => p.id === ammId) || computeResult.best
      : computeResult.best
    if (resultPool) {
      // current is right, no need to sync again
      if (ammId === resultPool?.id) return

      liquidityAtom.set({
        ammId: resultPool?.id,
        currentJsonInfo: resultPool
      })
    } else {
      // should clear ammId and currentJsonInfo
      liquidityAtom.set({
        ammId: undefined,
        currentJsonInfo: undefined
      })
    }
  }, [coin1, coin2])

  // update `currentJsonInfo` (to match `ammId`)
  useEffect(() => {
    if (!ammId) return
    const { jsonInfos, currentJsonInfo } = liquidityAtom.get()

    const alreadyMatched = currentJsonInfo?.id === ammId
    if (alreadyMatched) return

    const matchedInfo = jsonInfos.find((i) => i.id === ammId)
    liquidityAtom.set({ currentJsonInfo: matchedInfo })
  }, [ammId])

  // update `ammId` (to match `currentJsonInfo`)
  useEffect(() => {
    if (!currentJsonInfo) return
    const { ammId: currentAmmId } = liquidityAtom.get()

    const alreadyMatched = currentJsonInfo?.id === currentAmmId
    if (alreadyMatched) return

    const ammId = currentJsonInfo?.id
    liquidityAtom.set({ ammId })
  }, [currentJsonInfo])
}
