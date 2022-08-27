import React, { CSSProperties, RefObject } from 'react'

import { twMerge } from 'tailwind-merge'

import { SplToken, Token } from '@/application/token/type'

import Image from '../tempUikits/Image'
import { Div, DivProps } from '@/../../uikit/dist'

export interface CoinAvatarProps extends DivProps {
  /** the shadow transparent fondation border */
  noCoinIconBorder?: boolean
  haveAnime?: boolean
  /** this is a prop for faster develop */
  iconSrc?: string
  /** this can be used replace prop: `iconSrc` */
  /** if not specific it will show a default  dollar icon  */
  token?: Token | SplToken
  // basic
  className?: string
  /** sx: 16px | sm: 20px | smi: 24px | md: 32px | lg: 48px | 2xl: 80px | (default: md) */
  size?: 'xs' | 'sm' | 'smi' | 'md' | 'lg' | '2xl'
}

export default function CoinAvatar({
  noCoinIconBorder,
  haveAnime,

  iconSrc,
  token,

  className,
  size = 'md',
  ...divProps
}: CoinAvatarProps) {
  // if (!token && !iconSrc) return null
  const src =
    iconSrc ??
    ((token as any)?.icons as string[] | undefined) ??
    ((token as any)?.icon as string | undefined) ??
    '/coins/unknown.svg'
  const hasOpacity = !noCoinIconBorder
  const iconSize =
    size === '2xl'
      ? 'h-20 w-20'
      : size === 'lg'
      ? 'h-12 w-12'
      : size === 'md'
      ? 'h-8 w-8'
      : size === 'sm'
      ? 'h-5 w-5'
      : size === 'smi'
      ? 'h-6 w-6'
      : size === 'xs'
      ? 'w-4 h-4'
      : 'h-12 w-12'

  return (
    <Div {...divProps} className="CoinAvatar flex items-center gap-2">
      {!haveAnime ? (
        <Div
          className={twMerge(`${iconSize} rounded-full overflow-hidden`, className)}
          style={{
            background: 'linear-gradient(126.6deg, rgba(171, 196, 255, 0.2) 28.69%, rgba(171, 196, 255, 0) 100%)'
          }}
        >
          <Image
            className={`${iconSize} rounded-full overflow-hidden transition-transform transform ${
              hasOpacity ? 'scale-[.7]' : ''
            }`}
            src={src}
            fallbackSrc="/coins/unknown.svg"
          />
        </Div>
      ) : (
        <Div
          className={twMerge(`${iconSize} rounded-full swap-coin`, className)}
          icss={{ ['--delay' as string]: `${(Math.random() * 1000).toFixed(2)}ms` }}
        >
          <Image
            className={`front-face overflow-hidden transition-transform transform ${hasOpacity ? 'scale-[.7]' : ''}`}
            src={src}
            fallbackSrc="/coins/unknown.svg"
          />
          <Div className="line-group">
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
            <Div className="line-out">
              <Div className="line-inner"></Div>
            </Div>
          </Div>
          <Image
            className={`back-face overflow-hidden transition-transform transform ${hasOpacity ? 'scale-[.7]' : ''}`}
            src={src}
            fallbackSrc="/coins/unknown.svg"
          />
        </Div>
      )}
    </Div>
  )
}
