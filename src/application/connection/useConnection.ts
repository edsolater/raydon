import { createZustandStoreHook } from '@edsolater/xstore'
import { connectionAtom } from './atom'

const useConnection = createZustandStoreHook(connectionAtom) // temp for aerosol
export default useConnection
