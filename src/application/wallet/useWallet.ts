import { createZustandStoreHook } from '@edsolater/xstore'
import { walletAtom } from './atom'

const useWallet = createZustandStoreHook(walletAtom) // temp for aerosol
export default useWallet
