import { Div, DivProps } from '@/../../uikit/dist'
import mergeRef from '@/functions/react/mergeRef'
import { useClick } from '@/hooks/useClick'
import { ReactNode, RefObject, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

export interface GridProps {
  className?: string
  children?: ReactNode
  style?: DivProps['style']
  domRef?: RefObject<HTMLDivElement | HTMLElement>
  onClick?: () => void
}

/**
 * actually, it's just a `<Div>` with grid
 */
export default function Grid({ className, children, style, domRef, onClick }: GridProps) {
  const ref = useRef<HTMLDivElement>()
  useClick(ref, { onClick, disable: !onClick })
  return (
    <Div
      domRef={mergeRef(domRef, ref) as RefObject<HTMLDivElement>}
      className={twMerge('grid', className)}
      style={style}
    >
      {children}
    </Div>
  )
}
