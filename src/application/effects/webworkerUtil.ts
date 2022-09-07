import { XAtom } from '@/../../xstore/dist'
import { isFunction, isObject } from '@/functions/judgers/dateType'
import { listToMap, map } from '@edsolater/fnkit'
import { Connection } from '@solana/web3.js'

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

type WebworkerXAtomTransformData = {
  type: 'xAtom set'
  atomName: string
  payload: unknown
}

export function isWebworkerXAtomTransformData(data: unknown): data is WebworkerXAtomTransformData {
  return isObject(data) && typeof data['type'] === 'string' && typeof data['atomName'] === 'string'
}

/**
 * it can establish an "sync bridge" between [webwork scope's xAtom] and [main thread scrope's xAtom]
 * start
 * @example
 * syncWebworkerAndMainThread({ workerHandler: new URL('./worker', import.meta.url), atoms: [connectionAtom] })
 */
export function establishXAtomMainThreadSide({
  makeWorkerHandler,
  atoms
}: {
  makeWorkerHandler: () => Worker
  atoms: XAtom<any>[]
}) {
  if (inMainThreadScope()) {
    const atomMap = listToMap(atoms, (i) => i.name)
    const workerHandler = makeWorkerHandler()
    workerHandler.addEventListener('message', ({ data }) => {
      if (isWebworkerXAtomTransformData(data)) {
        const targetAtom = atomMap[data.atomName]
        targetAtom?.set(deserializeWebworkerTransformData(data.payload) as any)
      }
    })
  }
}

export function establishXAtomWebworkerSide(atoms: XAtom<any>[]) {
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
}
