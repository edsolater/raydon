import { createXAtom, createXStore, XStoreAtom } from '@edsolater/xstore'

type RouteSettingItem = {
  label: string
  iconSrc: string
  href?: string // URL
  isExternal?: boolean
  // when link is local
  isActive?: (pathname: string) => boolean
}

export type UIConfigStore = {
  sideMenuRoutes: RouteSettingItem[]
}
export type UIConfigAtom = XStoreAtom<UIConfigStore>

/**
 * faster change app settings should change this atom
 */
export const uiConfigAtom = createXAtom<UIConfigStore>({
  name: 'uiConfig',
  default: {
    sideMenuRoutes: [
      {
        label: 'Trading',
        iconSrc: '/icons/entry-icon-trade.svg',
        href: 'https://dex.raydium.io/',
        isExternal: true
      },
      {
        label: 'Swap',
        iconSrc: '/icons/entry-icon-swap.svg',
        href: '/swap',
        isActive: (pathname) => pathname.includes('swap')
      },
      {
        label: 'Liquidity',
        iconSrc: '/icons/entry-icon-liquidity.svg',
        href: '/liquidity/add',
        isActive: (pathname) => pathname.includes('liquidity')
      },
      {
        label: 'Pools',
        iconSrc: '/icons/entry-icon-pools.svg',
        href: '/pools',
        isActive: (pathname) => pathname.includes('pools')
      },
      {
        label: 'Farms',
        iconSrc: '/icons/entry-icon-farms.svg',
        href: '/farms',
        isActive: (pathname) => pathname.includes('farms')
      },
      {
        label: 'Staking',
        iconSrc: '/icons/entry-icon-staking.svg',
        href: '/staking',
        isActive: (pathname) => pathname.includes('staking')
      },
      {
        label: 'Acceleraytor',
        iconSrc: '/icons/entry-icon-acceleraytor.svg',
        href: '/acceleraytor/list',
        isActive: (pathname) => pathname.includes('acceleraytor')
      },
      {
        label: 'Dropzone',
        iconSrc: '/icons/entry-icon-dropzone.svg',
        href: 'https://dropzone.raydium.io/',
        isExternal: true
      },
      {
        label: 'NFT',
        iconSrc: '/icons/entry-icon-nft.svg',
        href: 'https://nft.raydium.io/',
        isExternal: true
      }
    ]
  }
})
