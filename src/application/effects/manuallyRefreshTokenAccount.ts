import { fetchTokenAccounts } from '../wallet/utils/getRichWalletTokenAccounts'
import { createXEffect } from '@/../../xstore/dist'
import { connectionAtom } from '../connection'
import { walletAtom } from '../wallet/atom'

export const manuallyRefreshTokenAccount = createXEffect(
  () => {
    const { connection } = connectionAtom.get()
    const { owner } = walletAtom.get()
    if (!connection || !owner) return
    fetchTokenAccounts(connection, owner, { noSecondTry: true })
  },
  [
    // TODO:subscribe it after createXAtom walletRefreshCount,
    // TODO:subscribe it after createXAtom swapRefreshCount,
    // TODO:subscribe it after createXAtom liquidityRefreshCount,
    // TODO:subscribe it after createXAtom farmRefreshCount,
    // TODO:subscribe it after createXAtom poolRefreshCount
  ]
)
