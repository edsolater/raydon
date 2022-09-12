import { createXEffect } from '@edsolater/xstore'
import { walletAtom } from '@/application/wallet'
import { farmAtom } from '../atom'

export const autoResetFarmCreatedBySelf = createXEffect(async () => {
  const { owner } = walletAtom.get()
  if (!owner) return
  farmAtom.set({ onlySelfCreatedFarms: false })
}, [walletAtom.subscribe.owner])
