import { createXEffect } from '@edsolater/xstore'
import { fetchFarmJsonInfos } from '../utils/handleFarmInfo'
import { farmAtom } from '../atom'

export const autoRefetchFarmJsonInfos = createXEffect(async () => {
  const farmJsonInfos = await fetchFarmJsonInfos()
  if (farmJsonInfos) farmAtom.set({ jsonInfos: farmJsonInfos })
}, [farmAtom.subscribe.farmRefreshCount])
