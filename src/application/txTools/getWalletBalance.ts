import { toPub } from '@/functions/format/toMintString'
import { PublicKeyish } from '@raydium-io/raydium-sdk'
import { Connection } from '../connection'
import { SplToken } from '../token/type'
import { getWalletTokenAccounts, parseBalanceFromTokenAccount } from '../wallet'

export async function getWalletBalance({
  walletPublickeyish,
  connection,
  getPureToken
}: {
  walletPublickeyish: PublicKeyish
  connection: Connection
  getPureToken: (mint: PublicKeyish | undefined) => SplToken | undefined
}) {
  const { accounts, rawInfos } = await getWalletTokenAccounts({
    connection,
    owner: toPub(walletPublickeyish)
  })
  return parseBalanceFromTokenAccount({
    allTokenAccounts: accounts,
    getPureToken
  })
}
