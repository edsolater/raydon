import useAppSettings from '@/application/appSettings/useAppSettings'
import useDocumentMetaTitle from '@/hooks/useDocumentMetaTitle'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Drawer from '../../tempUikits/Drawer'
import { RPCPerformanceBanner } from './RPCPerformanceBanner'
import { SideMenu } from './SideMenu'
import { TopNavbar, TopNavbarProps } from './TopNavbar'
import { VersionTooOldDialog } from './VersionTooOldDialog'

import Col from '@/tempUikits/Col'
import { FadeIn } from '@/tempUikits/FadeIn'
import { Div } from '@edsolater/uikit'
import MessageBoardWidget from '../navWidgets/MessageBoardWidget'
import WalletWidget from '../navWidgets/WalletWidget'
import { RootLogo } from './RootLogo'

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

  propsForTopNavbar?: TopNavbarProps
  // showWalletWidget?: boolean
  // showRpcWidget?: boolean
  // showLanguageWidget?: boolean
}) {
  useDocumentMetaTitle(props.metaTitle)
  const isMobile = useAppSettings((s) => s.isMobile)
  const isSideBarMenuShown = useAppSettings((s) => s.isSideBarMenuShown)
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
          "b a a" auto
          "b c c" 1fr
          "b c c" 1fr / auto 1fr 1fr`,
        overflow: 'hidden', // establish a BFC
        willChange: 'opacity'
      }}
      className={`w-full mobile:w-full h-full mobile:h-full`}
    >
      {/* top info bar */}
      <RPCPerformanceBanner className="grid-area-d" />

      {/* top nav bar */}
      <TopNavbar
        className="grid-area-a"
        {...props.propsForTopNavbar}
        onOpenMenu={() => useAppSettings.setState({ isSideBarMenuShown: true })}
        barTitle={props.mobileBarTitle}
        renderSlot1={props.propsForTopNavbar?.renderSlot1}
        renderSlot3={
          <>
            {props.propsForTopNavbar?.renderSlot3}
            <MessageBoardWidget />
            <WalletWidget />
          </>
        }
      />

      {/* side menu */}
      {isMobile ? (
        <Drawer
          open={Boolean(isSideBarMenuShown)}
          onClose={() => useAppSettings.setState({ isSideBarMenuShown: false })}
          onOpen={() => useAppSettings.setState({ isSideBarMenuShown: true })}
        >
          {({ close }) => <SideMenu className="h-full" onClickCloseBtn={close} onRoute={close} />}
        </Drawer>
      ) : (
        <Col className="flex-container grid-area-b">
          <FadeIn show={isSideBarMenuShown} heightOrWidth="width" wrapperDivBoxProps={{ icss: { height: '100%' } }}>
            <SideMenu />
          </FadeIn>
        </Col>
      )}

      {/* content */}
      <main
        // always occupy scrollbar space
        className={twMerge(
          `PageLayoutContent relative isolate flex-container grid-area-c p-12 ${
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
