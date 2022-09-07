/************
 * * * ATOM *
 ************/

import { createXAtom } from '@edsolater/xstore'
import { Connection } from '@solana/web3.js'
import { Endpoint } from './type'
import { extractConnectionName } from './utils/extractConnectionName'
import { getChainDate } from './utils/getChainDate'
import { deleteRpc, switchRpc } from './utils/swithRPC'

export type ConnectionAtom = {
  connection?: Connection
  version?: string | number
  availableEndPoints?: Endpoint[]
  // for online chain time is later than UTC
  chainTimeOffset?: number // UTCTime + onlineChainTimeOffset = onLineTime
  /**
   * for ui
   * maybe user customized
   * when isSwitchingRpcConnection it maybe not the currentConnection
   */
  currentEndPoint?: Endpoint
  /** recommanded */
  autoChoosedEndPoint?: Endpoint
  /** for ui loading */
  isLoading: boolean
  switchConnectionFailed: boolean
  userCostomizedUrlText: string
  loadingCustomizedEndPoint?: Endpoint
  /**
   * true: success to switch
   * false: fail to switch (connect error)
   * undefined: get result but not target endpoint (maybe user have another choice)
   */
  readonly switchRpc: (endPoint: Endpoint) => Promise<boolean | undefined>
  /**
   * true: success to switch
   * false: fail to switch (connect error)
   * undefined: get result but not target endpoint (maybe user have another choice)
   */
  readonly deleteRpc: (endPointUrl: Endpoint['url']) => Promise<boolean | undefined>
  readonly extractConnectionName: (url: string) => string
  readonly getChainDate: () => Date
}

export const connectionAtom = createXAtom<ConnectionAtom>({
  name: 'connection',
  default: () => ({
    availableEndPoints: [],
    isLoading: false,
    switchConnectionFailed: false,
    userCostomizedUrlText: 'https://',
    switchRpc,
    deleteRpc,
    extractConnectionName,
    getChainDate
  })
})
