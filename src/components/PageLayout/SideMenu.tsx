import useAppSettings from '@/application/appSettings/useAppSettings'
import { setCssVarible } from '@/functions/dom/cssVariable'
import { inClient } from '@/functions/judgers/isSSR'
import { LinkAddress } from '@/types/constants'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import Col from '../../tempUikits/Col'
import Image from '../../tempUikits/Image'
import Link from '../../tempUikits/Link'
import Row from '../../tempUikits/Row'
import Icon, { AppHeroIconName } from '../Icon'
import PageLayoutPopoverDrawer from '../PageLayoutPopoverDrawer'
import { CommunityPopover } from './CommunityWidget'
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
export function SideMenu({ className, onClickCloseBtn }: { className?: string; onClickCloseBtn?(): void }) {
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
    <>
      <Col
        domRef={sideMenuRef}
        className={twMerge(
          `h-full overflow-y-auto w-56 mobile:w-48 mobile:rounded-tr-2xl mobile:rounded-br-2xl`,
          className
        )}
        style={{
          background: isMobile
            ? 'linear-gradient(242.18deg, rgba(57, 208, 216, 0.08) 68.05%, rgba(57, 208, 216, 0.02) 86.71%), #0C0926'
            : undefined,
          boxShadow: isMobile ? '8px 0px 48px rgba(171, 196, 255, 0.12)' : undefined
        }}
      >
        {isMobile && (
          <Row className="items-center justify-between p-6 mobile:p-4 mobile:pl-8">
            <Link href="/">
              <Image src="/logo/logo-with-text.svg" className="mobile:scale-75" />
            </Link>
            <Icon
              size={isMobile ? 'sm' : 'md'}
              heroIconName="x"
              className="text-[rgba(57,208,216,0.8)] clickable clickable-mask-offset-2"
              onClick={onClickCloseBtn}
            />
          </Row>
        )}
        <Col className="grid grid-rows-[2fr,1fr,auto] flex-1 overflow-hidden">
          <MenuRouters className="shrink min-h-[120px] mr-2 mb-2 mobile:ml-2 overflow-y-auto" />
          <MenuSubOptions className="mobile:h-[180px] overflow-scroll no-native-scrollbar" />
          <VersionInfoBlock />
        </Col>
      </Col>
    </>
  )
}

function MenuRouters({ className }: { className: string }) {
  const isInLocalhost = useAppSettings((s) => s.isInLocalhost)
  const { pathname } = useRouter()

  return (
    <div className={twMerge('py-4 space-y-1 mobile:py-0 px-2', className)}>
      <LinkItem icon="/icons/entry-icon-trade.svg" href="https://dex.raydium.io/">
        Trading
      </LinkItem>
      <LinkItem icon="/icons/entry-icon-swap.svg" href="/swap" isCurrentRoutePath={pathname.includes('swap')}>
        Swap
      </LinkItem>
      <LinkItem
        icon="/icons/entry-icon-liquidity.svg"
        href="/liquidity/add"
        isCurrentRoutePath={pathname.includes('liquidity')}
      >
        Liquidity
      </LinkItem>
      <LinkItem icon="/icons/entry-icon-pools.svg" href="/pools" isCurrentRoutePath={pathname.includes('pools')}>
        Pools
      </LinkItem>
      <LinkItem icon="/icons/entry-icon-farms.svg" href="/farms" isCurrentRoutePath={pathname.includes('farms')}>
        Farms
      </LinkItem>
      <LinkItem icon="/icons/entry-icon-staking.svg" href="/staking" isCurrentRoutePath={pathname.includes('staking')}>
        Staking
      </LinkItem>
      <LinkItem icon="/icons/entry-icon-acceleraytor.svg" href="/acceleraytor/list">
        AcceleRaytor
      </LinkItem>
      {isInLocalhost && (
        <LinkItem icon="/icons/entry-icon-acceleraytor.svg" href="/acceleraytor/basement">
          Basement
        </LinkItem>
      )}
      <LinkItem icon="/icons/entry-icon-dropzone.svg" href="https://dropzone.raydium.io/">
        Dropzone
      </LinkItem>
      <LinkItem icon="/icons/entry-icon-nft.svg" href="https://nft.raydium.io/">
        NFT
      </LinkItem>
    </div>
  )
}

function LinkItem({
  children,
  href,
  icon,
  isCurrentRoutePath
}: {
  children?: ReactNode
  href?: string
  icon?: string
  isCurrentRoutePath?: boolean
}) {
  const isInnerLink = href?.startsWith('/')
  const isExternalLink = !isInnerLink
  const isMobile = useAppSettings((s) => s.isMobile)
  return (
    <Link
      href={href}
      noTextStyle
      className={`group block py-2.5 mobile:py-2 px-4 mobile:px-1 rounded-xl mobile:rounded-lg hover:bg-[rgba(57,208,216,0.05)] ${
        isCurrentRoutePath ? 'bg-[rgba(57,208,216,0.1)]' : ''
      }`}
    >
      <Row className="items-center">
        <div className="grid bg-gradient-to-br from-[rgba(57,208,216,0.2)] to-[rgba(57,208,216,0)] rounded-lg p-1.5 mr-3">
          <Icon size={isMobile ? 'xs' : 'sm'} iconSrc={icon} />
        </div>
        <Row
          className={`grow items-center justify-between text-[#ACE3E5] ${
            isCurrentRoutePath ? 'text-[rgba(57,208,216,1)]' : ''
          } text-sm mobile:text-xs font-medium`}
        >
          <div>{children}</div>
          {isExternalLink && (
            <Icon inline className="opacity-80" size={isMobile ? 'xs' : 'sm'} heroIconName="external-link" />
          )}
        </Row>
      </Row>
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
      className="block py-3 mobile:py-3 px-8 pl-6 mobile:px-5 hover:bg-[rgba(57,208,216,0.1)] active:bg-[rgba(41,157,163,0.3)] cursor-pointer group"
    >
      <Row className="items-center w-full mobile:justify-center" onClick={onClick}>
        <Icon
          className="mr-3 text-[rgba(57,208,216,1)]"
          size={isMobile ? 'xs' : 'sm'}
          iconSrc={iconSrc}
          heroIconName={heroIconName}
        />
        <span
          className={`text-[#ACE3E5] text-sm mobile:text-xs font-medium flex-grow ${
            href ? 'group-hover:text-[rgba(57,208,216,1)]' : ''
          }`}
        >
          {children}
        </span>
        {!noArrow && <Icon size={isMobile ? 'xs' : 'sm'} heroIconName="chevron-right" iconClassName="text-[#ACE3E6]" />}
      </Row>
    </Link>
  )
}