import useAppSettings from '@/application/appSettings/useAppSettings'
import useDocumentMetaTitle from '@/hooks/useDocumentMetaTitle'
import { ReactNode, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Drawer from '../../tempUikits/Drawer'
import { RPCPerformanceBanner } from './RPCPerformanceBanner'
import { SideMenu } from './SideMenu'
import { TopNavbar } from './TopNavbar'
import { VersionTooOldDialog } from './VersionTooOldDialog'

import { Div } from '@edsolater/uikit'

/**
 * for easier to code and read
 *
 * TEMP: add haveData to fix scrolling bug
 *
 * depend component:
 * - {@link SideMenu `<SideMenu>`}
 * - {@link TopNavbar `<TopNavbar>`}
 * - {@link VersionTooOldDialog `<VersionTooOldDialog>`}
 */
export default function PageLayout(props: {
  /** only mobile  */
  mobileBarTitle?: string
  metaTitle?: string
  children?: ReactNode
  className?: string
  contentClassName?: string
  topbarClassName?: string
  sideMenuClassName?: string

  contentYPaddingShorter?: boolean // it will set both contentTopPaddingShorter and contentButtonPaddingShorter
  contentButtonPaddingShorter?: boolean // it will cause content bottom padding shorter than usual
  contentTopPaddingShorter?: boolean // it will cause content top padding shorter than usual

  // showWalletWidget?: boolean
  // showRpcWidget?: boolean
  // showLanguageWidget?: boolean
}) {
  useDocumentMetaTitle(props.metaTitle)
  const isMobile = useAppSettings((s) => s.isMobile)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  return (
    <div
      style={{
        padding:
          'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
        position: 'relative',
        display: 'grid',
        gridTemplate: isMobile
          ? `
          "d" auto
          "a" auto
          "c" 1fr / 1fr`
          : `
          "d d d" auto
          "a a a" auto
          "b c c" 1fr
          "b c c" 1fr / auto 1fr 1fr`,
        overflow: 'hidden', // establish a BFC
        willChange: 'opacity'
      }}
      className={`w-screen mobile:w-full h-screen mobile:h-full`}
    >
      <RPCPerformanceBanner className="grid-area-d" />
      {isMobile ? (
        <>
          <TopNavbar
            barTitle={props.mobileBarTitle}
            className="grid-area-a"
            onOpenMenu={() => setIsSideMenuOpen(true)}
          />
          <Drawer open={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} onOpen={() => setIsSideMenuOpen(true)}>
            {({ close }) => <SideMenu className="flex-container h-screen" onClickCloseBtn={close} />}
          </Drawer>
        </>
      ) : (
        <>
          <TopNavbar className="grid-area-a" />
          <Div className="flex-container grid-area-b">
            <SideMenu />
          </Div>
        </>
      )}
      <main
        // always occupy scrollbar space
        className={twMerge(
          `PageLayoutContent relative isolate flex-container grid-area-c bg-gradient-to-b from-[#0c0927] to-[#110d36] rounded-tl-3xl mobile:rounded-none p-12 ${
            props.contentButtonPaddingShorter ?? props.contentYPaddingShorter ? 'pb-4' : ''
          } ${
            props.contentTopPaddingShorter ?? props.contentYPaddingShorter ? 'pt-5' : ''
          } mobile:py-2 mobile:px-3 mobile:pt-0 `,
          props.contentClassName
        )}
        style={{
          overflowX: 'hidden',
          overflowY: 'scroll'
        }}
      >
        <VersionTooOldDialog />
        {props.children}
      </main>
    </div>
  )
}
