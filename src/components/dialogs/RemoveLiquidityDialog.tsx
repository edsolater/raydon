import React, { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import useAppSettings from '@/application/appSettings/useAppSettings'
import txRemoveLiquidity from '@/application/liquidity/tx/txRemoveLiquidity'
import { HydratedLiquidityInfo } from '@/application/liquidity/type'
import useLiquidity from '@/application/liquidity/useLiquidity'
import useWallet from '@/application/wallet/useWallet'
import Button, { ButtonHandle } from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'
import CoinInputBox, { CoinInputBoxHandle } from '@/components/CoinInputBox'
import Dialog from '@/tempUikits/Dialog'
import Icon from '@/components/Icon'
import { gt } from '@/functions/numberish/compare'
import { Div, cssRow } from '@edsolater/uikit'
import { liquidityAtom } from '@/application/liquidity/atom'

export function RemoveLiquidityDialog({
  info,
  open,
  onClose,
  className
}: {
  info?: HydratedLiquidityInfo // if not specified, use liquidity's `currentHydratedInfo`
  open: boolean
  onClose: () => void
  className?: string
}) {
  const defaultHydratedInfo = useLiquidity((s) => s.currentHydratedInfo)
  const removeAmout = useLiquidity((s) => s.removeAmount)
  const walletConnected = useWallet((s) => s.connected)
  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)

  const hydratedInfo = info ?? defaultHydratedInfo

  const [amountIsOutOfMax, setAmountIsOutOfMax] = React.useState(false)
  const [amountIsNegative, setAmountIsNegative] = React.useState(false)
  const coinInputBoxComponentRef = useRef<CoinInputBoxHandle>()
  const buttonComponentRef = useRef<ButtonHandle>()

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
        liquidityAtom.set({ removeAmount: '' })
        setAmountIsNegative(false)
        setAmountIsOutOfMax(false)
      }}
    >
      {({ close: closeDialog }) => (
        <Card
          className={twMerge(
            'backdrop-filter backdrop-blur-xl p-8 rounded-3xl w-[min(456px,90vw)] border-1.5 border-[rgba(171,196,255,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card',
            className
          )}
          size="lg"
        >
          <Div icss={cssRow()} className="justify-between items-center mb-6">
            <Div className="text-xl font-semibold text-white">Stake LP</Div>
            <Icon className="text-primary cursor-pointer" heroIconName="x" onClick={closeDialog} />
          </Div>

          {/* input-container-box */}
          <CoinInputBox
            className="mb-6"
            componentRef={coinInputBoxComponentRef}
            topLeftLabel="Pool"
            token={hydratedInfo?.lpToken}
            onUserInput={(value) => {
              liquidityAtom.set({ removeAmount: value })
            }}
            onInputAmountClampInBalanceChange={({ negative, outOfMax }) => {
              negative ? setAmountIsNegative(true) : setAmountIsNegative(false)
              outOfMax ? setAmountIsOutOfMax(true) : setAmountIsOutOfMax(false)
            }}
            onEnter={(input) => {
              if (!input) return
              buttonComponentRef.current?.click?.()
            }}
          />

          <Div icss={cssRow()} className="flex-col gap-1">
            <Button
              className="frosted-glass frosted-glass-teal"
              isLoading={isApprovePanelShown}
              componentRef={buttonComponentRef}
              validators={[
                { should: gt(removeAmout, 0) },

                // { should: value is smaller than balance, but larget than zero },
                { should: !amountIsOutOfMax, fallbackProps: { children: 'Amount Too Large' } },
                { should: !amountIsNegative, fallbackProps: { children: `Negative Amount` } },
                {
                  should: walletConnected,
                  forceActive: true,
                  fallbackProps: {
                    onClick: () => useAppSettings.setState({ isWalletSelectorShown: true }),
                    children: 'Connect Wallet'
                  }
                }
              ]}
              onClick={() => {
                txRemoveLiquidity({ ammId: hydratedInfo?.id }).then(() => {
                  liquidityAtom.set({ removeAmount: '' })
                  setAmountIsNegative(false)
                  setAmountIsOutOfMax(false)
                })
              }}
            >
              Remove Liquidity
            </Button>
            <Button type="text" className="text-sm text-primary opacity-50 backdrop-filter-none" onClick={closeDialog}>
              Cancel
            </Button>
          </Div>
        </Card>
      )}
    </Dialog>
  )
}
