import useAppSettings from '@/application/appSettings/useAppSettings'
import { createNewUIRewardInfo, hasRewardBeenEdited } from '@/application/createFarm/parseRewardInfo'
import txUpdateEdited from '@/application/createFarm/txUpdateFarm'
import useCreateFarms from '@/application/createFarm/useCreateFarm'
import { farmAtom } from '@/application/farms/atom'
import { routeBack, routeTo } from '@/application/routeTools'
import { tokenAtom } from '@/application/token'
import { AddressItem } from '@/components/AddressItem'
import { EditableRewardSummary } from '@/components/createFarm/EditableRewardSummary'
import { NewAddedRewardSummary } from '@/components/createFarm/NewAddedRewardSummary'
import { PoolInfoSummary } from '@/components/createFarm/PoolInfoSummery'
import PageLayout from '@/components/PageLayout/PageLayout'
import assert from '@/functions/assert'
import tryCatch from '@/functions/tryCatch'
import Button from '@/tempUikits/Button'
import { cssRow, Div } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import { useEffect, useMemo } from 'react'

function useAvailableCheck() {
  useEffect(() => {
    if (!useCreateFarms.getState().isRoutedByCreateOrEdit)
      routeTo('/farms', { queryProps: { currentTab: 'Ecosystem' } })
  }, [])
}

export default function EditReviewPage() {
  const { getToken } = useXStore(tokenAtom)
  const { poolId, rewards, farmId } = useCreateFarms()
  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)
  const canCreateFarm = useMemo(
    () =>
      tryCatch(
        () => {
          assert(poolId, 'poolId is not defined')
          rewards.forEach((reward) => {
            assert(reward.amount, 'reward amount is not defined')
            assert(reward.token, 'reward token is not defined')
            assert(reward.startTime, 'reward start time is not defined')
            assert(reward.endTime, 'reward end time is not defined')
          })
          return true
        },
        () => false
      ),
    [poolId, rewards, getToken]
  )

  const newRewards = rewards.filter((r) => r.type === 'new added')
  const editedRewards = rewards.filter((r) => hasRewardBeenEdited(r))

  useAvailableCheck()

  return (
    <PageLayout metaTitle="Farms - Raydium">
      <Div className="self-center w-[min(720px,90vw)]">
        <Div icss={cssRow()} className="mb-8 justify-self-start items-baseline gap-2">
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

        <Div className="mb-8 text-xl mobile:text-lg font-semibold justify-self-start text-white">
          Review farm details
        </Div>

        <Div className="mb-8">
          <Div className="mb-3 text-primary text-sm font-medium justify-self-start">Pool</Div>
          <PoolInfoSummary />
        </Div>

        <Div className="mb-6">
          <Div className="mb-3 text-primary text-sm font-medium justify-self-start">Existing farm rewards</Div>
          <EditableRewardSummary canUserEdit={false} />
        </Div>

        {newRewards.length > 0 && (
          <Div className="mb-6">
            <Div className="mb-3 text-primary text-sm font-medium justify-self-start">New farm rewards</Div>
            <NewAddedRewardSummary canUserEdit={false} />
          </Div>
        )}

        <Div icss={cssRow()} className="gap-5 mt-12 justify-center">
          <Button
            className="frosted-glass-teal"
            isLoading={isApprovePanelShown}
            size="lg"
            validators={[{ should: newRewards.length > 0 || editedRewards.length > 0 }]}
            onClick={() => {
              txUpdateEdited({
                onTxSuccess: () => {
                  setTimeout(() => {
                    routeTo('/farms', { queryProps: { currentTab: 'Ecosystem' } })
                    useCreateFarms.setState({ rewards: [createNewUIRewardInfo()] })
                    farmAtom.get().refreshFarmInfos()
                    useCreateFarms.setState({ isRoutedByCreateOrEdit: false })
                  }, 1000)
                }
              })
            }}
          >
            Confirm Farm Changes
          </Button>
          <Button className="frosted-glass-skygray" size="lg" onClick={routeBack}>
            Edit
          </Button>
        </Div>
      </Div>
    </PageLayout>
  )
}
