import useDevice from '@/hooks/useDevice'
import { shrinkToValue } from '@edsolater/fnkit'
import { MayFn } from '@edsolater/fnkit'
import { cssRow, Div, DivProps } from '@edsolater/uikit'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Grid from '../../tempUikits/Grid'
import Image from '../../tempUikits/Image'
import Link from '../../tempUikits/Link'
import Row from '../../tempUikits/Row'
import MessageBoardWidget from '../navWidgets/MessageBoardWidget'
import WalletWidget from '../navWidgets/WalletWidget'

export type TopNavbarProps = {
  barTitle?: string
  onOpenMenu?: () => void
  renderSlot1?: MayFn<ReactNode>
  renderSlot2?: MayFn<ReactNode>
  renderSlot3?: MayFn<ReactNode>
} & DivProps

/**
 * depend component:
 * - {@link MessageBoardWidget `<MessageBoardWidget>`}
 * - {@link WalletWidget `<WalletWidget>`}
 */
export function TopNavbar({
  barTitle,
  onOpenMenu,
  renderSlot1,
  renderSlot2,
  renderSlot3,
  ...restProps
}: TopNavbarProps) {
  // const { isMobile } = useDevice()
  // const pcNavContent = (
  //   <>
  //     <Div icss={cssRow({ items: 'center', gap: 32 })}>{shrinkToValue(renderSlot1)}</Div>
  //     <Div icss={cssRow({ items: 'center', gap: 32 })}>{shrinkToValue(renderSlot2)}</Div>
  //     <Div icss={cssRow({ items: 'center', gap: 32 })}>{shrinkToValue(renderSlot3)}</Div>
  //   </>
  // )
  // const mobileNavContent = (
  //   <Grid className="grid-cols-2 items-center">
  //     {barTitle ? (
  //       <div onClick={onOpenMenu} className="text-base font-semibold  text-white -mb-1">
  //         {barTitle}
  //       </div>
  //     ) : (
  //       <Link className="" href="/">
  //         <Image className="cursor-pointer" src="/logo/logo-only-icon.svg" />
  //       </Link>
  //     )}

  //     <Row className="gap-4 items-center justify-self-end">
  //       <MessageBoardWidget />
  //       <WalletWidget />
  //     </Row>
  //   </Grid>
  // )
  return (
    <Div
      as="nav"
      className_={twMerge('select-none text-white px-12 py-4 mobile:px-5 mobile:py-3 transition-all')}
      icss_={[cssRow({ justifyContent: 'space-between', items: 'center' }), { background: 'var(--navbar-bg)' }]}
      {...restProps}
    >
      <Div icss={cssRow({ items: 'center', gap: 32 })}>{shrinkToValue(renderSlot1)}</Div>
      <Div icss={cssRow({ items: 'center', gap: 32 })}>{shrinkToValue(renderSlot2)}</Div>
      <Div icss={cssRow({ items: 'center', gap: 32 })}>{shrinkToValue(renderSlot3)}</Div>
    </Div>
  )
}
