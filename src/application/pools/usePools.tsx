import { createZustandStoreHook } from '@/../../xstore/dist'
import useLocalStorageItem from '@/hooks/useLocalStorage'
import { poolsAtom } from './atom'

export const usePools = createZustandStoreHook(poolsAtom) // temp for aerosol

export const usePoolFavoriteIds = () => useLocalStorageItem<string[]>('FAVOURITE_POOL_IDS')
