import router from 'next/router'

import { ParsedUrlQuery } from 'querystring'

import { addItem } from '@/functions/arrayMethods'
import { cleanQuery } from '@/functions/dom/getURLQueryEntries'
import toPubString from '@/functions/format/toMintString'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { objectShakeFalsy, objectShakeNil } from '@/functions/objectMethods'
import { shrinkToValue } from '@/functions/shrinkToValue'
import { HexAddress, MayFunction } from '@/types/constants'
import { createNewUIRewardInfo, parsedHydratedRewardInfoToUiRewardInfo } from './createFarm/parseRewardInfo'
import useCreateFarms from './createFarm/useCreateFarm'
import { farmAtom } from './farms/atom'
import { HydratedFarmInfo } from './farms/type'
import useIdo from './ido/useIdo'
import { liquidityAtom } from './liquidity/atom'
import { swapAtom } from './swap/atom'
import { SplToken } from './token/type'
import useWallet from './wallet/useWallet'

export type PageRouteConfigs = {
  '/swap': {
    queryProps?: {
      coin1?: SplToken
      coin2?: SplToken
      ammId?: HexAddress
    }
  }
  '/liquidity/add': {
    queryProps?: {
      coin1?: SplToken
      coin2?: SplToken
      ammId?: string
      mode?: 'removeLiquidity'
    }
  }
  '/liquidity/create': {
    queryProps?: any
  }
  '/farms': {
    queryProps?: {
      searchText?: string
      currentTab?: 'Raydium' | 'Fusion' | 'Ecosystem' | 'Staked'
      newExpandedItemId?: string
    }
  }
  '/pools': {
    queryProps?: any
  }
  '/staking': {
    queryProps?: any
  }
  '/acceleraytor/list': {
    queryProps?: any
  }
  '/acceleraytor/detail': {
    queryProps?: {
      idoId?: HexAddress
    }
  }
  '/farms/create': {
    queryProps?: any
  }
  '/farms/createReview': {
    queryProps?: any
  }
  '/farms/edit': {
    queryProps: {
      farmInfo: HydratedFarmInfo
    }
  }
  '/farms/editReview': {
    queryProps?: any
  }
}

export type PageRouteName = keyof PageRouteConfigs

// TODO: parse url query function (can have prevState of zustand store)
export function routeTo<ToPage extends keyof PageRouteConfigs>(
  toPage: ToPage,
  opts?: MayFunction<PageRouteConfigs[ToPage], [{ currentPageQuery: ParsedUrlQuery }]>
) {
  const options = shrinkToValue(opts, [{ currentPageQuery: router.query }])
  if (toPage === '/swap') {
    const coin1 =
      options?.queryProps?.coin1 ?? (router.pathname.includes('/liquidity/add') ? liquidityAtom.get().coin1 : undefined)
    const coin2 =
      options?.queryProps?.coin2 ?? (router.pathname.includes('/liquidity/add') ? liquidityAtom.get().coin2 : undefined)
    const isSwapDirectionReversed = swapAtom.get().directionReversed
    const targetState = objectShakeFalsy(isSwapDirectionReversed ? { coin2: coin1, coin1: coin2 } : { coin1, coin2 })
    swapAtom.set(targetState)
    router.push({ pathname: '/swap' })
  } else if (toPage === '/liquidity/add') {
    /** get info from queryProp */
    const ammId = options?.queryProps?.ammId
    const coin1 = options?.queryProps?.coin1 ?? (router.pathname.includes('swap') ? swapAtom.get().coin1 : undefined)
    const coin2 = options?.queryProps?.coin2 ?? (router.pathname.includes('swap') ? swapAtom.get().coin2 : undefined)
    const isSwapDirectionReversed = swapAtom.get().directionReversed
    const upCoin = isSwapDirectionReversed ? coin2 : coin1
    const downCoin = isSwapDirectionReversed ? coin1 : coin2
    const mode = options?.queryProps?.mode
    liquidityAtom.set({
      coin1: upCoin,
      coin2: downCoin,
      ammId,
      isRemoveDialogOpen: mode === 'removeLiquidity'
    })
    router.push({ pathname: '/liquidity/add' })
  } else if (toPage === '/farms') {
    return router.push({ pathname: '/farms' }).then(() => {
      /** jump to target page */
      farmAtom.set((s) =>
        objectShakeFalsy({
          currentTab: options?.queryProps?.currentTab,
          searchText: options?.queryProps?.searchText,
          expandedItemIds: addItem(s.expandedItemIds, options?.queryProps?.newExpandedItemId)
        })
      )
      if (options?.queryProps?.newExpandedItemId) {
        farmAtom.set((s) => ({
          expandedItemIds: addItem(s.expandedItemIds, options.queryProps.newExpandedItemId)
        }))
      }
    })
  } else if (toPage === '/acceleraytor/detail') {
    return router
      .push({
        pathname: '/acceleraytor/detail',
        query: {
          idoId: options?.queryProps?.idoId
        }
      })
      .then(() => {
        /** jump to target page */
        useIdo.setState({
          currentIdoId: options?.queryProps?.idoId
        })
      })
  } else if (toPage === '/farms/create') {
    cleanQuery('farmid')
    // clear zustand createFarm
    useCreateFarms.setState({
      farmId: undefined,
      poolId: undefined,
      rewards: [{ ...createNewUIRewardInfo() }]
    })
    return router
      .push({
        pathname: '/farms/create'
      })
      .then(() => {
        farmAtom.set({
          searchText: ''
        })
      })
  } else if (toPage === '/farms/edit') {
    const farmInfo = (options!.queryProps as PageRouteConfigs['/farms/edit']['queryProps']).farmInfo
    const { owner } = useWallet.getState()
    return router
      .push({
        pathname: '/farms/edit',
        query: {
          farmId: farmInfo?.id.toBase58()
        }
      })
      .then(() => {
        useCreateFarms.setState(
          objectShakeNil({
            farmId: toPubString(farmInfo.id),
            poolId: farmInfo.ammId,
            rewards: farmInfo.rewards.map((reward) => parsedHydratedRewardInfoToUiRewardInfo(reward)),
            disableAddNewReward: !isMintEqual(farmInfo.creator, owner)
          })
        )
      })
  } else {
    return router.push({ pathname: toPage, query: options?.queryProps })
  }
  return
}

export const routeBack = () => router.back()
