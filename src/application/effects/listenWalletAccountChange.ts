import { createXEffect } from '@/../../xstore/dist'
import { toPub } from '@/functions/format/toMintString'
import { connectionAtom } from '../connection'
import { walletAtom } from '../wallet/atom'
import { invokeWalletAccountChangeListeners } from '../wallet/utils/walletAccountChangeListener'

export const listenWalletAccountChange = createXEffect(() => {
  const { connection } = connectionAtom.get()
  const { owner } = walletAtom.get()
  if (!connection || !owner) return
  const listenerId = connection.onAccountChange(
    toPub(owner),
    () => {
      invokeWalletAccountChangeListeners('confirmed')
    },
    'confirmed'
  )
  const listenerId2 = connection.onAccountChange(
    toPub(owner),
    () => {
      invokeWalletAccountChangeListeners('finalized')
    },
    'finalized'
  )
  return () => {
    connection.removeAccountChangeListener(listenerId)
    connection.removeAccountChangeListener(listenerId2)
  }
}, [connectionAtom.subscribe.connection, walletAtom.subscribe.owner])
