import { getLocalItem } from '@/functions/dom/jStorage'
import { concat, unifyByKey } from '@edsolater/fnkit'
import { createAtomEffect, createXEffect } from '@edsolater/xstore'
import { connectionAtom } from '../atom'
import { UserCustomizedEndpoint } from '../type'
import { LOCALSTORAGE_KEY_USER_RPC } from '../utils/swithRPC'

export const loadUserRPC = createXEffect(() => {
  const storagedEndpoints = getLocalItem<UserCustomizedEndpoint[]>(LOCALSTORAGE_KEY_USER_RPC)
  connectionAtom.set((old) => ({
    availableEndPoints: unifyByKey(concat(old.availableEndPoints, storagedEndpoints), (i) => i.url)
  }))
}, [])
