import {
  useDeviceInfoSyc,
  useKeyboardShortcutInitialization,
  useSlippageTolerenceSyncer,
  useSlippageTolerenceValidator,
  useThemeModeSync
} from '@/application/appSettings/initializationHooks'
import { useAppInitVersionPostHeartBeat, useJudgeAppVersion } from '@/application/appVersion/useAppVersion'
import { activateAllSubscribeEffects } from '@/application/effects/activateAllSubscribeEffects'
import useLiquidityInfoLoader from '@/application/liquidity/effects/useLiquidityInfoLoader'
import useMessageBoardFileLoader from '@/application/messageBoard/useMessageBoardFileLoader'
import useMessageBoardReadedIdRecorder from '@/application/messageBoard/useMessageBoardReadedIdRecorder'
import usePoolsInfoLoader from '@/application/pools/effects/usePoolsInfoLoader'
import { routerAtom } from '@/application/router/atom'
import useStealDataFromFarm from '@/application/staking/useStealDataFromFarm'
import useInitRefreshTransactionStatus from '@/application/txHistory/useInitRefreshTransactionStatus'
import useSyncTxHistoryWithLocalStorage from '@/application/txHistory/useSyncTxHistoryWithLocalStorage'
import { useSyncWithSolanaWallet } from '@/application/wallet/useSyncWithSolanaWallet'
import RecentTransactionDialog from '@/components/dialogs/RecentTransactionDialog'
import WalletSelectorDialog from '@/components/dialogs/WalletSelectorDialog'
import NoSsr from '@/components/NoSsr'
import NotificationSystemStack from '@/components/NotificationSystemStack'
import { SolanaWalletProviders } from '@/components/SolanaWallets/SolanaWallets'
import toPubString from '@/functions/format/toMintString'
import useHandleWindowTopError from '@/hooks/useHandleWindowTopError'
import { Div } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import { PublicKey } from '@solana/web3.js'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import NextNProgress from 'nextjs-progressbar'
import { useEffect } from 'react'
import '../styles/index.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useXStore(routerAtom)
  useRouterAtomSyncer()
  return (
    <NoSsr>
      <SolanaWalletProviders>
        {/* initializations hooks */}
        <ClientInitialization />
        {pathname !== '/' && <ApplicationsInitializations />}

        <Div htmlProps={{ id: 'app' }}>
          <NextNProgress color="#34ade5" showOnShallow={false} />

          {/* Page Components */}
          <Component {...pageProps} />

          {/* Global Components */}
          <RecentTransactionDialog />
          <WalletSelectorDialog />
          <NotificationSystemStack />
        </Div>
      </SolanaWalletProviders>
    </NoSsr>
  )
}

// accelerayte
PublicKey.prototype.toString = function () {
  return toPubString(this)
}
PublicKey.prototype.toJSON = function () {
  return toPubString(this)
}

function useRouterAtomSyncer() {
  const router = useRouter()
  useEffect(() => {
    routerAtom.set(router)
  }, [router])
}

function ClientInitialization() {
  useHandleWindowTopError()
  useThemeModeSync()
  useDeviceInfoSyc()
  useKeyboardShortcutInitialization()
  return null
}

function ApplicationsInitializations() {
  useEffect(() => {
    activateAllSubscribeEffects()
  }, [])

  useSlippageTolerenceValidator()
  useSlippageTolerenceSyncer()

  /********************** appVersion **********************/
  useAppInitVersionPostHeartBeat()
  useJudgeAppVersion()

  /********************** connection **********************/

  /********************** message boards **********************/
  useMessageBoardFileLoader() // load `raydium-message-board.json`
  useMessageBoardReadedIdRecorder() // sync user's readedIds

  /********************** wallet **********************/
  useSyncWithSolanaWallet()

  /********************** token **********************/
  // application initializations

  /* ----- load liquidity info (jsonInfo, sdkParsedInfo, hydratedInfo) ----- */
  useLiquidityInfoLoader()

  /********************** pair Info (pools) **********************/
  usePoolsInfoLoader()

  /********************** staking **********************/
  useStealDataFromFarm() // auto inject apr to farm info from backend pair interface

  /********************** txHistory **********************/
  useInitRefreshTransactionStatus()
  useSyncTxHistoryWithLocalStorage()
  return null
}
