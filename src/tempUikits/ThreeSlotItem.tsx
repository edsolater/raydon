import { Div, cssRow } from '@edsolater/uikit'
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
      <Div className={twMerge('grow text-sm whitespace-nowrap', textClassName)}>{text}</Div>
      {suffix}
    </Div>
  )
}
