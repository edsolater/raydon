import { useRef, useState } from 'react'

import { WalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base'

import { cssCol, cssRow, Div } from '@edsolater/uikit'
import useAppSettings from '@/application/appSettings/useAppSettings'
import useWallet from '@/application/wallet/useWallet'
import Icon from '@/components/Icon'
import Card from '@/tempUikits/Card'
import Button from '../../tempUikits/Button'
import FadeInStable from '../../tempUikits/FadeIn'
import Grid from '../../tempUikits/Grid'
import Input from '../../tempUikits/Input'
import Link from '../../tempUikits/Link'
import ResponsiveDialogDrawer from '../../tempUikits/ResponsiveDialogDrawer'

function WalletSelectorPanelItem({
  wallet,
  available: detected,
  onClick
}: {
  wallet: { adapter: WalletAdapter; readyState: WalletReadyState }
  available?: boolean
  onClick?(): void
}) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const select = useWallet((s) => s.select)
  return (
    <Div
      icss={cssRow()}
      className={`relative items-center gap-3 m-auto px-6 mobile:px-3 mobile:py-1.5 py-3 w-64 mobile:w-[42vw] h-14  mobile:h-12 frosted-glass frosted-glass-teal rounded-xl mobile:rounded-lg ${
        detected ? 'opacity-100' : 'opacity-40'
      } clickable clickable-filter-effect`}
      // TODO disable status
      onClick={() => {
        select(wallet.adapter.name)
        onClick?.()
      }}
    >
      <Icon className="shrink-0" size={isMobile ? 'md' : 'lg'} iconSrc={wallet.adapter.icon} />
      <Div className="mobile:text-sm text-base font-bold text-white">{wallet.adapter.name}</Div>
      {/* {installed && (
        <Badge
          noOutline
          colorType="green"
          className="absolute right-1 bottom-1 mobile:right-0 mobile:bottom-0 mobile:text-2xs opacity-80"
        >
          installed
        </Badge>
      )} */}
    </Div>
  )
}

function SimulateWallet({ onClick }: { onClick?(): void }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const select = useWallet((s) => s.select)
  const valueRef = useRef('')
  return (
    <Div
      icss={cssCol()}
      className="p-6 mobile:py-3 mobile:px-4 flex-grow ring-inset ring-1.5 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-3xl mobile:rounded-xl items-center gap-3 m-8 mt-2 mb-4"
    >
      <Div className="mobile:text-sm text-base font-bold text-white">Simulate Wallet Address</Div>
      <Input
        className="w-full"
        onUserInput={(value) => (valueRef.current = value)}
        onEnter={(value) => {
          if (value) {
            // @ts-expect-error force
            select(value)
            onClick?.()
          }
        }}
      />
      <Button
        className="frosted-glass-teal"
        onClick={() => {
          if (valueRef.current) {
            // @ts-expect-error force
            select(valueRef.current)
            onClick?.()
          }
        }}
      >
        Fake it 🤘
      </Button>
    </Div>
  )
}

export default function WalletSelectorDialog() {
  const isWalletSelectorShown = useAppSettings((s) => s.isWalletSelectorShown)
  const availableWallets = useWallet((s) => s.availableWallets)
  return (
    <ResponsiveDialogDrawer
      placement="from-top"
      open={isWalletSelectorShown}
      onCloseImmediately={() => useAppSettings.setState({ isWalletSelectorShown: false })}
    >
      {({ close }) => <PanelContent close={close} wallets={availableWallets} />}
    </ResponsiveDialogDrawer>
  )
}

function PanelContent({
  close,
  wallets
}: {
  close(): void
  wallets: { adapter: WalletAdapter; readyState: WalletReadyState }[]
}) {
  const installedWallets = wallets
    .filter((w) => w.readyState !== WalletReadyState.Unsupported)
    .filter((w) => w.readyState !== WalletReadyState.NotDetected)
  const notInstalledWallets = wallets
    .filter((w) => w.readyState !== WalletReadyState.Unsupported)
    .filter((w) => w.readyState == WalletReadyState.NotDetected)

  const [isAllWalletShown, setIsAllWalletShown] = useState(false)
  const isInLocalhost = useAppSettings((s) => s.isInLocalhost)
  const isInBonsaiTest = useAppSettings((s) => s.isInBonsaiTest)
  return (
    <Card
      className="flex flex-col max-h-screen  w-[586px] mobile:w-screen rounded-3xl mobile:rounded-none border-1.5 border-[rgba(171,196,255,0.2)] overflow-hidden bg-cyberpunk-card-bg shadow-cyberpunk-card"
      size="lg"
    >
      <Div icss={cssRow()} className="items-center justify-between px-8 py-8">
        <Div className="text-xl font-semibold text-white">Connect your wallet to Raydium</Div>
        <Icon className="text-primary cursor-pointer" heroIconName="x" onClick={close} />
      </Div>

      <Grid
        className={`px-8 mobile:px-6 gap-x-6 gap-y-3 mobile:gap-2 ${
          installedWallets.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        } grow`}
      >
        {installedWallets.map((wallet) => (
          <WalletSelectorPanelItem key={wallet.adapter.name} wallet={wallet} onClick={close} available />
        ))}
      </Grid>

      <Div className={`flex-1 h-32 overflow-auto no-native-scrollbar`}>
        <FadeInStable show={isAllWalletShown}>
          <Div className="overflow-auto pt-8 no-native-scrollbar" style={{ scrollbarGutter: 'always' }}>
            <Grid className="flex-1 px-8 justify-items-stretch mobile:px-6 pb-4 overflow-auto gap-x-6 gap-y-3 mobile:gap-2 grid-cols-2 mobile:grid-cols-[1fr,1fr]">
              {notInstalledWallets.map((wallet) => (
                <WalletSelectorPanelItem
                  key={wallet.adapter.name}
                  wallet={wallet}
                  onClick={close}
                  available={wallet.readyState !== WalletReadyState.NotDetected}
                />
              ))}
            </Grid>
            {(isInLocalhost || isInBonsaiTest) && <SimulateWallet onClick={close} />}
          </Div>
        </FadeInStable>
      </Div>

      <Div
        icss={cssRow()}
        className="m-4 text-primary justify-center items-center clickable"
        onClick={() => setIsAllWalletShown((b) => !b)}
      >
        <Div className="font-bold">Show uninstalled wallets</Div>
        <Icon className="mx-2" size="sm" heroIconName={isAllWalletShown ? 'chevron-up' : 'chevron-down'}></Icon>
      </Div>

      <Div className="py-4 text-center font-medium text-sm border-t-1.5 border-[rgba(171,196,255,0.2)]">
        New here?{' '}
        <Link href="https://raydium.gitbook.io/raydium/" className="text-primary">
          Get started on Raydium!
        </Link>
      </Div>
    </Card>
  )
}
