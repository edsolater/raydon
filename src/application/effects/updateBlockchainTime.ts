/*****************
 * * ATOM EFFECT *
 *****************/

import { isExist } from '@/functions/judgers/nil'
import { minus, mul } from '@edsolater/fnkit'
import { createXEffect } from '@edsolater/xstore'
import { Connection } from '../connection'
import { connectionAtom } from '../connection/atom'

/** Atom effect */
export const autoUpdateBlockchainTime = createXEffect(() => {
  const { connection } = connectionAtom.get()
  getChainTimeOffset(connection).then((timeOffset) => {
    isExist(timeOffset) && connectionAtom.set({ chainTimeOffset: timeOffset })
  })
  const timeId = setInterval(() => {
    getChainTimeOffset(connection).then((timeOffset) => {
      isExist(timeOffset) && connectionAtom.set({ chainTimeOffset: timeOffset })
    })
  }, 1000 * 60 * 5)
  return () => clearInterval(timeId)
}, [connectionAtom.subscribe.connection])

async function getChainTimeOffset(connection: Connection | undefined) {
  if (!connection) return
  const chainTime = await connection.getBlockTime(await connection.getSlot())
  if (!chainTime) return
  const offset = Number(minus(mul(chainTime, 1000), Date.now()))
  return offset
}
