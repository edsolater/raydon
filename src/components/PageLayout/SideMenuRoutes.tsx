import useAppSettings from '@/application/appSettings/useAppSettings'
import { uiConfigAtom } from '@/models/uiConfig'
import { cssRow, Div, DivProps } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import { useRouter } from 'next/router'
import { twMerge } from 'tailwind-merge'
import Link from '../../tempUikits/Link'
import Icon from '../Icon'

export function SideMenuRoutes({ onClickRoute, ...restProps }: { onClickRoute?(): void } & DivProps) {
  const { pathname } = useRouter()
  const { sideMenuRoutes } = useXStore(uiConfigAtom)
  return (
    <Div {...restProps} className_={twMerge('py-4 space-y-1 mobile:py-0 px-2')}>
      {sideMenuRoutes.map((setting) => (
        <SideMenuRoutesLinkItem
          key={setting.label + setting.href}
          onClick={onClickRoute}
          icon={setting.iconSrc}
          href={setting.href}
          isCurrentRoutePath={setting.isActive?.(pathname)}
        >
          {setting.label}
        </SideMenuRoutesLinkItem>
      ))}
    </Div>
  )
}

function SideMenuRoutesLinkItem({
  children,
  href,
  icon,
  isCurrentRoutePath,
  ...restProps
}: {
  href?: string
  icon?: string
  isCurrentRoutePath?: boolean
} & DivProps) {
  const isInnerLink = href?.startsWith('/') // next /page route rule
  const isExternalLink = !isInnerLink
  const isMobile = useAppSettings((s) => s.isMobile)
  return (
    <Link
      {...restProps}
      href={href}
      noTextStyle
      icss={{
        display: 'block',
        paddingBlock: isMobile ? 6 : 10,
        paddingInline: isMobile ? 4 : 16,
        borderRadius: 8,
        ':hover': {
          background: 'rgba(57,208,216,0.05)'
        },
        background: isCurrentRoutePath ? 'var(--bg-link-active)' : undefined
      }}
    >
      <Div icss={{ display: 'flex', alignItems: 'center', justifyContent: 'stretch' }}>
        <Icon forceColor="var(--icon-link)" className="mr-3" size={isMobile ? 'xs' : 'sm'} iconSrc={icon} />
        <Div
          icss={cssRow({ items: 'center', gap: 8 })}
          className={twMerge(
            `text-link ${isCurrentRoutePath ? 'text-link-active' : ''} text-sm mobile:text-xs font-medium`
          )}
        >
          <Div>{children}</Div>
          {isExternalLink && (
            <Icon inline className="opacity-80" size={isMobile ? 'xs' : 'sm'} heroIconName="external-link" />
          )}
        </Div>
      </Div>
    </Link>
  )
}
