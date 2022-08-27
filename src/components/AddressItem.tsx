import { Div, cssRow } from '@edsolater/uikit'
import copyToClipboard from '@/functions/dom/copyToClipboard'
import toPubString from '@/functions/format/toMintString'
import useToggle from '@/hooks/useToggle'
import { ThreeSlotItem } from '@/tempUikits/ThreeSlotItem'
import { AnyFn } from '@/types/constants'
import { PublicKeyish } from '@raydium-io/raydium-sdk'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import Icon from './Icon'

/**
 * base on {@link ThreeSlotItem}
 */
export function AddressItem({
  canCopy = true,
  canExternalLink = false,
  className,
  textClassName,
  iconClassName,
  children: publicKey,
  showDigitCount = 6,
  addressType = 'account',
  onCopied
}: {
  canCopy?: boolean
  canExternalLink?: boolean
  className?: string
  textClassName?: string
  iconClassName?: string
  children: PublicKeyish | undefined
  showDigitCount?: number | 'all'
  addressType?: 'token' | 'account'
  onCopied?(text: string): void // TODO: imply it
}) {
  const [isCopied, { delayOff, on }] = useToggle(false, { delay: 400 })

  useEffect(() => {
    if (isCopied) delayOff()
  }, [isCopied])

  const handleClickCopy = (ev: { stopPropagation: AnyFn }) => {
    ev.stopPropagation()
    if (!isCopied) copyToClipboard(toPubString(publicKey)).then(on)
  }

  if (!publicKey) return null
  return (
    <ThreeSlotItem
      className={className}
      textClassName={textClassName}
      text={
        <Div
          htmlProps={{ title: toPubString(publicKey) }}
          className="relative"
          onClick={({ ev }) => canCopy && handleClickCopy(ev)}
        >
          <Div className={`${isCopied ? 'opacity-10' : 'opacity-100'} transition`}>
            {showDigitCount === 'all'
              ? `${toPubString(publicKey)}`
              : `${toPubString(publicKey).slice(0, showDigitCount)}...${toPubString(publicKey).slice(
                  -1 * showDigitCount
                )}`}
          </Div>
          <Div
            className={`absolute inset-0 ${
              isCopied ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            } transition flex items-center justify-center`}
          >
            Copied
          </Div>
        </Div>
      }
      suffix={
        canCopy || canExternalLink ? (
          <Div icss={cssRow()} className="gap-1 ml-3">
            {canCopy ? (
              <Icon
                size="sm"
                className={twMerge('clickable text-primary', iconClassName)}
                heroIconName="clipboard-copy"
                onClick={({ ev }) => handleClickCopy(ev)}
              />
            ) : null}
            {canExternalLink ? (
              <Link href={`https://solscan.io/${addressType}/${publicKey}`}>
                <Icon size="sm" heroIconName="external-link" className="clickable text-primary" />
              </Link>
            ) : null}
          </Div>
        ) : null
      }
    />
  )
}
