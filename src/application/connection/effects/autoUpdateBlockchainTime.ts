/*****************
 * * ATOM EFFECT *
 *****************/

import { createXEffect } from '@/../../xstore/dist'
import { minus, mul } from '@edsolater/fnkit'
import { Connection } from '@solana/web3.js'
import { connectionAtom } from '../atom'

/** Atom effect */
export const autoUpdateBlockchainTime = createXEffect(() => {
  const { connection } = connectionAtom.get()
  updateChinTimeOffset(connection)
  const timeId = setInterval(() => {
    updateChinTimeOffset(connection)
  }, 1000 * 60 * 5)
  return () => clearInterval(timeId) // TODO: haven't imply clean fn yet
}, [() => connectionAtom.subscribe.connection])

async function updateChinTimeOffset(connection: Connection | undefined) {
  if (!connection) return
  const chainTime = await connection.getBlockTime(await connection.getSlot())
  if (!chainTime) return
  const offset = Number(minus(mul(chainTime, 1000), Date.now()))
  connectionAtom.set({
    chainTimeOffset: offset
  })
}
