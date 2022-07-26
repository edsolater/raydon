import { useEffect } from 'react'

import useAppSettings from '@/application/appSettings/useAppSettings'
import useWallet from '@/application/wallet/useWallet'
import useToggle from '@/hooks/useToggle'

import Button from '../../tempUikits/Button'
import { FadeIn } from '../../tempUikits/FadeIn'
import { ThreeSlotItem } from '../../tempUikits/ThreeSlotItem'
import { AddressItem } from '../AddressItem'
import Icon from '../Icon'
import PageLayoutPopoverDrawer from '../PageLayoutPopoverDrawer'
import { appColors } from '@/styles/colors'
import { Div, cssRow } from '@edsolater/uikit'
import { useXStore } from '@/../../xstore/dist'
import { walletAtom } from '@/application/wallet'

/** this should be used in ./Navbar.tsx */
export default function WalletWidget() {
  const isMobile = useAppSettings((s) => s.isMobile)
  const [isCopied, { delayOff, on }] = useToggle()

  useEffect(() => {
    if (isCopied) delayOff()
  }, [isCopied])

  const { owner: publicKey, disconnect, connected } = useXStore(walletAtom)

  return (
    <PageLayoutPopoverDrawer
      canOpen={connected} // should use more common disable
      alwaysPopper
      popupPlacement="bottom-right"
      renderPopoverContent={({ close: closePanel }) => (
        <>
          <Div className="pt-3 -mb-1 mobile:mb-2 px-6 text-[rgba(171,196,255,0.5)] text-xs mobile:text-sm">
            CONNECTED WALLET
          </Div>
          <Div className="gap-3 divide-y-1.5">
            <FadeIn ignoreEnterTransition>
              <AddressItem
                textClassName="text-white"
                showDigitCount={7}
                className="py-4 px-6 border-[rgba(171,196,255,0.2)]"
              >
                {publicKey}
              </AddressItem>
            </FadeIn>
            <ThreeSlotItem
              textClassName="text-white"
              className="py-4 px-6 border-[rgba(171,196,255,0.2)] cursor-pointer clickable clickable-filter-effect"
              prefix={<Icon className="mr-3" size="sm" iconSrc="/icons/misc-recent-transactions.svg" />}
              text="Recent Transactions"
              onClick={() => {
                useAppSettings.setState({ isRecentTransactionDialogShown: true })
                closePanel?.()
              }}
            />
            <ThreeSlotItem
              textClassName="text-white"
              className="py-4 px-6 border-[rgba(171,196,255,0.2)] cursor-pointer clickable clickable-filter-effect"
              prefix={<Icon className="mr-3" size="sm" iconSrc="/icons/misc-disconnect-wallet.svg" />}
              text="Disconnect wallet"
              onClick={() => {
                disconnect()
                closePanel?.()
              }}
            />
          </Div>
        </>
      )}
    >
      {isMobile ? (
        <Icon
          iconSrc={connected ? '/icons/msic-wallet-connected.svg' : '/icons/coin-wallet.svg'}
          onClick={() => {
            if (!publicKey) useAppSettings.setState({ isWalletSelectorShown: true })
          }}
          forceColor="var(--text-secondary)"
          icss={{ width: 24, height: 24 }}
        />
      ) : (
        <Button
          className=""
          onClick={() => {
            if (!publicKey) useAppSettings.setState({ isWalletSelectorShown: true })
          }}
        >
          {connected ? (
            <Div icss={cssRow()} className="items-center gap-3 my-0.5">
              <Icon size="sm" iconSrc="/icons/coin-wallet.svg" />
              <Div className="text-sm font-medium text-white">
                {String(publicKey).slice(0, 5)}...{String(publicKey).slice(-5)}
              </Div>
            </Div>
          ) : (
            <Div icss={cssRow()} className="items-center gap-3 my-0.5">
              <Icon forceColor={appColors.iconMain} iconSrc="/icons/coin-wallet.svg" />
              <Div className="text-sm font-medium">Connect Wallet</Div>
            </Div>
          )}
        </Button>
      )}
    </PageLayoutPopoverDrawer>
  )
}
