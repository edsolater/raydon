import { Liquidity, MARKET_STATE_LAYOUT_V3, PublicKeyish, SPL_MINT_LAYOUT } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

import useConnection from '@/application/connection/useConnection'
import useNotification from '@/application/notification/useNotification'
import { usePools } from '@/application/pools/usePools'
import { WSOLMint } from '@/application/token'
import {
  ANAMint,
  ETHMint,
  mSOLMint,
  NRVMint,
  PAIMint,
  RAYMint,
  SRMMint,
  stSOLMint,
  USDCMint,
  USDHMint,
  USDTMint
} from '@/application/token'
import useWallet from '@/application/wallet/useWallet'
import assert from '@/functions/assert'
import toPubString, { toPub } from '@/functions/format/toMintString'

import useCreatePool from './useCreatePool'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { poolsAtom } from '../pools/atom'

export async function updateCreatePoolInfo(txParam: { marketId: PublicKeyish }): Promise<{ isSuccess: boolean }> {
  try {
    // find out if already exists this pool? disallow user to recreate
    const { jsonInfos } = poolsAtom.get()
    assert(!jsonInfos.some((i) => isMintEqual(i.market, txParam.marketId)), 'Pool already created')

    // get market info
    const { connection } = useConnection.getState()
    assert(connection, 'no rpc connection')
    const { owner } = useWallet.getState()
    assert(owner, 'require connect wallet')
    const marketBufferInfo = await connection.getAccountInfo(new PublicKey(txParam.marketId))
    assert(marketBufferInfo?.data, `can't find market ${txParam.marketId}`)
    const { baseMint, quoteMint } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data)

    const avaliableQuoteMints = {
      //TODO: actually just use getToken() is ok, this structure is build when getToken() is not ready
      USDT: toPubString(USDTMint),
      USDC: toPubString(USDCMint),
      RAY: toPubString(RAYMint),
      WSOL: toPubString(WSOLMint),
      SRM: toPubString(SRMMint),
      PAI: toPubString(PAIMint),
      mSOL: toPubString(mSOLMint),
      stSOL: toPubString(stSOLMint),
      USDH: toPubString(USDHMint),
      NRV: toPubString(NRVMint),
      ANA: toPubString(ANAMint),
      ETH: toPubString(ETHMint)
    }

    assert(
      Object.values(avaliableQuoteMints).includes(String(quoteMint)),
      `only support USDT, USDC, USDH, RAY, WSOL(SOL), mSOL, stSOL, SRM, PAI, NRV, ANA, ETH. current: ${toPubString(
        quoteMint
      ).slice(0, 4)}...${toPubString(quoteMint).slice(-4)} is not avaliable`
    )

    const baseTokenBufferInfo = await connection.getAccountInfo(new PublicKey(baseMint))
    assert(baseTokenBufferInfo?.data, `can't find token ${baseMint}`)
    const { decimals: baseTokenDecimals } = SPL_MINT_LAYOUT.decode(baseTokenBufferInfo.data)

    const quoteTokenBufferInfo = await connection.getAccountInfo(new PublicKey(quoteMint))
    assert(quoteTokenBufferInfo?.data, `can't find token ${quoteMint}`)
    const { decimals: quoteTokenDecimals } = SPL_MINT_LAYOUT.decode(quoteTokenBufferInfo.data)

    // assert user has eligible base and quote
    const { tokenAccounts } = useWallet.getState()
    const userBaseTokenAccount = tokenAccounts.find(({ mint }) => String(mint) === String(baseMint))
    const userQuoteTokenAccount = tokenAccounts.find(({ mint }) => String(mint) === String(quoteMint))

    assert(
      toPubString(quoteMint) === toPubString(WSOLMint) ? true : userQuoteTokenAccount,
      'user wallet has no quote token'
    )
    assert(
      toPubString(quoteMint) === toPubString(WSOLMint) ? true : !userQuoteTokenAccount?.amount.isZero(),
      'user wallet has 0 quote token'
    )
    assert(
      toPubString(baseMint) === toPubString(WSOLMint) ? true : userBaseTokenAccount,
      'user wallet has no base token'
    )
    assert(
      toPubString(baseMint) === toPubString(WSOLMint) ? true : !userBaseTokenAccount?.amount.isZero(),
      'user wallet has 0 base token'
    )

    // find associated poolKeys for market
    const associatedPoolKeys = await Liquidity.getAssociatedPoolKeys({
      version: 4,
      baseMint,
      quoteMint,
      marketId: toPub(txParam.marketId)
    })
    const { id: ammId, lpMint } = associatedPoolKeys
    useCreatePool.setState({ sdkAssociatedPoolKeys: associatedPoolKeys })

    assert(ammId, `can't find associated poolKeys for market`)

    useCreatePool.setState({
      lpMint: String(lpMint),
      ammId: String(ammId),
      marketId: String(txParam.marketId),
      baseMint: String(baseMint),
      quoteMint: String(quoteMint),
      baseDecimals: baseTokenDecimals,
      quoteDecimals: quoteTokenDecimals
    })

    const isAlreadyInited = Boolean((await connection?.getAccountInfo(new PublicKey(ammId)))?.data.length)
    assert(!isAlreadyInited, 'has already init this pool')
    return { isSuccess: true }
  } catch (error) {
    const { logError } = useNotification.getState()
    logError(error)
    return { isSuccess: false }
  }
}
