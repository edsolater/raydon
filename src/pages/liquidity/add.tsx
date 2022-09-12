import { Percent } from '@raydium-io/raydium-sdk'
import BN from 'bn.js'
import { createRef, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import useAppSettings from '@/application/appSettings/useAppSettings'
import useFarms from '@/application/farms/useFarms'
import txAddLiquidity from '@/application/liquidity/tx/txAddLiquidity'
import useLiquidity from '@/application/liquidity/useLiquidity'
import useLiquidityAmmSelector from '@/application/liquidity/effects/useLiquidityAmmSelector'
import useLiquidityInitCoinFiller from '@/application/liquidity/effects/useLiquidityInitCoinFiller'
import useLiquidityUrlParser from '@/application/liquidity/effects/useLiquidityUrlParser'
import { routeTo } from '@/application/routeTools'
import { SOLDecimals, SOL_BASE_BALANCE, tokenAtom } from '@/application/token'
import useWallet from '@/application/wallet/useWallet'
import CoinAvatarPair from '@/components/CoinAvatarPair'
import CoinInputBox, { CoinInputBoxHandle } from '@/components/CoinInputBox'
import Button, { ButtonHandle } from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'

import { SearchAmmDialog } from '@/components/dialogs/SearchAmmDialog'
import Icon from '@/components/Icon'
import PageLayout from '@/components/PageLayout/PageLayout'
import RefreshCircle from '@/components/RefreshCircle'
import { addItem, unifyItem } from '@/functions/arrayMethods'
import formatNumber from '@/functions/format/formatNumber'
import toPubString from '@/functions/format/toMintString'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import { gte, isMeaningfulNumber, lt } from '@/functions/numberish/compare'
import { div, mul } from '@/functions/numberish/operations'
import { toString } from '@/functions/numberish/toString'
import createContextStore from '@/functions/react/createContextStore'
import useLocalStorageItem from '@/hooks/useLocalStorage'
import useToggle from '@/hooks/useToggle'
import Collapse from '@/tempUikits/Collapse'
import CyberpunkStyleCard from '@/tempUikits/CyberpunkStyleCard'
import { FadeIn } from '@/tempUikits/FadeIn'
import Input from '@/tempUikits/Input'
import Link from '@/tempUikits/Link'
import List from '@/tempUikits/List'
import RowTabs from '@/tempUikits/RowTabs'
import Tooltip from '@/tempUikits/Tooltip'
import { HexAddress } from '@/types/constants'

import { useXStore } from '@edsolater/xstore'
import { SplToken } from '@/application/token/type'
import { walletAtom } from '@/application/wallet'
import { AddressItem } from '@/components/AddressItem'
import { capitalize } from '@/functions/changeCase'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { objectShakeFalsy } from '@/functions/objectMethods'
import { Badge } from '@/tempUikits/Badge'
import { cssCol, cssRow, Div } from '@edsolater/uikit'
import { RemoveLiquidityDialog } from '../../components/dialogs/RemoveLiquidityDialog'
import TokenSelectorDialog from '../../components/dialogs/TokenSelectorDialog'
import { Checkbox } from '../../tempUikits/Checkbox'
import { liquidityAtom } from '@/application/liquidity/atom'

const { ContextProvider: LiquidityUIContextProvider, useStore: useLiquidityContextStore } = createContextStore({
  hasAcceptedPriceChange: false,
  coinInputBox1ComponentRef: createRef<CoinInputBoxHandle>(),
  coinInputBox2ComponentRef: createRef<CoinInputBoxHandle>(),
  liquidityButtonComponentRef: createRef<ButtonHandle>()
})

export default function Liquidity() {
  return (
    <LiquidityUIContextProvider>
      <LiquidityEffect />
      <PageLayout mobileBarTitle="Liquidity" metaTitle="Liquidity - Raydium">
        <LiquidityPageHead />
        <LiquidityCard />
        <UserLiquidityExhibition />
        <CreatePoolCardEntry />
      </PageLayout>
    </LiquidityUIContextProvider>
  )
}

function LiquidityEffect() {
  useLiquidityUrlParser()
  useLiquidityInitCoinFiller()
  useLiquidityAmmSelector()
  // //  auto fresh  liquidity's coin1Amount and coin2Amount
  // useLiquidityAmountCalculator()
  return null
}

// const availableTabValues = ['Swap', 'Liquidity'] as const
function LiquidityPageHead() {
  return (
    <Div icss={cssRow()} className="mb-12 mobile:mb-2 self-center">
      <RowTabs
        currentValue={'Liquidity'}
        values={['Swap', 'Liquidity']}
        onChange={(newTab) => {
          // setActiveTabValue(newTab)
          if (newTab === 'Swap') {
            routeTo('/swap')
          }
        }}
      />
    </Div>
  )
}

function useLiquidityWarning() {
  const currentJsonInfo = useLiquidity((s) => s.currentJsonInfo)
  const coin1 = useLiquidity((s) => s.coin1)
  const coin2 = useLiquidity((s) => s.coin2)
  const [userConfirmedList, setUserConfirmedList] = useLocalStorageItem<HexAddress /* ammId */[]>(
    'USER_CONFIRMED_LIQUIDITY_AMM_LIST'
  )
  const userConfirmedListRef = useRef(userConfirmedList)
  userConfirmedListRef.current = userConfirmedList

  const checkPermanent = useCallback(
    () =>
      Boolean(
        liquidityAtom.get().currentJsonInfo &&
          userConfirmedListRef.current?.includes(liquidityAtom.get().currentJsonInfo!.id)
      ),
    []
  )

  // permanent state
  const [hasUserPermanentConfirmed, setHasUserPermanentConfirmed] = useState(checkPermanent)
  // temporary state
  const [hasUserTemporaryConfirmed, setHasUserTemporaryConfirmed] = useState(false)

  // when change coin pair, just reset temporary confirm and permanent confirm
  useEffect(() => {
    if (currentJsonInfo) {
      setHasUserTemporaryConfirmed(false)
    }
    if (currentJsonInfo) {
      setHasUserPermanentConfirmed(checkPermanent())
    }
  }, [currentJsonInfo])

  const applyPermanentConfirm = (ammId: string) => {
    if (hasUserPermanentConfirmed) {
      setUserConfirmedList((old) => unifyItem(addItem(old ?? [], ammId)))
    }
  }
  const toggleTemporarilyConfirm = (checkState: boolean) => setHasUserTemporaryConfirmed(checkState)
  const togglePermanentlyConfirm = (checkState: boolean) => {
    setHasUserPermanentConfirmed(checkState)
    if (checkState) {
      setHasUserTemporaryConfirmed(true)
    }
  }
  // box state
  const [isPanelShown, setIsPanelShown] = useState(
    () => !hasUserPermanentConfirmed && !hasUserTemporaryConfirmed && Boolean(currentJsonInfo)
  )

  useEffect(() => {
    if (!coin1 || !coin2) {
      setIsPanelShown(false)
    } else {
      const noPermanent = !checkPermanent()
      setIsPanelShown(noPermanent)
    }
  }, [coin1, coin2, currentJsonInfo])

  const closePanel = () => setIsPanelShown(false)

  return {
    closePanel,
    toggleTemporarilyConfirm,
    togglePermanentlyConfirm,
    applyPermanentConfirm,
    hasUserPermanentConfirmed,
    hasUserTemporaryConfirmed,
    needConfirmPanel: isPanelShown
  }
}

function ConfirmRiskPanel({
  className,
  temporarilyConfirm,
  permanentlyConfirm,
  onTemporarilyConfirm,
  onPermanentlyConfirm
}: {
  className?: string
  temporarilyConfirm?: boolean
  permanentlyConfirm?: boolean
  onTemporarilyConfirm?: (checkState: boolean) => void
  onPermanentlyConfirm?: (checkState: boolean) => void
}) {
  return (
    <Div className={twMerge('bg-[#141041] rounded-xl py-3 px-6 mobile:px-4', className)}>
      <Div className="text-sm">
        I have read{' '}
        <Link href="https://raydium.gitbook.io/raydium/exchange-trade-and-swap/liquidity-pools">
          Raydium's Liquidity Guide
        </Link>{' '}
        and understand the risks involved with providing liquidity and impermanent loss.
      </Div>

      <Checkbox
        checkBoxSize="sm"
        className="my-2 w-max"
        checked={temporarilyConfirm}
        onChange={onTemporarilyConfirm}
        label={<Div className="text-sm italic text-[rgba(171,196,255,0.5)]">Confirm</Div>}
      />

      <Checkbox
        checkBoxSize="sm"
        className="my-2 w-max"
        checked={permanentlyConfirm}
        onChange={onPermanentlyConfirm}
        label={<Div className="text-sm italic text-[rgba(171,196,255,0.5)]">Do not warn again for this pool</Div>}
      />
    </Div>
  )
}

function LiquidityCard() {
  const { connected, owner } = useXStore(walletAtom)
  const [isCoinSelectorOn, { on: turnOnCoinSelector, off: turnOffCoinSelector }] = useToggle()
  // it is for coin selector panel
  const [targetCoinNo, setTargetCoinNo] = useState<'1' | '2'>('1')

  const checkWalletHasEnoughBalance = useWallet((s) => s.checkWalletHasEnoughBalance)

  const {
    coin1,
    coin1Amount,
    unslippagedCoin1Amount,
    coin2,
    coin2Amount,
    unslippagedCoin2Amount,
    focusSide,
    currentJsonInfo,
    currentHydratedInfo,
    isSearchAmmDialogOpen,
    refreshLiquidity
  } = useXStore(liquidityAtom)
  const { refreshTokenPrice } = useXStore(tokenAtom)

  const { coinInputBox1ComponentRef, coinInputBox2ComponentRef, liquidityButtonComponentRef } =
    useLiquidityContextStore()
  const hasFoundLiquidityPool = useMemo(() => Boolean(currentJsonInfo), [currentJsonInfo])
  const hasHydratedLiquidityPool = useMemo(() => Boolean(currentHydratedInfo), [currentHydratedInfo])

  // TODO: card actually don't need `toggleTemporarilyConfirm()` and `togglePermanentlyConfirm()`, so use React.Context may be better
  const {
    closePanel,
    needConfirmPanel,
    hasUserTemporaryConfirmed,
    hasUserPermanentConfirmed,
    applyPermanentConfirm,
    toggleTemporarilyConfirm,
    togglePermanentlyConfirm
  } = useLiquidityWarning()
  const haveEnoughCoin1 =
    coin1 &&
    checkWalletHasEnoughBalance(
      toTokenAmount(coin1, focusSide === 'coin1' ? coin1Amount : unslippagedCoin1Amount, { alreadyDecimaled: true })
    )
  const haveEnoughCoin2 =
    coin2 &&
    checkWalletHasEnoughBalance(
      toTokenAmount(coin2, focusSide === 'coin2' ? coin2Amount : unslippagedCoin2Amount, { alreadyDecimaled: true })
    )

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    liquidityAtom.set({
      scrollToInputBox: () => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [])

  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)
  return (
    <CyberpunkStyleCard
      domRef={cardRef}
      wrapperClassName="w-[min(456px,100%)] self-center cyberpunk-bg-light"
      className="py-8 pt-4 px-6 mobile:py-5 mobile:px-3"
    >
      {/* input twin */}
      <>
        <CoinInputBox
          className="mt-5 mobile:mt-0"
          disabled={isApprovePanelShown}
          noDisableStyle
          componentRef={coinInputBox1ComponentRef}
          value={focusSide === 'coin1' ? coin1Amount : unslippagedCoin1Amount}
          haveHalfButton
          haveCoinIcon
          showTokenSelectIcon
          topLeftLabel=""
          onTryToTokenSelect={() => {
            turnOnCoinSelector()
            setTargetCoinNo('1')
          }}
          onUserInput={(amount) => {
            liquidityAtom.set({ coin1Amount: amount, focusSide: 'coin1' })
          }}
          onEnter={(input) => {
            if (!input) return
            if (!coin2) coinInputBox2ComponentRef.current?.selectToken?.()
            if (coin2 && coin2Amount) liquidityButtonComponentRef.current?.click?.()
          }}
          token={coin1}
        />

        {/* swap button */}
        <Div className="relative h-8 my-4">
          <Div
            icss={cssRow()}
            className={`absolute h-full items-center transition-all ${
              hasHydratedLiquidityPool ? 'left-4' : 'left-1/2 -translate-x-1/2'
            }`}
          >
            <Icon heroIconName="plus" className="p-1 mr-4 mobile:mr-2 text-[#39D0D8]" />
            <FadeIn>{hasHydratedLiquidityPool && <LiquidityCardPriceIndicator className="w-max" />}</FadeIn>
          </Div>
          <Div icss={cssRow()} className="absolute right-0 items-center">
            <Icon
              size="sm"
              heroIconName="search"
              className={`p-2 frosted-glass frosted-glass-teal rounded-full mr-4 clickable text-[#39D0D8] select-none ${
                isApprovePanelShown ? 'not-clickable' : ''
              }`}
              onClick={() => {
                liquidityAtom.set({ isSearchAmmDialogOpen: true })
              }}
            />
            <Div className={isApprovePanelShown ? 'not-clickable' : 'clickable'}>
              <RefreshCircle
                run={!isApprovePanelShown}
                refreshKey="liquidity/add"
                popPlacement="right-bottom"
                freshFunction={() => {
                  if (isApprovePanelShown) return
                  refreshLiquidity()
                  refreshTokenPrice()
                }}
              />
            </Div>
          </Div>
        </Div>

        <CoinInputBox
          componentRef={coinInputBox2ComponentRef}
          disabled={isApprovePanelShown}
          noDisableStyle
          value={focusSide === 'coin2' ? coin2Amount : unslippagedCoin2Amount}
          haveHalfButton
          haveCoinIcon
          showTokenSelectIcon
          topLeftLabel=""
          onTryToTokenSelect={() => {
            turnOnCoinSelector()
            setTargetCoinNo('2')
          }}
          onEnter={(input) => {
            if (!input) return
            if (!coin1) coinInputBox1ComponentRef.current?.selectToken?.()
            if (coin1 && coin1Amount) liquidityButtonComponentRef.current?.click?.()
          }}
          onUserInput={(amount) => {
            liquidityAtom.set({ coin2Amount: amount, focusSide: 'coin2' })
          }}
          token={coin2}
        />
      </>
      {/* info panel */}
      <FadeIn>{hasFoundLiquidityPool && <LiquidityCardInfo className="mt-5" />}</FadeIn>

      {/* confirm panel */}
      {needConfirmPanel && connected && (
        <ConfirmRiskPanel
          className="mt-5"
          temporarilyConfirm={hasUserTemporaryConfirmed}
          permanentlyConfirm={hasUserPermanentConfirmed}
          onTemporarilyConfirm={toggleTemporarilyConfirm}
          onPermanentlyConfirm={togglePermanentlyConfirm}
        />
      )}
      {/* supply button */}
      <Button
        className="block frosted-glass-teal w-full mt-5"
        componentRef={liquidityButtonComponentRef}
        isLoading={isApprovePanelShown}
        validators={[
          {
            should: hasFoundLiquidityPool,
            fallbackProps: { children: `Pool not found` }
          },
          {
            should: connected,
            forceActive: true,
            fallbackProps: {
              onClick: () => useAppSettings.setState({ isWalletSelectorShown: true }),
              children: 'Connect Wallet'
            }
          },
          {
            should: coin1 && coin2,
            fallbackProps: { children: 'Select a token' }
          },
          {
            should: coin1Amount && isMeaningfulNumber(coin1Amount) && coin2Amount && isMeaningfulNumber(coin2Amount),
            fallbackProps: { children: 'Enter an amount' }
          },
          {
            should: !needConfirmPanel || hasUserTemporaryConfirmed,
            fallbackProps: { children: `Confirm liquidity guide` }
          },
          {
            should: haveEnoughCoin1,
            fallbackProps: { children: `Insufficient ${coin1?.symbol ?? ''} balance` }
          },
          {
            should: haveEnoughCoin2,
            fallbackProps: { children: `Insufficient ${coin2?.symbol ?? ''} balance` }
          },
          {
            should: isMeaningfulNumber(coin1Amount) && isMeaningfulNumber(coin2Amount),
            fallbackProps: { children: 'Enter an amount' }
          }
        ]}
        onClick={() => {
          currentJsonInfo && applyPermanentConfirm(currentJsonInfo.id)
          txAddLiquidity().then(
            ({ allSuccess }) => allSuccess && needConfirmPanel && hasUserPermanentConfirmed && closePanel()
          )
        }}
      >
        Add Liquidity
      </Button>
      {/* alert user if sol is not much */}
      <RemainSOLAlert />
      {/** coin selector panel */}
      <TokenSelectorDialog
        open={isCoinSelectorOn}
        close={turnOffCoinSelector}
        onSelectCoin={(token) => {
          if (targetCoinNo === '1') {
            liquidityAtom.set({ coin1: token })
            // delete other
            if (!canTokenPairBeSelected(token, coin2)) {
              liquidityAtom.set({ coin2: undefined })
            }
          } else {
            // delete other
            liquidityAtom.set({ coin2: token })
            if (!canTokenPairBeSelected(token, coin1)) {
              liquidityAtom.set({ coin1: undefined })
            }
          }
          turnOffCoinSelector()
        }}
      />
      <SearchAmmDialog
        open={isSearchAmmDialogOpen}
        onClose={() => {
          liquidityAtom.set({ isSearchAmmDialogOpen: false })
        }}
      />
    </CyberpunkStyleCard>
  )
}

function canTokenPairBeSelected(targetToken: SplToken | undefined, candidateToken: SplToken | undefined) {
  return !isMintEqual(targetToken?.mint, candidateToken?.mint)
}

function RemainSOLAlert() {
  const rawsolBalance = useWallet((s) => s.solBalance)
  const solBalance = div(rawsolBalance, 10 ** SOLDecimals)

  return (
    <FadeIn>
      {solBalance && lt(solBalance, SOL_BASE_BALANCE) && gte(solBalance, 0) && (
        <Div icss={cssRow()} className="text-sm mt-2 text-[#D8CB39] items-center justify-center">
          SOL balance: {toString(solBalance)}{' '}
          <Tooltip placement="bottom-right">
            <Icon size="sm" heroIconName="question-mark-circle" className="ml-2 cursor-help" />
            <Tooltip.Panel>
              <p className="w-80">
                SOL is needed for Solana network fees. A minimum balance of {SOL_BASE_BALANCE} SOL is recommended to
                avoid failed transactions. This swap will leave you with less than {SOL_BASE_BALANCE} SOL.
              </p>
            </Tooltip.Panel>
          </Tooltip>
        </Div>
      )}
    </FadeIn>
  )
}

function LiquidityCardPriceIndicator({ className }: { className?: string }) {
  const [innerReversed, setInnerReversed] = useState(false)

  const currentHydratedInfo = useLiquidity((s) => s.currentHydratedInfo)
  const coin1 = useLiquidity((s) => s.coin1)
  const coin2 = useLiquidity((s) => s.coin2)
  const isMobile = useAppSettings((s) => s.isMobile)

  const pooledBaseTokenAmount = currentHydratedInfo?.baseToken
    ? toTokenAmount(currentHydratedInfo.baseToken, currentHydratedInfo.baseReserve)
    : undefined
  const pooledQuoteTokenAmount = currentHydratedInfo?.quoteToken
    ? toTokenAmount(currentHydratedInfo.quoteToken, currentHydratedInfo.quoteReserve)
    : undefined

  const isCoin1Base = String(currentHydratedInfo?.baseMint) === String(coin1?.mint)
  const [poolCoin1TokenAmount, poolCoin2TokenAmount] = isCoin1Base
    ? [pooledBaseTokenAmount, pooledQuoteTokenAmount]
    : [pooledQuoteTokenAmount, pooledBaseTokenAmount]

  const price =
    isMeaningfulNumber(poolCoin1TokenAmount) && poolCoin2TokenAmount
      ? div(poolCoin2TokenAmount, poolCoin1TokenAmount)
      : undefined

  const innerPriceLeftCoin = innerReversed ? coin2 : coin1
  const innerPriceRightCoin = innerReversed ? coin1 : coin2

  if (!price) return null
  return (
    <Div icss={cssRow()} className={twMerge('font-medium text-sm text-primary', className)}>
      {1} {innerPriceLeftCoin?.symbol ?? '--'} ≈{' '}
      {toString(innerReversed ? div(1, price) : price, {
        decimalLength: isMobile ? 'auto 2' : 'auto',
        zeroDecimalNotAuto: true
      })}{' '}
      {innerPriceRightCoin?.symbol ?? '--'}
      <Div className="ml-2 clickable" onClick={() => setInnerReversed((b) => !b)}>
        ⇋
      </Div>
    </Div>
  )
}

function LiquidityCardInfo({ className }: { className?: string }) {
  const currentHydratedInfo = useLiquidity((s) => s.currentHydratedInfo)
  const coin1 = useLiquidity((s) => s.coin1)
  const coin2 = useLiquidity((s) => s.coin2)
  const focusSide = useLiquidity((s) => s.focusSide)
  const coin1Amount = useLiquidity((s) => s.coin1Amount)
  const coin2Amount = useLiquidity((s) => s.coin2Amount)
  const slippageTolerance = useAppSettings((s) => s.slippageTolerance)

  const isCoin1Base = String(currentHydratedInfo?.baseMint) === String(coin1?.mint)

  const coinBase = isCoin1Base ? coin1 : coin2
  const coinQuote = isCoin1Base ? coin2 : coin1

  const pooledBaseTokenAmount = currentHydratedInfo?.baseToken
    ? toTokenAmount(currentHydratedInfo.baseToken, currentHydratedInfo.baseReserve)
    : undefined
  const pooledQuoteTokenAmount = currentHydratedInfo?.quoteToken
    ? toTokenAmount(currentHydratedInfo.quoteToken, currentHydratedInfo.quoteReserve)
    : undefined

  const isStable = useMemo(() => Boolean(currentHydratedInfo?.version === 5), [currentHydratedInfo])

  return (
    <Div
      icss={cssCol()}
      className={twMerge(
        'py-4 px-6 flex-grow ring-inset ring-1.5 ring-[rgba(171,196,255,.5)] rounded-xl items-center',
        className
      )}
    >
      <Div icss={cssCol()} className="w-full">
        <LiquidityCardItem
          fieldName={`Base`}
          fieldValue={focusSide === 'coin1' ? coin1?.symbol ?? 'unknown' : coin2?.symbol ?? 'unknown'}
        />
        <FadeIn>
          {(coin1Amount || coin2Amount) && (
            <LiquidityCardItem
              fieldName="Max Amount"
              fieldValue={`${formatNumber(focusSide === 'coin1' ? coin2Amount || '' : coin1Amount ?? '', {
                fractionLength: 'auto'
              })} ${focusSide === 'coin1' ? coin2?.symbol ?? 'unknown' : coin1?.symbol ?? 'unknown'}`}
            />
          )}
        </FadeIn>
        <LiquidityCardItem
          fieldName={`Pool liquidity (${coinBase?.symbol ?? 'unknown'})`}
          fieldValue={
            <Div>
              {pooledBaseTokenAmount
                ? `${formatNumber(pooledBaseTokenAmount.toExact())} ${coinBase?.symbol ?? 'unknown'}`
                : '--'}
            </Div>
          }
        />
        <LiquidityCardItem
          fieldName={`Pool liquidity (${coinQuote?.symbol ?? 'unknown'})`}
          fieldValue={
            <Div>
              {pooledQuoteTokenAmount
                ? `${formatNumber(pooledQuoteTokenAmount.toExact())} ${coinQuote?.symbol ?? 'unknown'}`
                : '--'}
            </Div>
          }
        />
        <LiquidityCardItem
          fieldName="LP supply"
          fieldValue={
            <Div icss={cssRow()} className="items-center gap-2">
              {isStable && <Badge className="self-center">Stable</Badge>}
              <Div>
                {currentHydratedInfo?.lpToken
                  ? `${formatNumber(
                      toString(toTokenAmount(currentHydratedInfo.lpToken, currentHydratedInfo.lpSupply))
                    )} LP`
                  : '--'}
              </Div>
            </Div>
          }
        />
        <Collapse openDirection="upwards" className="w-full">
          <Collapse.Body>
            <Div icss={cssCol()}>
              <LiquidityCardItem fieldName="Addresses" tooltipContent={<LiquidityCardTooltipPanelAddress />} />
              <LiquidityCardItem
                fieldName="Slippage Tolerance"
                fieldValue={
                  <Div
                    icss={cssRow()}
                    className="py-1 px-2 bg-[#141041] rounded-sm text-[#F1F1F2] font-medium text-xs -my-1"
                  >
                    <Input
                      className="w-6"
                      value={toString(mul(slippageTolerance, 100), { decimalLength: 'auto 2' })}
                      onUserInput={(value) => {
                        const n = div(parseFloat(value), 100)
                        if (n) {
                          useAppSettings.setState({ slippageTolerance: n })
                        }
                      }}
                    />
                    <Div className="opacity-50 ml-1">%</Div>
                  </Div>
                }
              />
            </Div>
          </Collapse.Body>
          <Collapse.Face>
            {(open) => (
              <Div
                icss={cssRow()}
                className="w-full items-center text-xs font-medium text-[rgba(171,196,255,0.5)] cursor-pointer select-none"
              >
                <Div className="py-1.5">{open ? 'Show less' : 'More information'}</Div>
                <Icon size="xs" heroIconName={open ? 'chevron-up' : 'chevron-down'} className="ml-1" />
              </Div>
            )}
          </Collapse.Face>
        </Collapse>
      </Div>
    </Div>
  )
}
function LiquidityCardItem({
  className,
  fieldName,
  fieldValue,
  tooltipContent,
  debugForceOpen
}: {
  className?: string
  fieldName?: string
  fieldValue?: ReactNode
  tooltipContent?: ReactNode
  /** !! only use it in debug */
  debugForceOpen?: boolean
}) {
  return (
    <Div icss={cssRow()} className={twMerge('w-full justify-between my-1.5', className)}>
      <Div icss={cssRow()} className="items-center text-xs font-medium text-primary">
        <Div className="mr-1">{fieldName}</Div>
        {tooltipContent && (
          <Tooltip className={className} placement="bottom-right" forceOpen={debugForceOpen}>
            <Icon size="xs" heroIconName="question-mark-circle" className="cursor-help" />
            <Tooltip.Panel>{tooltipContent}</Tooltip.Panel>
          </Tooltip>
        )}
      </Div>
      <Div className="text-xs font-medium text-white text-right">{fieldValue}</Div>
    </Div>
  )
}

function LiquidityCardTooltipPanelAddress() {
  const coin1 = useLiquidity((s) => s.coin1)
  const coin2 = useLiquidity((s) => s.coin2)
  const { lpMint, id, marketId } = useLiquidity((s) => s.currentJsonInfo) ?? {}
  return (
    <Div className="w-60">
      <Div className="text-sm font-semibold mb-2">Addresses</Div>
      <Div icss={cssCol()} className="gap-2">
        {coin1 && (
          <LiquidityCardTooltipPanelAddressItem
            label={coin1.symbol ?? '--'}
            type="token"
            address={String(coin1.mint ?? '--')}
          />
        )}
        {coin2 && (
          <LiquidityCardTooltipPanelAddressItem
            label={coin2.symbol ?? '--'}
            type="token"
            address={String(coin2.mint ?? '--')}
          />
        )}
        {Boolean(lpMint) && <LiquidityCardTooltipPanelAddressItem label="LP" type="token" address={lpMint!} />}
        {Boolean(id) && <LiquidityCardTooltipPanelAddressItem label="Amm ID" address={id!} />}
        {Boolean(marketId) && <LiquidityCardTooltipPanelAddressItem label="Market ID" address={marketId!} />}
      </Div>
    </Div>
  )
}

function LiquidityCardTooltipPanelAddressItem({
  className,
  label,
  address,
  type = 'account'
}: {
  className?: string
  label: string
  address: string
  type?: 'token' | 'account'
}) {
  return (
    <Div icss={cssRow()} className={twMerge('grid gap-2 items-center grid-cols-[5em,1fr,auto,auto]', className)}>
      <Div className="text-xs font-normal text-white">{label}</Div>
      <AddressItem
        showDigitCount={5}
        addressType={type}
        canCopy
        canExternalLink
        textClassName="flex text-xs font-normal text-white bg-[#141041] rounded justify-center"
      >
        {address}
      </AddressItem>
    </Div>
  )
}

function UserLiquidityExhibition() {
  const hydratedInfos = useLiquidity((s) => s.hydratedInfos)
  const userExhibitionLiquidityIds = useLiquidity((s) => s.userExhibitionLiquidityIds)
  const isRemoveDialogOpen = useLiquidity((s) => s.isRemoveDialogOpen)
  const scrollToInputBox = useLiquidity((s) => s.scrollToInputBox)
  const farmPoolsList = useFarms((s) => s.hydratedInfos)
  const { getToken } = useXStore(tokenAtom)

  const balances = useWallet((s) => s.balances)
  const rawBalances = useWallet((s) => s.rawBalances)
  const isMobile = useAppSettings((s) => s.isMobile)

  const computeSharePercentValue = (percent: Percent | undefined) => {
    if (!percent) return '--%'
    if (percent.numerator.mul(new BN(10000)).div(percent.denominator).lt(new BN(1))) return '<0.01%'
    return percent.mul(new BN(100)).toFixed(2) + '%'
  }

  const exhibitionInfos = useMemo(
    () => hydratedInfos.filter(({ id }) => userExhibitionLiquidityIds?.includes(String(id))),
    [hydratedInfos, userExhibitionLiquidityIds]
  )
  return (
    <Div className="mt-12 max-w-[456px] self-center">
      <Div className="mb-6 text-xl font-medium text-white">Your Liquidity</Div>
      <Card className="p-6 mt-6 mobile:py-5 mobile:px-3 bg-cyberpunk-card-bg" size="lg">
        <List className={`flex flex-col gap-6 mobile:gap-5 ${exhibitionInfos.length ? 'mb-5' : ''}`}>
          {exhibitionInfos.map((info, idx) => {
            const correspondingFarm = farmPoolsList.find(
              (farmInfo) => isMintEqual(farmInfo.lpMint, info.lpMint) && !farmInfo.isClosedPool
            )
            return (
              <List.Item key={idx}>
                <FadeIn>
                  <Collapse className="ring-inset ring-1.5 ring-[rgba(171,196,255,.5)] rounded-3xl mobile:rounded-xl">
                    <Collapse.Face>
                      {(open) => (
                        <Div icss={cssRow()} className="items-center justify-between py-4 px-6 mobile:px-4">
                          <Div icss={cssRow()} className="gap-2 items-center">
                            <CoinAvatarPair
                              className="justify-self-center"
                              token1={info.baseToken}
                              token2={info.quoteToken}
                              size={isMobile ? 'sm' : 'md'}
                            />
                            <Div className="text-base font-normal text-primary">
                              {info.baseToken?.symbol ?? ''}/{info.quoteToken?.symbol ?? ''}
                            </Div>
                          </Div>
                          <Icon
                            size="sm"
                            className="text-primary"
                            heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`}
                          />
                        </Div>
                      )}
                    </Collapse.Face>
                    <Collapse.Body>
                      <Div className="pb-4 px-6 mobile:px-4">
                        <Div icss={cssCol()} className="border-t-1.5 border-[rgba(171,196,255,.5)] py-5 gap-3 ">
                          <Div icss={cssRow()} className="justify-between">
                            <Div className="text-xs mobile:text-2xs font-medium text-primary">Pooled (Base)</Div>
                            <Div className="text-xs mobile:text-2xs font-medium text-white">
                              {toString(info.userBasePooled) || '--'} {info.baseToken?.symbol}
                            </Div>
                          </Div>
                          <Div icss={cssRow()} className="justify-between">
                            <Div className="text-xs mobile:text-2xs font-medium text-primary">Pooled (Quote)</Div>
                            <Div className="text-xs mobile:text-2xs font-medium text-white">
                              {toString(info.userQuotePooled) || '--'} {info.quoteToken?.symbol}
                            </Div>
                          </Div>
                          <Div icss={cssRow()} className="justify-between">
                            <Div className="text-xs mobile:text-2xs font-medium text-primary">Your Liquidity</Div>
                            <Div className="text-xs mobile:text-2xs font-medium text-white">
                              {info.lpMint
                                ? toString(div(rawBalances[String(info.lpMint)], 10 ** info.lpDecimals), {
                                    decimalLength: `auto ${info.lpDecimals}`
                                  })
                                : '--'}{' '}
                              LP
                            </Div>
                          </Div>
                          <Div icss={cssRow()} className="justify-between">
                            <Div className="text-xs mobile:text-2xs font-medium text-primary">Your share</Div>
                            <Div className="text-xs mobile:text-2xs font-medium text-white">
                              {computeSharePercentValue(info.sharePercent)}
                            </Div>
                          </Div>
                        </Div>
                        <Div icss={cssRow()} className="gap-4 mb-1">
                          <Button
                            className="text-base mobile:text-sm font-medium frosted-glass frosted-glass-teal rounded-xl flex-grow"
                            onClick={() => {
                              liquidityAtom.set({
                                currentJsonInfo: info.jsonInfo
                              })
                              scrollToInputBox()
                            }}
                          >
                            Add Liquidity
                          </Button>
                          <Tooltip>
                            <Icon
                              size="smi"
                              iconSrc="/icons/pools-farm-entry.svg"
                              className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable-filter-effect ${
                                correspondingFarm ? 'clickable' : 'not-clickable'
                              }`}
                              onClick={() => {
                                routeTo('/farms', {
                                  //@ts-expect-error no need to care about enum of this error
                                  queryProps: objectShakeFalsy({
                                    currentTab: correspondingFarm?.category
                                      ? capitalize(correspondingFarm?.category)
                                      : undefined,
                                    newExpandedItemId: toPubString(correspondingFarm?.id),
                                    searchText: [info.baseToken?.symbol, info.quoteToken?.symbol].join(' ')
                                  })
                                })
                              }}
                            />
                            <Tooltip.Panel>Farm</Tooltip.Panel>
                          </Tooltip>
                          <Tooltip>
                            <Icon
                              iconSrc="/icons/msic-swap-h.svg"
                              size="smi"
                              className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
                              onClick={() => {
                                routeTo('/swap', {
                                  queryProps: {
                                    coin1: info.baseToken,
                                    coin2: info.quoteToken
                                  }
                                })
                              }}
                            />
                            <Tooltip.Panel>Swap</Tooltip.Panel>
                          </Tooltip>
                          <Tooltip>
                            <Icon
                              size="smi"
                              iconSrc="/icons/pools-remove-liquidity-entry.svg"
                              className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect`}
                              onClick={() => {
                                liquidityAtom.set({ currentJsonInfo: info.jsonInfo, isRemoveDialogOpen: true })
                              }}
                            />
                            <Tooltip.Panel>Remove Liquidity</Tooltip.Panel>
                          </Tooltip>
                        </Div>
                      </Div>
                    </Collapse.Body>
                  </Collapse>
                </FadeIn>
              </List.Item>
            )
          })}
        </List>

        <RemoveLiquidityDialog
          open={isRemoveDialogOpen}
          onClose={() => {
            liquidityAtom.set({ isRemoveDialogOpen: false })
          }}
        />
        <Div className="text-xs mobile:text-2xs font-medium text-[rgba(171,196,255,0.5)]">
          If you staked your LP tokens in a farm, unstake them to see them here
        </Div>
      </Card>
    </Div>
  )
}

function CreatePoolCardEntry() {
  return (
    <Div className="mt-12 max-w-[456px] self-center">
      <Div className="mb-6 text-xl font-medium text-white">Create Pool</Div>
      <Card className="p-6 mt-6 mobile:py-5 mobile:px-3 bg-cyberpunk-card-bg" size="lg">
        <Div icss={cssRow()} className="gap-4">
          <Div className="text-xs mobile:text-2xs font-medium text-[rgba(171,196,255,0.5)]">
            Create a liquidity pool on Raydium that can be traded on the swap interface.{' '}
            <Link
              noTextStyle
              className="text-[rgba(171,196,255)] hover:underline"
              href="https://raydium.gitbook.io/raydium/permissionless/creating-a-pool"
            >
              Read the guide
            </Link>{' '}
            before attempting.
          </Div>

          <Button
            className="flex items-center frosted-glass-teal opacity-80"
            onClick={() => {
              routeTo('/liquidity/create')
            }}
          >
            <Icon className="mr-2" heroIconName="plus" />
            <Div>Create Pool</Div>
          </Button>
        </Div>
      </Card>
    </Div>
  )
}
