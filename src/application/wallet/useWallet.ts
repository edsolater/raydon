import { createZustandStoreHook } from '@/../../xstore/dist'
import { walletAtom } from './atom'

const useWallet = createZustandStoreHook(walletAtom) // temp for aerosol
export default useWallet
