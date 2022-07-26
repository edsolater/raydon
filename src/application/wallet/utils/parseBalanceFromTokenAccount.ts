import { WSOLMint, toQuantumSolAmount, QuantumSOL, WSOL } from '@/application/token'
import { SplToken } from '@/application/token/type'
import toPubString from '@/functions/format/toMintString'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { add } from '@/functions/numberish/operations'
import toBN from '@/functions/numberish/toBN'
import { Numberish } from '@/types/constants'
import { listToMap, map, shakeNil } from '@edsolater/fnkit'
import { PublicKeyish, TokenAmount } from '@raydium-io/raydium-sdk'
import { ITokenAccount } from '../type'

export function parseBalanceFromTokenAccount({
  getPureToken,
  allTokenAccounts
}: {
  getPureToken: (mint: PublicKeyish | undefined) => SplToken | undefined
  allTokenAccounts: ITokenAccount[]
}) {
  const tokenAccounts = allTokenAccounts.filter((ta) => ta.isAssociated || ta.isNative)
  function toPureBalance(tokenAccount: ITokenAccount) {
    const tokenInfo = getPureToken(tokenAccount.mint)
    // console.log('tokenAccount: ', tokenAccount)
    if (!tokenInfo) return undefined
    return new TokenAmount(tokenInfo, tokenAccount.amount)
  }

  // currently WSOL show all balance(it a spectial hatch)
  // !it is in BN
  const allWsolBalance = allTokenAccounts.some((t) => isMintEqual(t.mint, WSOLMint))
    ? toBN(
        allTokenAccounts.reduce((acc, t) => (isMintEqual(t.mint, WSOLMint) ? add(acc, t.amount) : acc), 0 as Numberish)
      )
    : undefined

  const balancesOfTokenAccounts = listToMap(
    tokenAccounts,
    (tokenAccount) => String(tokenAccount.mint),
    (tokenAccount) => toPureBalance(tokenAccount)
  )
  // use TokenAmount (no QuantumSOL)
  const pureBalances = shakeNil({
    ...balancesOfTokenAccounts,
    [toPubString(WSOLMint)]: allWsolBalance ? toTokenAmount(WSOL, allWsolBalance) : undefined
  })

  // use BN (no QuantumSOL)
  const pureRawBalances = map(pureBalances, (balance) => balance.raw)

  // native sol balance (for QuantumSOL)
  const nativeTokenAccount = allTokenAccounts.find((ta) => ta.isNative)
  const solBalance = nativeTokenAccount?.amount

  // wsol balance (for QuantumSOL)
  const wsolBalance = tokenAccounts.find((ta) => String(ta.mint) === String(WSOLMint))?.amount

  // QuantumSOL balance
  const quantumSOLBalance = toQuantumSolAmount({ solRawAmount: solBalance, wsolRawAmount: wsolBalance })

  // use TokenAmount (QuantumSOL)
  const balances = { ...pureBalances, [String(QuantumSOL.mint)]: quantumSOLBalance }

  // use BN (QuantumSOL)
  const rawBalances = map(balances, (balance) => balance.raw)
  return { solBalance, allWsolBalance, balances, rawBalances, pureBalances, pureRawBalances, nativeTokenAccount }
}
