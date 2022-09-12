import useLocalStorageItem from '@/hooks/useLocalStorage'
import { createZustandStoreHook } from '@edsolater/xstore'
import { farmAtom } from './atom'

const useFarms = createZustandStoreHook(farmAtom) // temp for aerosol
export default useFarms

export const useFarmFavoriteIds = () => useLocalStorageItem<string[]>('FAVOURITE_FARM_IDS')
