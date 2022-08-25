import useAppSettings from '@/application/appSettings/useAppSettings'
import useCreateFarms from '@/application/createFarm/useCreateFarm'
import { MAX_DURATION, MIN_DURATION } from '@/application/farms/handleFarmInfo'
import useWallet from '@/application/wallet/useWallet'
import Button from '@/tempUikits/Button'
import ResponsiveDialogDrawer from '@/tempUikits/ResponsiveDialogDrawer'
import { isDateBefore } from '@/functions/date/judges'
import { getDuration } from '@/functions/date/parseDuration'
import { gte, isMeaningfulNumber, lte } from '@/functions/numberish/compare'
import { useChainDate } from '@/hooks/useChainDate'
import produce from 'immer'
import { useMemo, useRef, useState } from 'react'

import { twMerge } from 'tailwind-merge'

import Card from '../../tempUikits/Card'
import Dialog from '../../tempUikits/Dialog'
import { RewardCardInputsHandler, RewardFormCardInputs, RewardFormCardInputsParams } from './RewardFormInputs'
import { Div, cssRow } from '@/../../uikit/dist'

export default function RewardInputDialog({
  cardTitle,
  reward,
  open,
  onClose,
  ...restInputsProps
}: {
  cardTitle: string
  open: boolean
  onClose(): void
} & RewardFormCardInputsParams) {
  const rewardInputsRef = useRef<RewardCardInputsHandler>()
  const getBalance = useWallet((s) => s.getBalance)
  const walletConnected = useWallet((s) => s.connected)
  const isMobile = useAppSettings((s) => s.isMobile)

  const save = () => {
    if (rewardInputsRef.current?.isValid && rewardInputsRef.current?.tempReward) {
      useCreateFarms.setState((s) => ({
        rewards: produce(s.rewards, (draft) => {
          const rewardIndex = draft.findIndex((r) => r.id === reward.id)
          if (rewardIndex < 0) return
          draft[rewardIndex] = rewardInputsRef.current!.tempReward
        })
      }))
      return true
    }
    return false
  }

  const [editedReward, setEditedReward] = useState(reward)

  const haveBalance = Boolean(editedReward.token && gte(getBalance(editedReward.token), editedReward.amount))
  const chainDate = useChainDate()

  // avoid input re-render if chain Date change
  const cachedInputs = useMemo(
    () => (
      <RewardFormCardInputs
        reward={reward}
        {...restInputsProps}
        componentRef={rewardInputsRef}
        onRewardChange={setEditedReward}
      />
    ),
    [reward, rewardInputsRef]
  )
  return (
    <ResponsiveDialogDrawer open={Boolean(open)} onClose={onClose} placement="from-bottom">
      {({ close }) => (
        <Card
          className={twMerge(
            `p-8 mobile:p-4 rounded-3xl mobile:rounded-t-2xl mobile:rounded-b-none w-[min(670px,95vw)] mobile:w-full border-1.5 border-[rgba(171,196,255,0.2)]  bg-cyberpunk-card-bg shadow-cyberpunk-card`
          )}
          size="lg"
        >
          <div className="font-semibold text-xl mobile:text-sm text-white mb-5">{cardTitle}</div>

          {reward.isRwardingBeforeEnd72h && (
            <div className="border border-[rgba(171,196,255,0.2)] rounded-3xl p-6 mb-4">
              <ol className="list-decimal ml-4 space-y-4 font-medium text-[#abc4ff80] text-sm">
                <li>
                  You can add additional rewards to the farm 72 hrs prior to rewards ending, but this can only be done
                  if rate of rewards for this specific reward token doesn't change.
                </li>
                <li>
                  Edit the days or end period and we'll adjust the total amount needed to to be added without effecting
                  the rate.
                </li>
                <li>
                  If you want to increase or decrease the rewards rate, you must wait until the previous rewards period
                  ends before starting a new period and rewards amount.
                </li>
              </ol>
            </div>
          )}
          {cachedInputs}

          <Div icss={cssRow()} className="mt-6 justify-between">
            <Button
              className="frosted-glass-teal mobile:w-full"
              size={isMobile ? 'sm' : 'lg'}
              validators={[
                {
                  should: walletConnected,
                  forceActive: true,
                  fallbackProps: {
                    onClick: () => useAppSettings.setState({ isWalletSelectorShown: true }),
                    children: 'Connect wallet'
                  }
                },
                {
                  should: editedReward.token,
                  fallbackProps: {
                    children: 'Confirm reward token'
                  }
                },
                {
                  should: editedReward.amount,
                  fallbackProps: {
                    children: `Enter ${editedReward.token?.symbol ?? '--'} token amount`
                  }
                },
                {
                  should: isMeaningfulNumber(editedReward.amount),
                  fallbackProps: {
                    children: `Insufficient ${editedReward.token?.symbol ?? '--'} token amount`
                  }
                },
                {
                  should: haveBalance,
                  fallbackProps: {
                    children: `Insufficient ${editedReward.token?.symbol} balance`
                  }
                },
                {
                  should: editedReward.startTime && editedReward.endTime,
                  fallbackProps: {
                    children: 'Confirm emission time setup'
                  }
                },
                {
                  should: editedReward.startTime && isDateBefore(chainDate, editedReward.startTime),
                  fallbackProps: {
                    children: 'Insufficient start time'
                  }
                },
                {
                  should:
                    gte(getDuration(editedReward.endTime!, editedReward.startTime!), MIN_DURATION) &&
                    lte(getDuration(editedReward.endTime!, editedReward.startTime!), MAX_DURATION),
                  fallbackProps: {
                    children: 'Insufficient duration'
                  }
                }
              ]}
              onClick={() => {
                const isOk = save()
                if (isOk) close()
              }}
            >
              Save
            </Button>
            {!isMobile && (
              <Button className="frosted-glass-skygray" size="lg" onClick={close}>
                Cancel
              </Button>
            )}
          </Div>
        </Card>
      )}
    </ResponsiveDialogDrawer>
  )
}
