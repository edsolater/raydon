/************
 * * * ATOM *
 ************/

import { isArray, isFunction, isObject } from '@/functions/judgers/dateType'
import { inClient } from '@/functions/judgers/isSSR'
import { createXAtom } from '@edsolater/xstore'
import { map } from '@edsolater/fnkit'
import { Connection } from '@solana/web3.js'
import { inMainThreadScope, inWebworkerScope } from '../effects/webworkerUtil'
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
type WebworkerXAtomTransformData = {
  type: 'xAtom set'
  payload: unknown
}
;(() => {
  if (inWebworkerScope()) {
    connectionAtom.subscribe('$any', ({ propertyName, value }) => {
      globalThis.postMessage({ type: 'xAtom set', payload: { [propertyName]: serializeWebworkerTransformData(value) } })
    })
  }
  if (inMainThreadScope()) {
    const webworkerHandler = new Worker(new URL('./worker', import.meta.url))
    webworkerHandler.postMessage('start')
    webworkerHandler.addEventListener('message', ({ data }) => {
      if (isWebworkerXAtomTransformData(data)) {
        //@ts-expect-error temp
        connectionAtom.set(deserializeWebworkerTransformData(data.payload)) // TODO type it !!!
      }
    })
  }
})()

export function isWebworkerXAtomTransformData(data: unknown): data is WebworkerXAtomTransformData {
  return isObject(data) && typeof data['type'] === 'string'
}

export function serializeWebworkerTransformData(data: unknown): unknown {
  if (data instanceof Connection) {
    return { type: 'connection', innerRpc: data.rpcEndpoint } // TODO add Connection[@@serialize]
  } else if (isObject(data)) {
    return map(data, (v) => serializeWebworkerTransformData(v))
  } else if (isFunction(data)) {
    throw new Error(`webworker can't transform function`)
  } else {
    return data
  }
}

export function deserializeWebworkerTransformData(data: unknown): unknown {
  if (isObject(data) && 'type' in data && data.type === 'connection') {
    return new Connection(data.innerRpc) // TODO add Connection[@@deserialize]
  } else if (isObject(data)) {
    return map(data, (v) => deserializeWebworkerTransformData(v))
  } else {
    return data
  }
}
