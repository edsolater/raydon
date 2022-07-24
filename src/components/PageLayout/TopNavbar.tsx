import React, { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'
import useAppSettings from '@/application/appSettings/useAppSettings'
import Grid from '../../tempUikits/Grid'
import Icon from '../Icon'
import Image from '../../tempUikits/Image'
import Link from '../../tempUikits/Link'
import MessageBoardWidget from '../navWidgets/MessageBoardWidget'
import WalletWidget from '../navWidgets/WalletWidget'
import Row from '../../tempUikits/Row'

/**
 * depend component:
 * - {@link MessageBoardWidget `<MessageBoardWidget>`}
 * - {@link WalletWidget `<WalletWidget>`}
 */
export function TopNavbar({
  barTitle,
  className,
  style,
  onOpenMenu
}: {
  className?: string
  barTitle?: string
  style?: CSSProperties
  // TODO: move it into useAppSetting()
  onOpenMenu?: () => void
}) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const pcNavContent = (
    <Row className="justify-between items-center">
      <Link href="/">
        <Image className="cursor-pointer" src="/logo/logo-with-text.svg" />
      </Link>

      <Row className="gap-8 items-center">
        <MessageBoardWidget />
        <WalletWidget />
      </Row>
    </Row>
  )
  const mobileNavContent = (
    <Grid className="grid-cols-3 items-center">
      <div className="frosted-glass-teal rounded-lg p-2 clickable justify-self-start" onClick={onOpenMenu}>
        <Icon className="w-4 h-4" iconClassName="w-4 h-4" iconSrc="/icons/msic-menu.svg" />
      </div>

      {barTitle ? (
        <div onClick={onOpenMenu} className="text-lg font-semibold place-self-center text-white -mb-1">
          {barTitle}
        </div>
      ) : (
        <Link className="place-self-center" href="/">
          <Image className="cursor-pointer" src="/logo/logo-only-icon.svg" />
        </Link>
      )}

      <Row className="gap-4 items-center justify-self-end">
        <MessageBoardWidget />
        <WalletWidget />
      </Row>
    </Grid>
  )
  return (
    <nav
      className={twMerge('select-none text-white px-12 py-4 mobile:px-5 mobile:py-3 transition-all', className)}
      style={style}
    >
      {isMobile ? mobileNavContent : pcNavContent}
    </nav>
  )
}
