import useAppSettings from '@/application/appSettings/useAppSettings'
import { Div, DivProps, Row } from '@edsolater/uikit'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Link from '../../tempUikits/Link'
import Icon from '../Icon'

type RouteSettingItem = {
  label: string
  iconSrc: string
  href?: string // URL
  isExternal?: boolean
  // when link is local
  isActive?: (pathname: string) => boolean
  onClick?: () => void
}

export function SideMenuRoutes({ onRoute, ...restProps }: { onRoute?(to: string): void } & DivProps) {
  const routeSettings: RouteSettingItem[] = [
    {
      label: 'Trading',
      iconSrc: '/icons/entry-icon-trade.svg',
      href: 'https://dex.raydium.io/',
      onClick: () => onRoute?.('trade'),
      isExternal: true
    },
    {
      label: 'Swap',
      iconSrc: '/icons/entry-icon-swap.svg',
      href: '/swap',
      onClick: () => onRoute?.('swap'),
      isActive: (pathname) => pathname.includes('swap')
    },
    {
      label: 'Liquidity',
      iconSrc: '/icons/entry-icon-liquidity.svg',
      href: '/liquidity/add',
      onClick: () => onRoute?.('liquidity/add'),
      isActive: (pathname) => pathname.includes('liquidity')
    },
    {
      label: 'Pools',
      iconSrc: '/icons/entry-icon-pools.svg',
      href: '/pools',
      onClick: () => onRoute?.('pools'),
      isActive: (pathname) => pathname.includes('pools')
    },
    {
      label: 'Farms',
      iconSrc: '/icons/entry-icon-farms.svg',
      href: '/farms',
      onClick: () => onRoute?.('farms'),
      isActive: (pathname) => pathname.includes('farms')
    },
    {
      label: 'Staking',
      iconSrc: '/icons/entry-icon-staking.svg',
      href: '/staking',
      onClick: () => onRoute?.('staking'),
      isActive: (pathname) => pathname.includes('staking')
    },
    {
      label: 'Acceleraytor',
      iconSrc: '/icons/entry-icon-acceleraytor.svg',
      href: '/acceleraytor/list',
      onClick: () => onRoute?.('acceleraytor'),
      isActive: (pathname) => pathname.includes('acceleraytor')
    },
    {
      label: 'Dropzone',
      iconSrc: '/icons/entry-icon-dropzone.svg',
      href: 'https://dropzone.raydium.io/',
      onClick: () => onRoute?.('dropzone'),
      isExternal: true
    },
    {
      label: 'NFT',
      iconSrc: '/icons/entry-icon-nft.svg',
      href: 'https://nft.raydium.io/',
      onClick: () => onRoute?.('NFT'),
      isExternal: true
    }
  ]
  const { pathname } = useRouter()
  return (
    <Div {...restProps} className_={twMerge('py-4 space-y-1 mobile:py-0 px-2')}>
      {routeSettings.map((setting) => (
        <LinkItem
          key={setting.label + setting.href}
          onClick={setting.onClick}
          icon={setting.iconSrc}
          href={setting.href}
          isCurrentRoutePath={setting.isActive?.(pathname)}
        >
          {setting.label}
        </LinkItem>
      ))}
    </Div>
  )
}
function LinkItem({
  children,
  href,
  icon,
  isCurrentRoutePath,
  onClick
}: {
  children?: ReactNode
  href?: string
  icon?: string
  isCurrentRoutePath?: boolean
  onClick?: () => void
}) {
  const isInnerLink = href?.startsWith('/')
  const isExternalLink = !isInnerLink
  const isMobile = useAppSettings((s) => s.isMobile)
  return (
    <Link
      href={href}
      noTextStyle
      className={`group block py-2.5 mobile:py-1.5 px-4 mobile:px-1 rounded-xl mobile:rounded-lg hover:bg-[rgba(57,208,216,0.05)] ${
        isCurrentRoutePath ? 'bg-bg-link-active' : ''
      }`}
      onClick={onClick}
    >
      <Div icss={{ display: 'flex', alignItems: 'center', justifyContent: 'stretch' }}>
        <Icon forceColor="var(--icon-link)" className="mr-3" size={isMobile ? 'xs' : 'sm'} iconSrc={icon} />
        <Row
          className={twMerge(
            `items-center justify-between text-link ${
              isCurrentRoutePath ? 'text-link-active' : ''
            } text-sm mobile:text-xs font-medium`
          )}
        >
          <div>{children}</div>
          {isExternalLink && (
            <Icon inline className="opacity-80" size={isMobile ? 'xs' : 'sm'} heroIconName="external-link" />
          )}
        </Row>
      </Div>
    </Link>
  )
}
