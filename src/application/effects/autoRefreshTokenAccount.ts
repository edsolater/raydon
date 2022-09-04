import { createXEffect } from '@edsolater/xstore'
import { connectionAtom } from '../connection'
import { walletAtom } from '../wallet/atom'
import { fetchTokenAccounts } from '../wallet/utils/getRichWalletTokenAccounts'
import {
  addWalletAccountChangeListener,
  removeWalletAccountChangeListener
} from '../wallet/utils/walletAccountChangeListener'

export const autoRefreshTokenAccount = createXEffect(() => {
  const { connection } = connectionAtom.get()
  const { owner } = walletAtom.get()
  if (!connection || !owner) return

  fetchTokenAccounts(connection, owner, { noSecondTry: true })
  const listenerId = addWalletAccountChangeListener(() => fetchTokenAccounts(connection, owner))
  return () => removeWalletAccountChangeListener(listenerId)
}, [connectionAtom.subscribe.connection, walletAtom.subscribe.owner])
