import { twMerge } from 'tailwind-merge'

import { PageRouteName, routeTo } from '@/application/routeTools'
import { Div, DivProps } from '@edsolater/uikit'

interface LinkProps extends DivProps {
  href?: string
  noTextStyle?: boolean
  /** it's a hint. avoid it just use auto detect */
  openInNewTab?: boolean
}

export default function Link({ href, noTextStyle, openInNewTab, ...restProps }: LinkProps) {
  if (!href) return <Div {...restProps} />
  const _isInnerLink = openInNewTab ? false : href.startsWith('/')
  return _isInnerLink ? (
    <Div
      {...restProps}
      as="span"
      htmlProps_={{
        tabIndex: 0
      }}
      className_={twMerge(`Link clickable ${noTextStyle ? '' : 'text-link-color hover:underline underline-offset-1'}`)}
      onClick_={() => {
        routeTo(href as PageRouteName)
      }}
    />
  ) : (
    // @ts-expect-error no check
    <Div<'a'>
      {...restProps}
      as="a"
      htmlProps_={{
        tabIndex: 0,
        rel: 'nofollow noopener noreferrer',
        target: '_blank',
        href
      }}
      className_={twMerge(`Link clickable ${noTextStyle ? '' : 'text-link-color hover:underline underline-offset-1'}`)}
    />
  )
}
