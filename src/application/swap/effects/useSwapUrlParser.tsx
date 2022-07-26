import useAppSettings from '@/application/appSettings/useAppSettings'
import { liquidityAtom } from '@/application/liquidity/atom'
import useNotification from '@/application/notification/useNotification'
import { tokenAtom } from '@/application/token'
import { hasSameItems } from '@/functions/arrayMethods'
import { throttle } from '@/functions/debounce'
import toPubString from '@/functions/format/toMintString'
import { areShallowEqual, isStringInsensitivelyEqual } from '@/functions/judgers/areEqual'
import { toString } from '@/functions/numberish/toString'
import { objectShakeFalsy, omit } from '@/functions/objectMethods'
import useAsyncEffect from '@/hooks/useAsyncEffect'
import { EnumStr } from '@/types/constants'
import { useXStore } from '@edsolater/xstore'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import { useCallback, useEffect, useRef } from 'react'
import useConnection from '../../connection/useConnection'
import { QuantumSOLVersionSOL, QuantumSOLVersionWSOL, WSOLMint } from '../../token'
import { getUserTokenEvenNotExist } from '../../token/utils/getUserTokenEvenNotExist'
import { swapAtom } from '../atom'

function isSolAndWsol(query1: string, query2: string): boolean {
  return query1 === 'sol' && query2 === toPubString(WSOLMint)
}
function isWsolAndSol(query1: string, query2: string): boolean {
  return query1 === toPubString(WSOLMint) && query2 === 'sol'
}

