import useLocalStorageItem from '@/hooks/useLocalStorage'

// TODO: to XAtom and XEffects
export const usePoolFavoriteIds = () => useLocalStorageItem<string[]>('FAVOURITE_POOL_IDS')
