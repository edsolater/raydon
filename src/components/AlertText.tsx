import { ReactNode } from 'react'

import { Div } from '@/../../uikit/dist'
import Icon, { IconProps } from '@/components/Icon'

/**
 * component type: styled UI component
 */
export default function AlertText({
  children,
  className,
  iconSize
}: {
  children?: ReactNode
  className?: string
  iconSize?: IconProps['size']
}) {
  return (
    <Div className={`AlertText grid grid-flow-col gap-2 items-center ${className}`}>
      <Icon className="flex-shrink-0" size={iconSize} heroIconName="exclamation-circle" />
      <div>{children}</div>
    </Div>
  )
}
