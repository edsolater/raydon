import { useXStore } from '@/../../xstore/dist'
import useAppSettings from '@/application/appSettings/useAppSettings'
import {
  createNewUIRewardInfo,
  hasRewardBeenEdited,
  parsedHydratedRewardInfoToUiRewardInfo
} from '@/application/createFarm/parseRewardInfo'
import txClaimReward from '@/application/createFarm/txClaimReward'
import { UIRewardInfo } from '@/application/createFarm/type'
import useCreateFarms, { cleanStoreEmptyRewards } from '@/application/createFarm/useCreateFarm'
import { farmAtom } from '@/application/farms/atom'
import { HydratedFarmInfo } from '@/application/farms/type'
import { routeBack, routeTo } from '@/application/routeTools'
import useWallet from '@/application/wallet/useWallet'
import { AddressItem } from '@/components/AddressItem'
import { EditableRewardSummary } from '@/components/createFarm/EditableRewardSummary'
import { NewRewardIndicatorAndForm } from '@/components/createFarm/NewRewardIndicatorAndForm'
import { PoolInfoSummary } from '@/components/createFarm/PoolInfoSummery'
import RewardInputDialog from '@/components/createFarm/RewardEditDialog'
import Icon from '@/components/Icon'
import PageLayout from '@/components/PageLayout/PageLayout'
import { isDateBefore } from '@/functions/date/judges'
import { getDuration, parseDurationAbsolute } from '@/functions/date/parseDuration'
import toPubString from '@/functions/format/toMintString'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { isValidPublicKey } from '@/functions/judgers/dateType'
import { gte, isMeaningfulNumber } from '@/functions/numberish/compare'
import { div } from '@/functions/numberish/operations'
import { objectShakeNil } from '@/functions/objectMethods'
import { useChainDate } from '@/hooks/useChainDate'
import Button from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'
import { cssRow, Div } from '@edsolater/uikit'
import produce from 'immer'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'

function useAvailableCheck() {
  useEffect(() => {
    if (!useCreateFarms.getState().isRoutedByCreateOrEdit)
      routeTo('/farms', { queryProps: { currentTab: 'Ecosystem' } })
  }, [])
}

function NavButtons({ className }: { className?: string }) {
  return (
    <Div icss={cssRow()} className={twMerge('items-center justify-between', className)}>
      <Button
        type="text"
        className="text-sm text-primary opacity-50 px-0"
        prefix={<Icon heroIconName="chevron-left" size="sm" />}
        onClick={() => routeBack()}
      >
        Back to Farms
      </Button>
    </Div>
  )
}

export function useEditFarmUrlParser() {
  const { query } = useRouter()
  const owner = useWallet((s) => s.owner)
  const { hydratedInfos: farms } = useXStore(farmAtom)
  function updateCreateFarmInfo(farmInfo: HydratedFarmInfo) {
    useCreateFarms.setState(
      objectShakeNil({
        farmId: toPubString(farmInfo.id),
        poolId: farmInfo.ammId,
        rewards: farmInfo.rewards.map((reward) => parsedHydratedRewardInfoToUiRewardInfo(reward)),
        disableAddNewReward: !isMintEqual(farmInfo.creator, owner)
      })
    )
  }
  useEffect(() => {
    const farmId = String(query?.farmId)
    if (!isValidPublicKey(farmId)) return
    const dataAlreadyExist = useCreateFarms.getState().farmId === farmId
    if (dataAlreadyExist) return
    const farmInfo = farms.find((f) => toPubString(f.id) === farmId)
    if (farmInfo) updateCreateFarmInfo(farmInfo)
  }, [query?.farmId, farms, owner])
}

