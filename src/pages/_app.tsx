import { PublicKey } from '@solana/web3.js'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import NextNProgress from 'nextjs-progressbar'

import {
  useDeviceInfoSyc,
  useKeyboardShortcutInitialization,
  useSlippageTolerenceSyncer,
  useSlippageTolerenceValidator,
  useThemeModeSync
} from '@/application/appSettings/initializationHooks'
import { useAppInitVersionPostHeartBeat, useJudgeAppVersion } from '@/application/appVersion/useAppVersion'
import useFarmInfoLoader from '@/application/farms/useFarmInfoLoader'
import useLiquidityInfoLoader from '@/application/liquidity/useLiquidityInfoLoader'
import useMessageBoardFileLoader from '@/application/messageBoard/useMessageBoardFileLoader'
import useMessageBoardReadedIdRecorder from '@/application/messageBoard/useMessageBoardReadedIdRecorder'
import usePoolsInfoLoader from '@/application/pools/usePoolsInfoLoader'
import useStealDataFromFarm from '@/application/staking/useStealDataFromFarm'
import useAutoUpdateSelectableTokens from '@/application/token/useAutoUpdateSelectableTokens'
import { useLpTokenMethodsLoad } from '@/application/token/useLpTokenMethodsLoad'
import useLpTokensLoader from '@/application/token/useLpTokensLoader'
import useTokenMintAutoRecord from '@/application/token/useTokenFlaggedMintAutoRecorder'
import { useTokenGetterFnLoader } from '@/application/token/useTokenGetterFnLoader'
import useTokenListSettingsLocalStorage from '@/application/token/useTokenListSettingsLocalStorage'
import useTokenListsLoader from '@/application/token/useTokenListsLoader'
import useTokenPriceRefresher from '@/application/token/useTokenPriceRefresher'
import useInitRefreshTransactionStatus from '@/application/txHistory/useInitRefreshTransactionStatus'
import useSyncTxHistoryWithLocalStorage from '@/application/txHistory/useSyncTxHistoryWithLocalStorage'
import { useSyncWithSolanaWallet } from '@/application/wallet/useSyncWithSolanaWallet'
import { listenWalletAccountChange } from '@/application/effects/listenWalletAccountChange'
import RecentTransactionDialog from '@/components/dialogs/RecentTransactionDialog'
import WalletSelectorDialog from '@/components/dialogs/WalletSelectorDialog'
import NotificationSystemStack from '@/components/NotificationSystemStack'
import { SolanaWalletProviders } from '@/components/SolanaWallets/SolanaWallets'
import toPubString from '@/functions/format/toMintString'
import useHandleWindowTopError from '@/hooks/useHandleWindowTopError'

import NoSsr from '@/components/NoSsr'
import { Div } from '@edsolater/uikit'
import '../styles/index.css'
import { useEffect } from 'react'
import { activateAllSubscribeEffects } from '@/application/effects/activateAllSubscribeEffects'

export default function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter()
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
  useAutoUpdateSelectableTokens()
  useTokenListsLoader()
  useLpTokensLoader()
  useLpTokenMethodsLoad()
  useTokenPriceRefresher()
  useTokenMintAutoRecord()
  useTokenListSettingsLocalStorage()
  useTokenGetterFnLoader()

  /* ----- load liquidity info (jsonInfo, sdkParsedInfo, hydratedInfo) ----- */
  useLiquidityInfoLoader()

  /********************** pair Info (pools) **********************/
  usePoolsInfoLoader()

  /********************** farm **********************/
  useFarmInfoLoader()

  /********************** staking **********************/
  useStealDataFromFarm() // auto inject apr to farm info from backend pair interface

  /********************** txHistory **********************/
  useInitRefreshTransactionStatus()
  useSyncTxHistoryWithLocalStorage()
  return null
}
