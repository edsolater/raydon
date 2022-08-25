import { Div, cssRow } from '@/../../uikit/dist'
import React, { MouseEvent, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export function ThreeSlotItem({
  className,
  textClassName,

  text,
  suffix,
  prefix,
  onClick
}: {
  className?: string
  textClassName?: string
  text: ReactNode
  suffix?: ReactNode
  prefix?: ReactNode
  onClick?(ev: MouseEvent): void
}) {
  return (
    <Div icss={cssRow()} className={twMerge('items-center', className)} onClick={({ ev }) => onClick?.(ev)}>
      {prefix}
      <div className={twMerge('grow text-sm whitespace-nowrap', textClassName)}>{text}</div>
      {suffix}
    </Div>
  )
}
