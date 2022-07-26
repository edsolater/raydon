import React, { useMemo, useState } from 'react'
import txFarmDeposit from '@/application/farms/tx/txFarmDeposit'
import txFarmWithdraw from '@/application/farms/tx/txFarmWithdraw'
import useStaking from '@/application/staking/useStaking'
import useWallet from '@/application/wallet/useWallet'
import Button from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'
import CoinInputBox from '@/components/CoinInputBox'
import Icon from '@/components/Icon'
import ResponsiveDialogDrawer from '@/tempUikits/ResponsiveDialogDrawer'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import { toString } from '@/functions/numberish/toString'
import { gt, gte } from '@/functions/numberish/compare'
import useAppSettings from '@/application/appSettings/useAppSettings'
import { Div, cssRow } from '@edsolater/uikit'

export function StakingPageStakeLpDialog() {
  const connected = useWallet((s) => s.connected)
  const balances = useWallet((s) => s.balances)
  const tokenAccounts = useWallet((s) => s.tokenAccounts)

  const stakeDialogInfo = useStaking((s) => s.stakeDialogInfo)
  const stakeDialogMode = useStaking((s) => s.stakeDialogMode)
  const isStakeDialogOpen = useStaking((s) => s.isStakeDialogOpen)
  const [amount, setAmount] = useState<string>()
  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)

  const userHasLp = useMemo(
    () =>
      Boolean(stakeDialogInfo?.lpMint) &&
      tokenAccounts.some(({ mint }) => String(mint) === String(stakeDialogInfo?.lpMint)),
    [tokenAccounts, stakeDialogInfo]
  )
  const avaliableTokenAmount = useMemo(
    () =>
      stakeDialogMode === 'deposit'
        ? stakeDialogInfo?.lpMint && balances[String(stakeDialogInfo.lpMint)]
        : stakeDialogInfo?.userStakedLpAmount,
    [stakeDialogInfo, balances, stakeDialogMode]
  )
  const userInputTokenAmount = useMemo(() => {
    if (!stakeDialogInfo?.lp || !amount) return undefined
    return toTokenAmount(stakeDialogInfo.lp, amount, { alreadyDecimaled: true })
  }, [stakeDialogInfo, amount])
  return (
    <ResponsiveDialogDrawer
      open={isStakeDialogOpen}
      onClose={() => {
        setAmount(undefined)
        useStaking.setState({ isStakeDialogOpen: false })
      }}
      placement="from-bottom"
    >
      {({ close }) => (
        <Card
          className="backdrop-filter backdrop-blur-xl p-8 rounded-3xl w-[min(468px,100vw)] mobile:w-full border-1.5 border-[rgba(171,196,255,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card"
          size="lg"
        >
          {/* {String(info?.lpMint)} */}
          <Div icss={cssRow()} className="justify-between items-center mb-6">
            <Div className="text-xl font-semibold text-white">
              {stakeDialogMode === 'withdraw' ? 'Unstake RAY' : 'Stake RAY'}
            </Div>
            <Icon className="text-primary cursor-pointer" heroIconName="x" onClick={close} />
          </Div>
          {/* input-container-box */}
          <CoinInputBox
            className="mb-6"
            topLeftLabel="Staking RAY"
            token={stakeDialogInfo?.lp}
            onUserInput={setAmount}
            maxValue={stakeDialogMode === 'withdraw' ? stakeDialogInfo?.userStakedLpAmount : undefined}
            topRightLabel={
              stakeDialogMode === 'withdraw'
                ? stakeDialogInfo?.userStakedLpAmount
                  ? `Deposited:${toString(stakeDialogInfo?.userStakedLpAmount)}`
                  : '(no deposited)'
                : undefined
            }
          />
          <Div icss={cssRow()} className="flex-col gap-1">
            <Button
              className="frosted-glass-teal"
              isLoading={isApprovePanelShown}
              validators={[
                { should: connected },
                { should: stakeDialogInfo?.lp },
                { should: amount },
                { should: gt(userInputTokenAmount, 0) },
                {
                  should: gte(avaliableTokenAmount, userInputTokenAmount),
                  fallbackProps: { children: 'Insufficient RAY Balance' }
                },
                {
                  should: stakeDialogMode === 'withdraw' ? true : userHasLp,
                  fallbackProps: { children: stakeDialogMode === 'withdraw' ? 'No Unstakable RAY' : 'No Stakable RAY' }
                }
              ]}
              onClick={() => {
                if (!stakeDialogInfo?.lp || !amount) return
                const tokenAmount = toTokenAmount(stakeDialogInfo.lp, amount, { alreadyDecimaled: true })
                ;(stakeDialogMode === 'withdraw'
                  ? txFarmWithdraw(stakeDialogInfo, { isStaking: true, amount: tokenAmount })
                  : txFarmDeposit(stakeDialogInfo, { isStaking: true, amount: tokenAmount })
                ).then(() => {
                  close()
                })
              }}
            >
              {stakeDialogMode === 'withdraw' ? 'Unstake RAY' : 'Stake RAY'}
            </Button>
            <Button type="text" disabled={isApprovePanelShown} className="text-sm backdrop-filter-none" onClick={close}>
              Cancel
            </Button>
          </Div>
        </Card>
      )}
    </ResponsiveDialogDrawer>
  )
}
