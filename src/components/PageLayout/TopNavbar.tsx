import useAppSettings from '@/application/appSettings/useAppSettings'
import { Div, DivProps } from '@edsolater/uikit'
import { twMerge } from 'tailwind-merge'
import Grid from '../../tempUikits/Grid'
import Image from '../../tempUikits/Image'
import Link from '../../tempUikits/Link'
import Row from '../../tempUikits/Row'
import MessageBoardWidget from '../navWidgets/MessageBoardWidget'
import WalletWidget from '../navWidgets/WalletWidget'

/**
 * depend component:
 * - {@link MessageBoardWidget `<MessageBoardWidget>`}
 * - {@link WalletWidget `<WalletWidget>`}
 */
export function TopNavbar({
  barTitle,
  onOpenMenu,
  ...restProps
}: { barTitle?: string; onOpenMenu?: () => void } & DivProps) {
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
    <Grid className="grid-cols-2 items-center">
      {barTitle ? (
        <div onClick={onOpenMenu} className="text-base font-semibold  text-white -mb-1">
          {barTitle}
        </div>
      ) : (
        <Link className="" href="/">
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
    <Div
      as="nav"
      className_={twMerge('select-none text-white px-12 py-4 mobile:px-5 mobile:py-3 transition-all')}
      icss_={{
        background: 'var(--navbar-bg)'
      }}
      {...restProps}
    >
      {isMobile ? mobileNavContent : pcNavContent}
    </Div>
  )
}
