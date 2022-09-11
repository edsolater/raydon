import useLocalStorageItem from '@/hooks/useLocalStorage'
import { createZustandStoreHook } from '@edsolater/xstore'
import { farmAtom } from './atom'

const useConnection = createZustandStoreHook(farmAtom) // temp for aerosol
export default useConnection

export const useFarmFavoriteIds = () => useLocalStorageItem<string[]>('FAVOURITE_FARM_IDS')
