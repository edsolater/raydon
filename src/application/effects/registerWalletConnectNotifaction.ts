import useNotification from '@/application/notification/useNotification'
import { throttle } from '@/functions/debounce'
import toPubString from '@/functions/format/toMintString'
import { createXEffect } from '@edsolater/xstore'
import { walletAtom } from '../wallet/atom'

export const registerWalletConnectNotifaction = createXEffect(() => {
  const { adapter } = walletAtom.get()
  const logWarning = throttle(useNotification.getState().logWarning)
  const logSuccess = throttle(useNotification.getState().logSuccess)
  adapter?.addListener('connect', (pubkey) => {
    logSuccess(
      `${adapter?.name} wallet connected`,
      `wallet: ${toPubString(pubkey).slice(0, 4)}...${toPubString(pubkey).slice(-4)} `
    )
  })

  adapter?.addListener('disconnect', () => {
    logWarning(`${adapter?.name} Wallet disconnected`)
  })

  return () => {
    adapter?.removeAllListeners()
  }
}, [walletAtom.subscribe.adapter])
