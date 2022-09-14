import { createXAtom } from '@edsolater/xstore'
import { HexAddress } from '@/types/constants'
import create from 'zustand'
import { tokenAtom } from '../token'
import { autoResetFarmCreatedBySelf } from './effects/autoResetFarmCreatedBySelf'
import { FarmPoolJsonInfo, HydratedFarmInfo, SdkParsedFarmInfo } from './type'

export type FarmStore = {
  /** detect if hydratedInfo is ready */
  isLoading: boolean
  jsonInfos: FarmPoolJsonInfo[] // TODO: switch to Object key value pair, for faster extracting
  sdkParsedInfos: SdkParsedFarmInfo[] // TODO: switch to Object key value pair, for faster extracting
  hydratedInfos: HydratedFarmInfo[] // TODO: switch to Object key value pair, for faster extracting

  /** if exist, show detail panel */
  detailedId?: HexAddress /* FarmIds */[]
  readonly isDetailPanelShown: boolean

  /**
   * front-end customized farm id list
   * expanded collapse items
   */
  expandedItemIds: Set<string>

  // do not care it's value, just trigger React refresh
  farmRefreshCount: number
  refreshFarmInfos(): void

  onlySelfFarms: boolean
  onlySelfCreatedFarms: boolean
  currentTab: 'Raydium' | 'Fusion' | 'Ecosystem' | 'Staked'
  timeBasis: '24H' | '7D' | '30D'
  searchText: string

  stakeDialogMode: 'deposit' | 'withdraw'
  isStakeDialogOpen: boolean
  stakeDialogInfo: undefined | HydratedFarmInfo
}

export const farmAtom = createXAtom<FarmStore>({
  name: 'farm',
  default: () => ({
    isLoading: true,
    jsonInfos: [],
    sdkParsedInfos: [],
    hydratedInfos: [],

    get isDetailPanelShown() {
      //FIXME: not reactive
      const detailIdCount = farmAtom.get().detailedId?.length
      return Boolean(detailIdCount && detailIdCount > 0)
    },
    expandedItemIds: new Set(),

    farmRefreshCount: 0,
    refreshFarmInfos: () => {
      farmAtom.set((s) => ({ farmRefreshCount: s.farmRefreshCount + 1 }))
      tokenAtom.get().refreshTokenPrice()
    },

    onlySelfFarms: false,
    onlySelfCreatedFarms: false,
    currentTab: 'Raydium',
    timeBasis: '7D',
    searchText: '',

    stakeDialogMode: 'deposit',
    isStakeDialogOpen: false,
    stakeDialogInfo: undefined
  })
})
