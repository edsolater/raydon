/*****************
 * * ATOM EFFECT *
 *****************/

import { getSessionItem } from '@/functions/dom/jStorage'
import { unifyByKey } from '@edsolater/fnkit'
import { jFetch } from '@edsolater/jfetch'
import { createXEffect } from '@edsolater/xstore'
import { Connection } from '@solana/web3.js'
import { Config, Endpoint } from '../connection'
import { connectionAtom } from '../connection/atom'
import caculateEndpointUrlByRpcConfig from '../connection/utils/chooseBestRPC'

const devRpcConfig: Omit<Config, 'success'> = {
  rpcs: [
    // { name: 'genesysgo', url: 'https://raydium.genesysgo.net', weight: 0 }
    // { name: 'rpcpool', url: 'https://raydium.rpcpool.com', weight: 100 }
    // { url: 'https://arbirgis.rpcpool.com/', weight: 100 },
    // { url: 'https://solana-api.projectserum.com', weight: 100 }
    { name: 'beta-mainnet', url: 'https://api.mainnet-beta.solana.com/' },
    // { name: 'api.mainnet', url: 'https://api.mainnet.rpcpool.com/' }, // not support ws
    { name: 'tt', url: 'https://solana-api.tt-prod.net', weight: 100 },
    { name: 'apricot', url: 'https://apricot-main-67cd.mainnet.rpcpool.com/' }
  ],
  strategy: 'speed'
}

export const SESSION_STORAGE_USER_SELECTED_RPC = 'USER_SELECTED_RPC'

/**
 * will initialize one official RPC (auto select currently the best one)
 * *IMPORTANT: all fetch action must have a reliable RPC**
 */
export const loadPredefinedRPC = createXEffect(async () => {
  connectionAtom.set({ isLoading: true })
  const data = await jFetch<Config>('https://api.raydium.io/v2/main/rpcs')

  if (!data) return
  // dev test
  if (!globalThis.location.host.includes('raydium.io')) {
    Reflect.set(data, 'rpcs', devRpcConfig.rpcs)
    Reflect.set(data, 'strategy', devRpcConfig.strategy)
  }

  const selectedEndpointUrl = await caculateEndpointUrlByRpcConfig(data)
  const userSelectedRpc = getSessionItem<Endpoint>(SESSION_STORAGE_USER_SELECTED_RPC)

  // IDEA : what if cache the connection in storage
  const connection = new Connection(userSelectedRpc?.url ?? selectedEndpointUrl, 'confirmed')

  const { availableEndPoints, currentEndPoint } = connectionAtom.get()
  connectionAtom.set({
    availableEndPoints: unifyByKey([...data.rpcs, ...(availableEndPoints ?? [])], (i) => i.url),
    autoChoosedEndPoint: data.rpcs.find(({ url }) => url === selectedEndpointUrl),
    currentEndPoint: currentEndPoint ?? userSelectedRpc ?? data.rpcs.find(({ url }) => url === selectedEndpointUrl),
    connection,
    isLoading: false
  })
}, [])