export default function FarmEditPage() {
  useAvailableCheck()
  useEditFarmUrlParser()

  const walletConnected = useWallet((s) => s.connected)
  const getBalance = useWallet((s) => s.getBalance)
  const { rewards: allRewards, cannotAddNewReward, farmId } = useCreateFarms()
  const { hydratedInfos: hydratedFarmInfos } = useXStore(farmAtom)
  const [focusReward, setFocusReward] = useState<UIRewardInfo>()
  const canAddRewardInfo = !cannotAddNewReward && allRewards.length < 5
  const editableRewards = allRewards.filter((r) => r.type === 'existed reward')
  const editedRewards = editableRewards.filter((r) => hasRewardBeenEdited(r))
  const newAddedRewards = allRewards.filter((r) => r.type === 'new added')
  const meaningFullRewards = newAddedRewards.filter(
    (r) => r.amount != null || r.startTime != null || r.endTime != null || r.token != null
  )
  const hydratedFarmInfo = hydratedFarmInfos.find((i) => isMintEqual(i.id, farmId))
  const chainDate = useChainDate()
  const cachedInputs = useMemo(() => <NewRewardIndicatorAndForm className="mt-8 mb-4" />, [])
  return (
    <PageLayout metaTitle="Farms - Raydium" contentYPaddingShorter>
      <NavButtons className="sticky top-0" />
      <Div className="self-center w-[min(720px,90vw)]">
        <Div icss={cssRow()} className="mb-10 justify-self-start items-baseline gap-2">
          <Div className="text-2xl mobile:text-lg font-semibold text-white">Edit Farm</Div>
          {farmId && (
            <Div className="text-sm mobile:text-xs font-semibold text-[#abc4ff80]">
              Farm ID:
              <Div className="inline-block ml-1">
                <AddressItem
                  className="flex-nowrap whitespace-nowrap"
                  canCopy
                  iconClassName="hidden"
                  textClassName="text-sm mobile:text-xs font-semibold text-[#abc4ff80] whitespace-nowrap"
                  showDigitCount={6}
                >
                  {farmId}
                </AddressItem>
              </Div>
            </Div>
          )}
        </Div>

        <Div className="mb-8">
          <Div className="mb-3 text-primary text-sm font-medium justify-self-start">Pool</Div>
          <PoolInfoSummary />
        </Div>

        <Div className="mb-4">
          <Div className="mb-3 text-primary text-sm font-medium justify-self-start">Farm rewards</Div>
          <EditableRewardSummary
            canUserEdit
            onClickIncreaseReward={({ reward }) => {
              setFocusReward(reward)
            }}
            onClaimReward={({ reward, onTxSuccess }) => txClaimReward({ reward, onTxSuccess })}
            onClaimAllReward={({ rewards, onTxSuccess }) => txClaimReward({ reward: rewards, onTxSuccess })}
          />
        </Div>

        {cachedInputs}

        <Div
          icss={cssRow()}
          className={`items-center my-2 mb-12 text-sm clickable ${
            canAddRewardInfo ? '' : 'not-clickable-with-disallowed'
          }`}
          onClick={() => {
            if (!canAddRewardInfo) return
            useCreateFarms.setState({
              rewards: produce(allRewards, (draft) => {
                draft.push(createNewUIRewardInfo())
              })
            })
          }}
        >
          <Icon className="text-primary" heroIconName="plus-circle" size="sm" />
          <Div className="ml-1.5 text-primary font-medium mobile:text-sm">Add another reward token</Div>
          <Div className="ml-1.5 text-[#abc4ff80] font-medium mobile:text-sm">({5 - allRewards.length} more)</Div>
        </Div>

        <Button
          className="block frosted-glass-teal mx-auto mt-4 mb-12"
          size="lg"
          validators={[
            {
              should: meaningFullRewards.length || editedRewards.length
            },
            {
              should: walletConnected,
              forceActive: true,
              fallbackProps: {
                onClick: () => useAppSettings.setState({ isWalletSelectorShown: true }),
                children: 'Connect Wallet'
              }
            },
            {
              should: meaningFullRewards.every((r) => r.token),
              fallbackProps: {
                children: 'Confirm reward token'
              }
            },
            ...meaningFullRewards.map((reward) => ({
              should: reward.amount,
              fallbackProps: {
                children: `Enter ${reward.token?.symbol ?? '--'} token amount`
              }
            })),
            ...meaningFullRewards.map((reward) => ({
              should: isMeaningfulNumber(reward.amount),
              fallbackProps: {
                children: `Insufficient ${reward.token?.symbol ?? '--'} token amount`
              }
            })),
            ...meaningFullRewards.map((reward) => {
              const haveBalance = gte(getBalance(reward.token), reward.amount)
              return {
                should: haveBalance,
                fallbackProps: {
                  children: `Insufficient ${reward.token?.symbol} balance`
                }
              }
            }),
            {
              should: meaningFullRewards.every((r) => r.startTime && r.endTime),
              fallbackProps: {
                children: 'Confirm emission time setup'
              }
            },
            {
              should: meaningFullRewards.every((r) => r.startTime && isDateBefore(chainDate, r.startTime)),
              fallbackProps: {
                children: 'Insufficient start time'
              }
            },
            ...meaningFullRewards.map((reward) => {
              const minBoundary =
                reward.endTime && reward.startTime && reward.token
                  ? div(getDuration(reward.endTime, reward.startTime) / 1000, 10 ** reward.token.decimals)
                  : undefined
              return {
                should: gte(reward.amount, minBoundary),
                fallbackProps: {
                  children: `Emission rewards is lower than min required`
                }
              }
            }),
            {
              should: meaningFullRewards.every((reward) => {
                const durationTime =
                  reward?.endTime && reward.startTime
                    ? reward.endTime.getTime() - reward.startTime.getTime()
                    : undefined
                const estimatedValue =
                  reward?.amount && durationTime
                    ? div(reward.amount, parseDurationAbsolute(durationTime).days)
                    : undefined
                return isMeaningfulNumber(estimatedValue)
              }),
              fallbackProps: {
                children: 'Insufficient estimated value'
              }
            }
          ]}
          onClick={() => {
            useCreateFarms.setState({
              isRoutedByCreateOrEdit: true
            })
            routeTo('/farms/editReview')?.then(() => {
              cleanStoreEmptyRewards()
            })
          }}
        >
          Review changes
        </Button>

        <Card className={`p-6 rounded-3xl ring-1 ring-inset ring-[#abc4ff1a] bg-[#1B1659] relative`}>
          <Div className="absolute -left-4 top-5 -translate-x-full">
            <Icon iconSrc="/icons/create-farm-info-circle.svg" iconClassName="w-7 h-7" />
          </Div>

          <Div className="font-medium text-base text-primary mb-3">How to add more rewards?</Div>

          <Div>
            <Div className="font-medium text-sm text-[#ABC4FF80] mb-4">
              <ol className="list-decimal ml-4 space-y-4">
                <li>
                  You can add additional rewards to the farm 72 hrs prior to rewards ending, but this can only be done
                  if rate of rewards for that specific reward token doesn't change.
                </li>
                <li>
                  If you want to increase or decrease the rewards rate, you must wait until the previous rewards period
                  ends before starting a new period and rewards amount.
                </li>
              </ol>
            </Div>
          </Div>
        </Card>

        {focusReward != null && (
          <RewardInputDialog
            cardTitle="Add more rewards"
            reward={focusReward}
            minDurationSeconds={hydratedFarmInfo?.jsonInfo.rewardPeriodMin}
            maxDurationSeconds={hydratedFarmInfo?.jsonInfo.rewardPeriodMax}
            open={Boolean(focusReward)}
            onClose={() => setFocusReward(undefined)}
          />
        )}
      </Div>
    </PageLayout>
  )
}
