import { createXEffect } from '@edsolater/xstore'
import { connectionAtom } from '../connection'
import { walletAtom } from '../wallet/atom'
import { parseBalanceFromTokenAccount } from '../wallet/utils/parseBalanceFromTokenAccount'

/** it is base on tokenAccounts, so when tokenAccounts refresh, balance will auto refresh */
export const initWalletBalance = createXEffect(() => {
  // TODO:subscribe it after createXAtom walletRefreshCount, // const { allTokenAccounts, owner } = walletAtom.get()
  // const { connection } = connectionAtom.get()
  // if (!connection || !owner) {
  //   walletAtom.set({
  //     solBalance: undefined,
  //     balances: {},
  //     rawBalances: {},
  //     pureBalances: {},
  //     pureRawBalances: {}
  //   })
  //   return
  // }
  // // from tokenAccount to tokenAmount
  // const { solBalance, allWsolBalance, balances, rawBalances, pureBalances, pureRawBalances } =
  //   parseBalanceFromTokenAccount({
  //     getPureToken,
  //     allTokenAccounts
  //   })
  // walletAtom.set({
  //   solBalance,
  //   allWsolBalance,
  //   balances,
  //   rawBalances,
  //   pureBalances,
  //   pureRawBalances
  // })
}, [
  connectionAtom.subscribe.connection,
  walletAtom.subscribe.allTokenAccounts,
  walletAtom.subscribe.owner
  // TODO:subscribe it after createXAtom walletRefreshCount, // tokenAtom.subscribe.pureTokens,
])
