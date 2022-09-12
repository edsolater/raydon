import { createZustandStoreHook } from '@edsolater/xstore'
import { liquidityAtom } from './atom'

const useLiquidity = createZustandStoreHook(liquidityAtom) // temp for aerosol
export default useLiquidity
