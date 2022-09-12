import { XAtom } from '@edsolater/xstore'
import toPubString, { toPub } from '@/functions/format/toMintString'
import { isFunction, isObject } from '@/functions/judgers/dateType'
import { AnyFn, listToMap, map } from '@edsolater/fnkit'
import { Connection, PublicKey } from '@solana/web3.js'

function inWebworkerScope() {
  try {
    return globalThis instanceof DedicatedWorkerGlobalScope
  } catch {
    return false
  }
}
function inMainThreadScope() {
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

function isWebworkerXAtomTransformData(data: unknown): data is WebworkerXAtomTransformData {
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

const serializeSymbol = Symbol('serialize')
const deserializeSymbol = Symbol('deserialize')

const transformRules = new Map<
  unknown,
  { constructor: any; constructorKey: string; serialize: AnyFn; deserialize: AnyFn }
>([
  [
    Connection,
    {
      constructor: Connection,
      constructorKey: 'connection',
      serialize: (data: Connection) => ({ innerRpc: data.rpcEndpoint }),
      deserialize: (fromworker: { innerRpc: string }) => new Connection(fromworker.innerRpc)
    }
  ],
  [
    PublicKey,
    {
      constructor: PublicKey,
      constructorKey: 'publicKey',
      serialize: (data: PublicKey) => ({ content: toPubString(data) }),
      deserialize: ({ content }: { content: string }) => toPub(content)
    }
  ]
])
const revertTransformRules = new Map([...transformRules.values()].map((i) => [i.constructorKey, i]))

function serializeWebworkerTransformData(data: unknown): unknown {
  if (isObject(data) && data[serializeSymbol]) {
    return data[serializeSymbol]()
  } else if (isObject(data) && transformRules.has(data.constructor)) {
    return {
      ...transformRules.get(data.constructor)!.serialize(data),
      constructorKey: transformRules.get(data.constructor)!.constructorKey
    }
  } else if (isObject(data)) {
    return map(data, (v) => serializeWebworkerTransformData(v))
  } else if (isFunction(data)) {
    console.error(data)
    throw new Error(`webworker can't transform function`)
  } else {
    return data
  }
}

function deserializeWebworkerTransformData(data: unknown): unknown {
  if (isObject(data) && data[deserializeSymbol]) {
    return data[deserializeSymbol]()
  } else if (isObject(data) && 'constructorKey' in data && revertTransformRules.has(data.constructorKey)) {
    return revertTransformRules.get(data.constructorKey)!.deserialize(data)
  } else if (isObject(data)) {
    return map(data, (v) => deserializeWebworkerTransformData(v))
  } else {
    return data
  }
}