export default function useSwapUrlParser(): void {
  const { query, pathname, replace } = useRouter()
  const { coin1: swapCoin1 } = useXStore(swapAtom)
  const { coin2: swapCoin2 } = useXStore(swapAtom)
  const { coin1Amount: swapCoin1Amount } = useXStore(swapAtom)
  const { coin2Amount: swapCoin2Amount } = useXStore(swapAtom)
  const { focusSide: swapFocusSide } = useXStore(swapAtom)
  const { directionReversed: swapDirectionReversed } = useXStore(swapAtom)
  const { jsonInfos: liquidityPoolJsonInfos } = useXStore(liquidityAtom)
  const { findLiquidityInfoByTokenMint } = useXStore(liquidityAtom)
  const findLiquidityInfoByAmmId = useCallback(
    (ammid: string) => liquidityPoolJsonInfos.find((jsonInfo) => jsonInfo.id === ammid),
    [liquidityPoolJsonInfos]
  )
  const connection = useConnection((s) => s.connection)
  const { tokens, userAddedTokens, getToken, toUrlMint } = useXStore(tokenAtom)
  const inCleanUrlMode = useAppSettings((s) => s.inCleanUrlMode)

  // flag: 'get info from url' period  or  'affect info to url' period
  const haveInit = useRef(false)

  useEffect(() => {
    // when not /swap page, reset flag
    if (!pathname.includes('/swap')) {
      haveInit.current = false
    }
  }, [pathname])
  useEffect(() => {
    // when refresh window, reset flag
    const unload = () => (haveInit.current = false)
    globalThis?.addEventListener('beforeunload', unload)
    return () => globalThis?.removeEventListener('beforeunload', unload)
  }, [])

  // from url
  useAsyncEffect(async () => {
    // only get data from url when /swap page is route from other page
    if (!pathname.includes('/swap')) return

    // not in 'from url' period
    if (haveInit.current) return

    // // eslint-disable-next-line no-console
    // console.info('debug: get swap info from url')

    const {
      ammId: urlAmmId,
      inputCurrency: urlCoin1Mint,
      outputCurrency: urlCoin2Mint,
      inputSymbol: urlCoin1Symbol,
      outputSymbol: urlCoin2Symbol,
      inputAmount: urlCoin1Amount,
      outputAmount: urlCoin2Amount,
      fixed: urlFixedSide
    } = getSwapInfoFromQuery(query)

    if (isSolAndWsol(urlCoin1Mint, urlCoin2Mint)) {
      // SPECIAL CASE: wrap (sol ⇢ wsol)
      swapAtom.set({ coin1: QuantumSOLVersionSOL, coin2: QuantumSOLVersionWSOL })
    } else if (isWsolAndSol(urlCoin1Mint, urlCoin2Mint)) {
      // SPECIAL CASE: unwrap (wsol ⇢ sol)
      swapAtom.set({ coin1: QuantumSOLVersionWSOL, coin2: QuantumSOLVersionSOL })
    } else if (urlAmmId) {
      // from URL: according to user's ammId , match liquidity pool json info, extract it's base and quote as coin1 and coin2
      const { logWarning } = useNotification.getState()
      const urlCoin1 = await getUserTokenEvenNotExist(urlCoin1Mint, urlCoin1Symbol)
      const urlCoin2 = await getUserTokenEvenNotExist(urlCoin2Mint, urlCoin2Symbol)
      const matchedLiquidityJsonInfo = urlAmmId
        ? findLiquidityInfoByAmmId(urlAmmId)
        : urlCoin1 && urlCoin2
        ? (await findLiquidityInfoByTokenMint(urlCoin1.mint, urlCoin2.mint)).best
        : undefined
      if (matchedLiquidityJsonInfo) {
        const coin1 = getToken(matchedLiquidityJsonInfo?.baseMint) ?? urlCoin1
        const coin2 = getToken(matchedLiquidityJsonInfo?.quoteMint) ?? urlCoin2

        // sync to swap zustand store
        if (
          // already have correct info, no need parse info from url again
          !hasSameItems([urlCoin1Mint, urlCoin2Mint], [String(coin1?.mint), String(coin2?.mint)])
        ) {
          swapAtom.set(objectShakeFalsy({ coin1, coin2 }))
        }
      } else {
        // may be just haven't load liquidityPoolJsonInfos yet
        if (liquidityPoolJsonInfos.length > 0 && Object.keys(tokens || {}).length > 0) {
          logWarning(`can't find Liquidity pool with url ammId`)
        }
      }
    } else if (urlCoin1Mint || urlCoin2Mint) {
      // attach coin1 and coin2 to swap zustand store
      const urlCoin1 = await getUserTokenEvenNotExist(urlCoin1Mint, urlCoin1Symbol)
      const urlCoin2 = await getUserTokenEvenNotExist(urlCoin2Mint, urlCoin2Symbol)

      swapAtom.set(objectShakeFalsy({ coin1: urlCoin1, coin2: urlCoin1 === urlCoin2 ? undefined : urlCoin2 }))
    }

    // parse amount
    const coin1Amount = urlCoin1Mint ? urlCoin1Amount : urlCoin2Mint ? urlCoin2Amount : undefined
    const coin2Amount = urlCoin2Mint ? urlCoin2Amount : urlCoin1Mint ? urlCoin1Amount : undefined
    if (coin1Amount) swapAtom.set({ coin1Amount })
    if (coin2Amount) swapAtom.set({ coin2Amount })

    // parse fixed side
    const currentFixedSide = swapDirectionReversed
      ? swapFocusSide === 'coin2'
        ? 'in'
        : 'out'
      : swapFocusSide === 'coin2'
      ? 'out'
      : 'in'
    const isUrlFixedSideValid = urlFixedSide === 'in' || urlFixedSide === 'out'
    if (isUrlFixedSideValid && currentFixedSide !== urlFixedSide) {
      const correspondingFocusSide =
        urlFixedSide === 'in' ? (swapDirectionReversed ? 'coin2' : 'coin1') : swapDirectionReversed ? 'coin1' : 'coin2'
      swapAtom.set({ focusSide: correspondingFocusSide })
    }

    // if not load enough data, do not change state
    if (liquidityPoolJsonInfos.length > 0 && Object.values(tokens).length > 0) {
      haveInit.current = true
    }
  }, [
    connection,
    pathname,
    query,
    getToken,
    tokens,
    userAddedTokens,
    replace,
    liquidityPoolJsonInfos,
    findLiquidityInfoByAmmId
  ])

  //#region ------------------- sync zustand data to url -------------------
  const throttledUpdateUrl = useCallback(
    throttle(
      (pathname: string, query: Record<string, any>) => {
        replace({ pathname, query }, undefined, { shallow: true })
      },
      { delay: 100 }
    ),
    []
  )

  useEffect(() => {
    if (!pathname.includes('/swap')) return
    // console.log('haveInit.current: ', haveInit.current)

    // not in 'affect to url' period
    if (!haveInit.current) return

    // no need to affact change to url if it's  clean-url-mode
    if (inCleanUrlMode) return

    const coin1Mint = swapCoin1 ? toUrlMint(swapCoin1) : ''
    const coin2Mint = swapCoin2 ? toUrlMint(swapCoin2) : ''
    const coin1Symbol = swapCoin1?.userAdded ? swapCoin1.symbol : undefined
    const coin2Symbol = swapCoin2?.userAdded ? swapCoin2.symbol : undefined
    const upCoinMint = swapDirectionReversed ? coin2Mint : coin1Mint
    const downCoinMint = swapDirectionReversed ? coin1Mint : coin2Mint
    const upCoinAmount = swapDirectionReversed ? swapCoin2Amount : swapCoin1Amount
    const downCoinAmount = swapDirectionReversed ? swapCoin1Amount : swapCoin2Amount

    const urlInfo = omit(getSwapInfoFromQuery(query), ['ammId'])

    // attach state to url
    const dataInfo = objectShakeFalsy({
      inputCurrency: upCoinMint,
      inputSymbol: coin1Symbol,
      outputCurrency: downCoinMint,
      outputSymbol: coin2Symbol,
      inputAmount: toString(upCoinAmount),
      outputAmount: toString(downCoinAmount),
      fixed: swapDirectionReversed
        ? swapFocusSide === 'coin2'
          ? 'in'
          : 'out'
        : swapFocusSide === 'coin2'
        ? 'out'
        : 'in'
    })
    const urlNeedUpdate = !areShallowEqual(urlInfo, dataInfo)
    if (urlNeedUpdate) throttledUpdateUrl(pathname, dataInfo)
  }, [
    inCleanUrlMode,
    swapCoin1,
    swapCoin2,
    swapCoin1Amount,
    swapCoin2Amount,
    swapDirectionReversed,
    swapFocusSide,
    query,
    replace,
    pathname
  ])
  //#endregion
}

