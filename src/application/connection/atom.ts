/************
 * * * ATOM *
 ************/

import listToMap from '@/functions/format/listToMap'
import { isFunction, isObject } from '@/functions/judgers/dateType'
import { map } from '@edsolater/fnkit'
import { createXAtom, XAtom } from '@edsolater/xstore'
import { Connection } from '@solana/web3.js'
import { tokenAtom } from '../token'
import { walletAtom } from '../wallet'
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
  atomName: string
  payload: unknown
}
/**
 * it can establish an "sync bridge" between [webwork scope's xAtom] and [main thread scrope's xAtom]
 * start
 * @example
 * syncWebworkerAndMainThread({ workerHandler: new URL('./worker', import.meta.url), atoms: [connectionAtom] })
 */
function syncWebworkerAndMainThread({
  makeWorkerHandler,
  atoms
}: {
  makeWorkerHandler: () => Worker
  atoms: XAtom<any>[]
}) {
  if (inWebworkerScope()) {
    atoms.forEach((atom) => {
      atom.subscribe('$any', ({ propertyName, value }) => {
        globalThis.postMessage({
          type: 'xAtom set',
          atomName: atom.name,
          payload: { [propertyName]: serializeWebworkerTransformData(value) }
        })
      })
    })
  }
  if (inMainThreadScope()) {
    const atomMap = listToMap(atoms, (i) => i.name)
    const workerHandler = makeWorkerHandler()
    workerHandler.addEventListener('message', ({ data }) => {
      if (isWebworkerXAtomTransformData(data)) {
        const targetAtom = atomMap[data.atomName]
        //@ts-expect-error temp
        targetAtom && targetAtom.set(deserializeWebworkerTransformData(data.payload))
      }
    })
  }
}
syncWebworkerAndMainThread({
  makeWorkerHandler: () => new Worker(new URL('./worker', import.meta.url)),
  atoms: [connectionAtom]
})

export function isWebworkerXAtomTransformData(data: unknown): data is WebworkerXAtomTransformData {
  return isObject(data) && typeof data['type'] === 'string' && typeof data['atomName'] === 'string'
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

export function inWebworkerScope() {
  try {
    return globalThis instanceof DedicatedWorkerGlobalScope
  } catch {
    return false
  }
}
export function inMainThreadScope() {
  try {
    return globalThis instanceof Window
  } catch {
    return false
  }
}
