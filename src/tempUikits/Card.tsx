import { twMerge } from 'tailwind-merge'

import { Div, DivProps } from '@edsolater/uikit'

export interface CardProps extends DivProps {
  /** lg: rounded-3xl. md: rounded-md */
  size?: 'lg' | 'md'
}

export default function Card({ size = 'md', ...restProps }: CardProps) {
  return (
    <Div
      {...restProps}
      className_={twMerge(`Card ${size === 'lg' ? 'rounded-3xl' : 'rounded-xl'}`)}
      icss_={{ background: 'var(--card-bg)' }}
    />
  )
}
