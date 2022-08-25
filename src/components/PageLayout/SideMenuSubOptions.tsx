import useAppSettings from '@/application/appSettings/useAppSettings'
import { LinkAddress } from '@/types/constants'
import { Col, cssCol, cssRow, Div, Row } from '@edsolater/uikit'
import { ReactNode } from 'react'
import Link from '../../tempUikits/Link'
import Icon, { AppHeroIconName } from '../Icon'
import PageLayoutPopoverDrawer from '../PageLayoutPopoverDrawer'
import { CommunityPopover } from './CommunityWidget'
import { RpcConnectionFace, RpcConnectionPanelPopover } from './RpcConnectionWidget'
import { SlippageTolerancePopover } from './SlippageTolerancePopover'

export function SideMenuSubOptions({ className }: { className: string }) {
  return (
    <Div icss={cssCol()} className={className}>
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
    </Div>
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
      <Div icss={cssRow()} className="items-center w-full mobile:justify-center" onClick={onClick}>
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
      </Div>
    </Link>
  )
}
