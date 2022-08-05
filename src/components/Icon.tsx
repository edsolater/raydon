import { Fragment, RefObject, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import mergeRef from '@/functions/react/mergeRef'
import { useClick, UseClickOptions } from '@/hooks/useClick'
import { useHover, UseHoverOptions } from '@/hooks/useHover'
import {
  AdjustmentsIcon,
  BellIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClipboardCopyIcon,
  DesktopComputerIcon,
  ExclamationCircleIcon,
  ExclamationIcon,
  ExternalLinkIcon,
  InformationCircleIcon,
  MenuIcon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  RefreshIcon,
  SearchIcon,
  StarIcon,
  SwitchHorizontalIcon,
  SwitchVerticalIcon,
  XIcon,
  TrashIcon,
  DotsHorizontalIcon,
  XCircleIcon,
  PlusCircleIcon,
  PencilIcon,
  LinkIcon,
  DotsVerticalIcon
} from '@heroicons/react/outline'
import { ArrowCircleRightIcon } from '@heroicons/react/outline'

import { getFileNameOfURI } from '../functions/dom/getFileNameOfURI'
import { Div, DivProps, Image } from '@edsolater/uikit'

export type AppHeroIconName =
  | 'menu'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'x'
  | 'adjustments'
  | 'switch-vertical'
  | 'plus'
  | 'minus'
  | 'check-circle'
  | 'x-circle'
  | 'information-circle'
  | 'exclamation'
  | 'exclamation-circle'
  | 'question-mark-circle'
  | 'clipboard-copy'
  | 'external-link'
  | 'refresh'
  | 'search'
  | 'check'
  | 'star'
  | 'switch-horizontal'
  | 'bell'
  | 'desktop-computer'
  | 'trash'
  | 'dots-horizontal'
  | 'dots-vertical'
  | 'arrow-circle-right' // solid
  | 'plus-circle'
  | 'pencil'
  | 'link'
  | ' '

export interface IconProps extends DivProps {
  /** clickable icon can have special css */
  clickable?: boolean
  iconClassName?: string
  // TODO heroIcon?: (props: React.ComponentProps<'svg'>) => JSX.Element
  heroIconName?: AppHeroIconName
  iconSrc?: string
  /** sx: 12px; sm: 16px; smi: 20px; md: 24px; lg: 32px (default: md) */
  size?: 'xs' | 'sm' | 'smi' | 'md' | 'lg'
  /** component outer display will be block not-inline (TODO: it's nice if it can stay in className)*/
  inline?: boolean
  onHover?: UseHoverOptions['onHover']
  /* this prop will auto add some tailwind class for Icon */
  forceColor?: string // TODO: <Icon> can basicly change theme color
}

export default function Icon({
  clickable,
  heroIconName,
  iconClassName,
  iconSrc,

  inline,
  onHover,
  /* this prop will auto add some tailwind class for Icon */
  forceColor,
  className,
  /** sx: 12px; sm: 16px; smi: 20px;  md: 24px; lg: 32px (default: md) */
  size = 'md',
  ...restProps
}: IconProps) {
  const selfRef = useRef()
  const clickableClassName =
    'opacity-75 hover:opacity-90 active:opacity-70 clickable clickable-filter-effect clickable-mask-offset-3'
  const styleClass = twMerge(`Icon ${inline ? 'inline-grid' : 'grid'}`, clickable && clickableClassName, className)
  useHover(selfRef, { onHover, disable: !onHover })

  if (heroIconName) {
    const HeroIconComponent =
      heroIconName === 'menu'
        ? MenuIcon
        : heroIconName === 'chevron-up'
        ? ChevronUpIcon
        : heroIconName === 'chevron-down'
        ? ChevronDownIcon
        : heroIconName === 'chevron-left'
        ? ChevronLeftIcon
        : heroIconName === 'chevron-right'
        ? ChevronRightIcon
        : heroIconName === 'x'
        ? XIcon
        : heroIconName === 'adjustments'
        ? AdjustmentsIcon
        : heroIconName === 'switch-vertical'
        ? SwitchVerticalIcon
        : heroIconName === 'plus'
        ? PlusIcon
        : heroIconName === 'minus'
        ? MinusIcon
        : heroIconName === 'check-circle'
        ? CheckCircleIcon
        : heroIconName === 'x-circle'
        ? XCircleIcon
        : heroIconName === 'exclamation'
        ? ExclamationIcon
        : heroIconName === 'exclamation-circle'
        ? ExclamationCircleIcon
        : heroIconName === 'information-circle'
        ? InformationCircleIcon
        : heroIconName === 'question-mark-circle'
        ? QuestionMarkCircleIcon
        : heroIconName === 'clipboard-copy'
        ? ClipboardCopyIcon
        : heroIconName === 'external-link'
        ? ExternalLinkIcon
        : heroIconName === 'refresh'
        ? RefreshIcon
        : heroIconName === 'search'
        ? SearchIcon
        : heroIconName === 'check'
        ? CheckIcon
        : heroIconName === 'star'
        ? StarIcon
        : heroIconName === 'switch-horizontal'
        ? SwitchHorizontalIcon
        : heroIconName === 'bell'
        ? BellIcon
        : heroIconName === 'desktop-computer'
        ? DesktopComputerIcon
        : heroIconName === 'trash'
        ? TrashIcon
        : heroIconName === 'dots-horizontal'
        ? DotsHorizontalIcon
        : heroIconName === 'dots-vertical'
        ? DotsVerticalIcon
        : heroIconName === 'arrow-circle-right'
        ? ArrowCircleRightIcon
        : heroIconName === 'plus-circle'
        ? PlusCircleIcon
        : heroIconName === 'pencil'
        ? PencilIcon
        : heroIconName === 'link'
        ? LinkIcon
        : heroIconName === ' '
        ? ({ className }: { className?: string }) => <div className={className} />
        : Fragment
    return (
      <Div {...restProps} className_={styleClass} domRef_={selfRef}>
        <HeroIconComponent
          /** HeroIcon can't use ref */
          className={twMerge(
            `select-none w-full h-full ${
              size === 'md'
                ? 'h-6 w-6'
                : size === 'smi'
                ? 'h-5 w-5'
                : size === 'sm'
                ? 'h-4 w-4'
                : size === 'xs'
                ? 'h-3 w-3'
                : 'h-8 w-8'
            }`,
            iconClassName
          )}
        />
      </Div>
    )
  }

  if (iconSrc) {
    return (
      <>
        {forceColor ? (
          <Div
            {...restProps}
            className_={styleClass}
            icss_={{
              background: forceColor,
              mask: `url(${iconSrc})`,
              maskSize: '100% 100%',
              width: size === 'lg' ? 32 : size === 'smi' ? 20 : size === 'sm' ? 16 : size === 'xs' ? 12 : 24,
              height: size === 'lg' ? 32 : size === 'smi' ? 20 : size === 'sm' ? 16 : size === 'xs' ? 12 : 24
            }}
          ></Div>
        ) : (
          <Div {...restProps} domRef_={selfRef}>
            <Image
              src={iconSrc}
              alt={getFileNameOfURI(iconSrc ?? '')}
              className={twMerge(
                `select-none w-full h-full ${
                  size === 'md'
                    ? 'h-6 w-6'
                    : size === 'smi'
                    ? 'h-5 w-5'
                    : size === 'sm'
                    ? 'h-4 w-4'
                    : size === 'xs'
                    ? 'h-3 w-3'
                    : 'h-8 w-8'
                }`,
                iconClassName
              )}
            />
          </Div>
        )}
      </>
    )
  }

  console.warn('not heroIconName or iconName in <Icon>')
  return null
}

export const socialIconSrcMap = {
  website: '/icons/acceleraytor-global.svg',
  twitter: '/icons/acceleraytor-twitter.svg',
  telegram: '/icons/acceleraytor-telegram.svg',
  discord: '/icons/acceleraytor-discord.svg',
  medium: '/icons/acceleraytor-medium.svg',
  twitch: '/icons/acceleraytor-twitch.svg',
  youtube: '/icons/acceleraytor-youtube.svg'
}
