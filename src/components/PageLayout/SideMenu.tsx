import useAppSettings from '@/application/appSettings/useAppSettings'
import { setCssVarible } from '@/functions/dom/cssVariable'
import { inClient } from '@/functions/judgers/isSSR'
import { LinkAddress } from '@/types/constants'
import { Col, Div, DivProps, Row } from '@edsolater/uikit'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import Image from '../../tempUikits/Image'
import Link from '../../tempUikits/Link'
import Icon, { AppHeroIconName } from '../Icon'
import PageLayoutPopoverDrawer from '../PageLayoutPopoverDrawer'
import { CommunityPopover } from './CommunityWidget'
import { RootLogo } from './RootLogo'
import { RpcConnectionFace, RpcConnectionPanelPopover } from './RpcConnectionWidget'
import { SlippageTolerancePopover } from './SlippageTolerancePopover'
import { VersionInfoBlock } from './VersionInfoBlock'

/**
 * depend component:
 * - {@link RpcConnectionFace `<RpcConnectionFace>`}
 * - {@link RpcConnectionPanelPopover `<RpcConnectionPanelPopover>`}
 * - {@link CommunityPopover `<CommunityPopover>`}
 * - {@link SlippageTolerancePopover `<SlippageTolerancePopover>`}
 */
export function SideMenu({
  // routes: {name:string, icon}
  onClickCloseBtn,
  onRoute,
  ...divProps
}: { onClickCloseBtn?(): void; onRoute?(): void } & DivProps) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const sideMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inClient) return
    setCssVarible(
      globalThis.document.documentElement,
      '--side-menu-width',
      sideMenuRef.current ? Math.min(sideMenuRef.current.clientWidth, sideMenuRef.current.clientHeight) : 0
    )
  }, [sideMenuRef])

  return (
    <Div
      {...divProps}
      className_="grid grid-rows-[auto,2fr,1fr,auto] h-full w-56 mobile:w-48 mobile:pt-4 mobile:pb-2"
      domRef_={sideMenuRef}
      style_={{
        background: isMobile
          ? 'linear-gradient(242.18deg, rgba(57, 208, 216, 0.08) 68.05%, rgba(57, 208, 216, 0.02) 86.71%), #0C0926'
          : undefined,
        boxShadow: isMobile ? '8px 0px 48px rgba(171, 196, 255, 0.12)' : undefined
      }}
    >
      <RootLogo />
      <MenuRouters className="shrink mr-2 mb-2 mobile:ml-2 overflow-y-auto" onRoute={onRoute} />
      <MenuSubOptions className="overflow-scroll no-native-scrollbar" />
      <VersionInfoBlock />
    </Div>
  )
}

