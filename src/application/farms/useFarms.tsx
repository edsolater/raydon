import useLocalStorageItem from '@/hooks/useLocalStorage'

export const useFarmFavoriteIds = () => useLocalStorageItem<string[]>('FAVOURITE_FARM_IDS')
