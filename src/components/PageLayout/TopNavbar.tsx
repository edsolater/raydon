import { MayFn, shrinkToValue } from '@edsolater/fnkit'
import { cssRow, Div, DivProps } from '@edsolater/uikit'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
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