function MenuRouters({ className, onRoute }: { className: string; onRoute?(to: string): void }) {
  const isInLocalhost = useAppSettings((s) => s.isInLocalhost)
  const { pathname } = useRouter()
  return (
    <div className={twMerge('py-4 space-y-1 mobile:py-0 px-2', className)}>
      <LinkItem
        onClick={() => {
          onRoute?.('trade')
        }}
        icon="/icons/entry-icon-trade.svg"
        href="https://dex.raydium.io/"
      >
        Trading
      </LinkItem>
      <LinkItem
        onClick={() => {
          onRoute?.('swap')
        }}
        icon="/icons/entry-icon-swap.svg"
        href="/swap"
        isCurrentRoutePath={pathname.includes('swap')}
      >
        Swap
      </LinkItem>
      <LinkItem
        onClick={() => {
          onRoute?.('liquidity/add')
        }}
        icon="/icons/entry-icon-liquidity.svg"
        href="/liquidity/add"
        isCurrentRoutePath={pathname.includes('liquidity')}
      >
        Liquidity
      </LinkItem>
      <LinkItem
        onClick={() => {
          onRoute?.('pools')
        }}
        icon="/icons/entry-icon-pools.svg"
        href="/pools"
        isCurrentRoutePath={pathname.includes('pools')}
      >
        Pools
      </LinkItem>
      <LinkItem
        onClick={() => {
          onRoute?.('farms')
        }}
        icon="/icons/entry-icon-farms.svg"
        href="/farms"
        isCurrentRoutePath={pathname.includes('farms')}
      >
        Farms
      </LinkItem>
      <LinkItem
        onClick={() => {
          onRoute?.('staking')
        }}
        icon="/icons/entry-icon-staking.svg"
        href="/staking"
        isCurrentRoutePath={pathname.includes('staking')}
      >
        Staking
      </LinkItem>
      <LinkItem
        onClick={() => {
          onRoute?.('acceleraytor')
        }}
        icon="/icons/entry-icon-acceleraytor.svg"
        href="/acceleraytor/list"
      >
        AcceleRaytor
      </LinkItem>
      {isInLocalhost && (
        <LinkItem
          onClick={() => {
            onRoute?.('basement')
          }}
          icon="/icons/entry-icon-acceleraytor.svg"
          href="/acceleraytor/basement"
        >
          Basement
        </LinkItem>
      )}
      <LinkItem
        onClick={() => {
          onRoute?.('dropzone')
        }}
        icon="/icons/entry-icon-dropzone.svg"
        href="https://dropzone.raydium.io/"
      >
        Dropzone
      </LinkItem>
      <LinkItem
        onClick={() => {
          onRoute?.('NFT')
        }}
        icon="/icons/entry-icon-nft.svg"
        href="https://nft.raydium.io/"
      >
        NFT
      </LinkItem>
    </div>
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

function MenuSubOptions({ className }: { className: string }) {
  return (
    <Col className={className}>
      <div className="mx-8 border-b border-[rgba(57,208,216,0.16)] my-2 mobile:my-1"></div>
      <div className="flex-1 overflow-auto no-native-scrollbar mt-2">
        <PageLayoutPopoverDrawer renderPopoverContent={({ close }) => <RpcConnectionPanelPopover close={close} />}>
          <RpcConnectionFace />
        </PageLayoutPopoverDrawer>

        <PageLayoutPopoverDrawer renderPopoverContent={<SlippageTolerancePopover />}>
          <OptionItem iconSrc="/icons/msic-settings.svg">Settings</OptionItem>
        </PageLayoutPopoverDrawer>

        <PageLayoutPopoverDrawer renderPopoverContent={<CommunityPopover />}>
          <OptionItem iconSrc="/icons/msic-community.svg">Community</OptionItem>
        </PageLayoutPopoverDrawer>

        <OptionItem noArrow href="https://raydium.gitbook.io/raydium/" iconSrc="/icons/msic-docs.svg">
          Docs
        </OptionItem>

        <OptionItem noArrow href="https://v1.raydium.io/swap" heroIconName="desktop-computer">
          Raydium V1
        </OptionItem>

        <OptionItem noArrow href="https://forms.gle/DvUS4YknduBgu2D7A" iconSrc="/icons/misc-feedback.svg">
          Feedback
        </OptionItem>
      </div>
    </Col>
  )
}

function OptionItem({
  noArrow,
  children,
  iconSrc,
  heroIconName,
  href,
  onClick
}: {
  noArrow?: boolean
  children: ReactNode
  iconSrc?: string
  heroIconName?: AppHeroIconName
  href?: LinkAddress
  onClick?(): void
}) {
  const isMobile = useAppSettings((s) => s.isMobile)
  return (
    <Link
      href={href}
      noTextStyle
      className="block py-3 mobile:py-1.5 px-8 pl-6 mobile:px-5 hover:bg-[rgba(57,208,216,0.1)] active:bg-[rgba(41,157,163,0.3)] cursor-pointer group"
    >
      <Row className="items-center w-full mobile:justify-center" onClick={onClick}>
        <Icon
          forceColor="var(--icon-link)"
          className="mr-3"
          size={isMobile ? 'xs' : 'sm'}
          iconSrc={iconSrc}
          heroIconName={heroIconName}
        />
        <span
          className={`text-link text-sm mobile:text-xs font-medium flex-grow ${
            href ? 'group-hover:text-link-active' : ''
          }`}
        >
          {children}
        </span>
        {!noArrow && <Icon size={isMobile ? 'xs' : 'sm'} heroIconName="chevron-right" iconClassName="text-secondary" />}
      </Row>
    </Link>
  )
}
