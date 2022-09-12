import { createZustandStoreHook } from '@/../../xstore/dist'
import { swapAtom } from './atom'

export const useSwap = createZustandStoreHook(swapAtom) // temp for aerosol
