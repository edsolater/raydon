/*****************
 * * ATOM EFFECT *
 *****************/

import { createXEffect } from '@edsolater/xstore'
import { minus, mul } from '@edsolater/fnkit'
import { Connection } from '../connection'
import { connectionAtom } from '../connection/atom'
import { isExist } from '@/functions/judgers/nil'

/** Atom effect */
export const autoUpdateBlockchainTime = createXEffect(() => {
  const { connection } = connectionAtom.get()
  getChainTimeOffset(connection).then((timeOffset) => {
    isExist(timeOffset) && setState(timeOffset)
  })
  const timeId = setInterval(() => {
    getChainTimeOffset(connection).then((timeOffset) => {
      isExist(timeOffset) && setState(timeOffset)
    })
  }, 1000 * 60 * 5)
  return () => clearInterval(timeId) // TODO: haven't imply clean fn yet
}, [() => connectionAtom.subscribe.connection])

async function getChainTimeOffset(connection: Connection | undefined) {
  if (!connection) return
  const chainTime = await connection.getBlockTime(await connection.getSlot())
  if (!chainTime) return
  const offset = Number(minus(mul(chainTime, 1000), Date.now()))
  return offset
}

function setState(timeOffset: number) {
  connectionAtom.set({ chainTimeOffset: timeOffset })
  // self.postMessage({actionType: 'xatom-set', xatomName:'co'})
  globalThis.postMessage({ type: 'set connection', payload: timeOffset })
}
