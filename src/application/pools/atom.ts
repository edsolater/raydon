import { createXAtom } from '@/../../xstore/dist'
import { HexAddress } from '@/types/constants'
import { Price } from '@raydium-io/raydium-sdk'
import { HydratedPairItemInfo, JsonPairItemInfo } from './type'

// backEnd naming: Pools -> PairInfo
export type PoolsStore = {
  loading: boolean
  jsonInfos: JsonPairItemInfo[]
  hydratedInfos: HydratedPairItemInfo[]
  lpPrices: Record<HexAddress, Price>
  tvl?: string | number // /api.raydium.io/v2/main/info
  volume24h?: string | number // /api.raydium.io/v2/main/info

  /** UI States */
  searchText: string
  timeBasis: '24H' | '7D' | '30D'
  currentTab: 'All' | 'Raydium' | 'Permissionless' // currently shouldn't show this to user.
  onlySelfPools: boolean

  // just for trigger refresh
  refreshCount: number
  refreshPools: () => void
}

// FAQ: why it's a domain? because it must be a domain , or it's a design bug ———— do something useless.
export const poolsAtom = createXAtom<PoolsStore>({
  name: 'pools',
  default: () => ({
    loading: true,
    jsonInfos: [],
    hydratedInfos: [],
    lpPrices: {},

    /** UI States */
    searchText: '',
    timeBasis: '7D',
    currentTab: 'All',
    onlySelfPools: false,

    refreshCount: 0,
    refreshPools: () => {
      poolsAtom.set((s) => ({
        refreshCount: s.refreshCount + 1
      }))
    }
  })
})
