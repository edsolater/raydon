import { createZustandStoreHook } from '@edsolater/xstore'
import { swapAtom } from './atom'

export const useSwap = createZustandStoreHook(swapAtom) // temp for aerosol
