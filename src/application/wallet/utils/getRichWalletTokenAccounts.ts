import { Connection, PublicKey } from '@solana/web3.js'
import useWallet from '../useWallet'
import { shakeFalsyItem } from '@/functions/arrayMethods'
import { listToJSMap } from '@/functions/format/listToMap'
import toPubString from '@/functions/format/toMintString'
import { eq } from '@/functions/numberish/compare'
import { getWalletTokenAccounts } from './getWalletTokenAccounts'
import { addWalletAccountChangeListener } from './walletAccountChangeListener'

/** if all tokenAccount amount is not changed (which may happen in 'confirmed'), auto fetch second time in 'finalized'*/
export const fetchTokenAccounts = async (
  connection: Connection,
  owner: PublicKey,
  options?: { noSecondTry?: boolean }
) => {
  const { allTokenAccounts, tokenAccountRawInfos, tokenAccounts, nativeTokenAccount } =
    await getRichWalletTokenAccounts({
      connection,
      owner: new PublicKey(owner)
    })

  //#region ------------------- diff -------------------
  const pastTokenAccounts = listToJSMap(
    useWallet.getState().allTokenAccounts,
    (a) => toPubString(a.publicKey) ?? 'native'
  )
  const newTokenAccounts = listToJSMap(allTokenAccounts, (a) => toPubString(a.publicKey) ?? 'native')
  const diffAccounts = shakeFalsyItem(
    [...newTokenAccounts].filter(([accountPub, { amount: newAmount }]) => {
      const pastAmount = pastTokenAccounts.get(accountPub)?.amount
      return !eq(newAmount, pastAmount)
    })
  )
  const diffCount = diffAccounts.length
  const hasWalletTokenAccountChanged = diffCount >= 2
  //#endregion
  if (options?.noSecondTry || hasWalletTokenAccountChanged || diffCount === 0) {
    useWallet.setState({
      tokenAccountRawInfos,
      nativeTokenAccount,
      tokenAccounts,
      allTokenAccounts
    })
  } else {
    // try in 'finalized'
    addWalletAccountChangeListener(
      async () => {
        const { allTokenAccounts, tokenAccountRawInfos, tokenAccounts, nativeTokenAccount } =
          await getRichWalletTokenAccounts({
            connection,
            owner: new PublicKey(owner)
          })
        useWallet.setState({
          tokenAccountRawInfos,
          nativeTokenAccount,
          tokenAccounts,
          allTokenAccounts
        })
      },
      {
        once: true,
        lifetime: 'finalized'
      }
    )
  }
}
/**  rich info of {@link getWalletTokenAccounts}'s return  */

export async function getRichWalletTokenAccounts(...params: Parameters<typeof getWalletTokenAccounts>) {
  const { accounts: allTokenAccounts, rawInfos } = await getWalletTokenAccounts(...params)
  return {
    tokenAccountRawInfos: rawInfos,
    nativeTokenAccount: allTokenAccounts.find((ta) => ta.isNative),
    tokenAccounts: allTokenAccounts.filter((ta) => ta.isAssociated),
    allTokenAccounts: allTokenAccounts
  }
}