function getSwapInfoFromQuery(query: ParsedUrlQuery): {
  ammId: string
  inputCurrency: string
  inputSymbol: string
  outputCurrency: string
  outputSymbol: string
  inputAmount: string
  outputAmount: string
  fixed: EnumStr | 'in' | 'out'
} {
  const notTouchableSymbols = ['ray', 'sol'] // url can't have red symbol
  const rawObj = {
    ammId: String(query.ammId ?? query.ammid ?? ''),
    inputCurrency: String(query.inputCurrency ?? ''),
    inputSymbol: String(query.inputSymbol ?? ''),
    outputCurrency: String(query.outputCurrency ?? ''),
    outputSymbol: String(query.outputSymbol ?? ''),
    inputAmount: String(query.inputAmount ?? ''),
    outputAmount: String(query.outputAmount ?? ''),
    fixed: String(query.fixed ?? '')
  }
  if (notTouchableSymbols.some((symbol) => isStringInsensitivelyEqual(symbol, rawObj.inputSymbol))) {
    rawObj.inputCurrency = ''
    rawObj.inputAmount = ''
    rawObj.inputSymbol = ''
  }
  if (notTouchableSymbols.some((symbol) => isStringInsensitivelyEqual(symbol, rawObj.outputSymbol))) {
    rawObj.outputCurrency = ''
    rawObj.outputAmount = ''
    rawObj.outputSymbol = ''
  }
  return objectShakeFalsy(rawObj)
}
