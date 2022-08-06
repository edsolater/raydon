import { useEffect } from 'react'

import useAppSettings from '@/application/appSettings/useAppSettings'
import useWallet from '@/application/wallet/useWallet'
import useToggle from '@/hooks/useToggle'

import Button from '../../tempUikits/Button'
import { FadeIn } from '../../tempUikits/FadeIn'
import Row from '../../tempUikits/Row'
import { ThreeSlotItem } from '../../tempUikits/ThreeSlotItem'
import { AddressItem } from '../AddressItem'
import Icon from '../Icon'
import PageLayoutPopoverDrawer from '../PageLayoutPopoverDrawer'

/** this should be used in ./Navbar.tsx */
export default function WalletWidget() {
  const isMobile = useAppSettings((s) => s.isMobile)
  const [isCopied, { delayOff, on }] = useToggle()

  useEffect(() => {
    if (isCopied) delayOff()
  }, [isCopied])

  const { owner: publicKey, disconnect, connected } = useWallet()

  return (
    <PageLayoutPopoverDrawer
      canOpen={connected} // should use more common disable
      alwaysPopper
      popupPlacement="bottom-right"
      renderPopoverContent={({ close: closePanel }) => (
        <>
          <div className="pt-3 -mb-1 mobile:mb-2 px-6 text-[rgba(171,196,255,0.5)] text-xs mobile:text-sm">
            CONNECTED WALLET
          </div>
          <div className="gap-3 divide-y-1.5">
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
          </div>
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
          className="frosted-glass frosted-glass-teal"
          onClick={() => {
            if (!publicKey) useAppSettings.setState({ isWalletSelectorShown: true })
          }}
        >
          {connected ? (
            <Row className="items-center gap-3 my-0.5">
              <Icon size="sm" iconSrc="/icons/msic-wallet-connected.svg" />
              <div className="text-sm font-medium text-white">
                {String(publicKey).slice(0, 5)}...{String(publicKey).slice(-5)}
              </div>
            </Row>
          ) : (
            <Row className="items-center gap-3 my-0.5">
              <Icon size="sm" iconSrc="/icons/msic-wallet.svg" />
              <div className="text-sm font-medium text-[#39D0D8]">Connect Wallet</div>
            </Row>
          )}
        </Button>
      )}
    </PageLayoutPopoverDrawer>
  )
}
