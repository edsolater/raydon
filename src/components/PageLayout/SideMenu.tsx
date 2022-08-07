import useAppSettings from '@/application/appSettings/useAppSettings'
import { setCssVarible } from '@/functions/dom/cssVariable'
import { inClient } from '@/functions/judgers/isSSR'
import { Div, DivProps } from '@edsolater/uikit'
import { useEffect, useRef } from 'react'
import Image from '../../tempUikits/Image'
import { RootLogo } from './RootLogo'
import { SideMenuRoutes } from './SideMenuRoutes'
import { SideMenuSubOptions } from './SideMenuSubOptions'
import { VersionInfoBlock } from './VersionInfoBlock'

/**
 * depend component:
 * - {@link RpcConnectionFace `<RpcConnectionFace>`}
 * - {@link RpcConnectionPanelPopover `<RpcConnectionPanelPopover>`}
 * - {@link CommunityPopover `<CommunityPopover>`}
 * - {@link SlippageTolerancePopover `<SlippageTolerancePopover>`}
 */
export function SideMenu({
  // routes: {name:string, icon}
  onClickCloseBtn,
  onRoute,
  ...divProps
}: { onClickCloseBtn?(): void; onRoute?(): void } & DivProps) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const sideMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inClient) return
    setCssVarible(
      globalThis.document.documentElement,
      '--side-menu-width',
      sideMenuRef.current ? Math.min(sideMenuRef.current.clientWidth, sideMenuRef.current.clientHeight) : 0
    )
  }, [sideMenuRef])

  return (
    <Div
      {...divProps}
      className_="grid grid-rows-[auto,2fr,1fr,auto] h-full w-56 mobile:w-48 mobile:pt-4 mobile:pb-2"
      domRef_={sideMenuRef}
      style_={{
        background: isMobile
          ? 'linear-gradient(242.18deg, rgba(57, 208, 216, 0.08) 68.05%, rgba(57, 208, 216, 0.02) 86.71%), #0C0926'
          : undefined,
        boxShadow: isMobile ? '8px 0px 48px rgba(171, 196, 255, 0.12)' : undefined
      }}
    >
      <RootLogo className="mx-auto mt-6" />
      <SideMenuRoutes className="shrink mr-2 mb-2 mobile:ml-2 overflow-y-auto" onClickRoute={onRoute} />
      <SideMenuSubOptions className="overflow-scroll no-native-scrollbar" />
      <VersionInfoBlock />
    </Div>
  )
}
