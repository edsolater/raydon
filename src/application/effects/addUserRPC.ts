import { getLocalItem } from '@/functions/dom/jStorage'
import { concat, unifyByKey } from '@edsolater/fnkit'
import { createAtomEffect, createXEffect } from '@edsolater/xstore'
import { connectionAtom } from '../connection/atom'
import { UserCustomizedEndpoint } from '../connection'
import { LOCALSTORAGE_KEY_USER_RPC } from '../connection/utils/swithRPC'

export const addUserRPC = createXEffect(() => {
  const storagedEndpoints = getLocalItem<UserCustomizedEndpoint[]>(LOCALSTORAGE_KEY_USER_RPC)
  connectionAtom.set((old) => ({
    availableEndPoints: unifyByKey(concat(old.availableEndPoints, storagedEndpoints), (i) => i.url)
  }))
}, [])
