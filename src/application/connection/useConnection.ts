import { createZustandStoreHook } from '@/../../xstore/dist'
import { connectionAtom } from './atom'

const useConnection = createZustandStoreHook(connectionAtom) // temp for aerosol
export default useConnection
