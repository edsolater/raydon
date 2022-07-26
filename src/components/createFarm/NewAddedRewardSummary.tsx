import { cssCol, cssRow, Div } from '@edsolater/uikit'
import useAppSettings from '@/application/appSettings/useAppSettings'
import { getRewardSignature } from '@/application/createFarm/parseRewardInfo'
import { UIRewardInfo } from '@/application/createFarm/type'
import useCreateFarms from '@/application/createFarm/useCreateFarm'
import CoinAvatar from '@/components/CoinAvatar'
import Icon from '@/components/Icon'
import { getTime, toUTC } from '@/functions/date/dateFormat'
import { TimeStamp } from '@/functions/date/interface'
import parseDuration, { getDuration, parseDurationAbsolute } from '@/functions/date/parseDuration'
import formatNumber from '@/functions/format/formatNumber'
import { div } from '@/functions/numberish/operations'
import { toString } from '@/functions/numberish/toString'
import { Badge } from '@/tempUikits/Badge'
import Grid from '@/tempUikits/Grid'
import ListTable from '@/tempUikits/ListTable'
import { Numberish } from '@/types/constants'

/**
 * mode: list show
 * mode: list show (item select)
 * mode: edit
 */
export function NewAddedRewardSummary({
  canUserEdit,
  activeReward,
  onTryEdit
}: {
  canUserEdit: boolean

  // --------- when selectable ------------
  activeReward?: UIRewardInfo
  onTryEdit?(reward: UIRewardInfo, active: boolean): void
}) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const rewards = useCreateFarms((s) => s.rewards)
  const editableRewards = rewards.filter((r) => r.type === 'existed reward')
  const newReards = rewards.filter((r) => r.type === 'new added')
  // console.log('newReards.includes(activeReward): ', activeReward && newReards.includes(activeReward))
  return (
    <ListTable
      activeItem={activeReward}
      type={isMobile ? 'item-card' : 'list-table'}
      className={isMobile ? 'gap-4' : ''}
      list={newReards}
      getItemKey={(r) => getRewardSignature(r)}
      labelMapper={[
        {
          label: 'Reward Token',
          cssGridItemWidth: '.6fr'
        },
        {
          label: 'Amount'
        },
        {
          label: 'Total Duration',
          cssGridItemWidth: '.6fr'
        },
        {
          label: 'Period (yy-mm-dd)',
          cssGridItemWidth: '1.5fr'
        },
        {
          label: 'Est. daily rewards'
        }
      ]}
      // className="backdrop-brightness-"
      rowClassName={({ item: reward }) =>
        canUserEdit
          ? activeReward?.id === reward.id
            ? 'backdrop-brightness-90 mobile:hidden'
            : 'hover:backdrop-brightness-95'
          : ''
      }
      onClickRow={({ item: reward }) => {
        onTryEdit?.(reward, activeReward?.id === reward.id)
      }}
      renderRowItem={({ item: reward, label }) => {
        if (label === 'Reward Token') {
          return reward.token ? (
            <Div icss={cssCol()} className="h-full justify-center gap-1">
              <Div icss={cssRow()} className="gap-1 items-center">
                <CoinAvatar token={reward.token} size="sm" />
                <Div>{reward.token?.symbol ?? 'UNKNOWN'}</Div>
              </Div>
              {(reward.isRewardEnded || reward.isRewardBeforeStart || reward.isRewarding) && (
                <Div icss={cssRow()} className="gap-1 flex-wrap">
                  {reward.isRewardEnded && <Badge cssColor="#da2Eef">Ended</Badge>}
                  {reward.isRewardBeforeStart && <Badge cssColor="#abc4ff">Upcoming</Badge>}
                  {reward.isRewarding && <Badge cssColor={'#39d0d8'}>Ongoing</Badge>}
                </Div>
              )}
            </Div>
          ) : (
            '--'
          )
        }

        if (label === 'Amount') {
          if (reward.isRewarding && reward.version === 'v3/v5') return '--'
          return (
            <Grid className={`gap-4 h-full`}>
              {reward?.amount ? (
                <Div icss={cssCol()} className="grow break-all justify-center">
                  {formatNumber(reward.amount, { fractionLength: reward.token?.decimals ?? 6 })}
                </Div>
              ) : undefined}
            </Grid>
          )
        }

        if (label === 'Total Duration') {
          if (reward.isRewarding && reward.version === 'v3/v5') return '--'

          const getDurationText = (startTime: TimeStamp, endTime: TimeStamp) => {
            const duration = parseDuration(getDuration(endTime, startTime))
            return duration.hours ? `${duration.days}D ${duration.hours}H` : `${duration.days}D`
          }

          return (
            <Grid className={`gap-4 h-full`}>
              {reward?.startTime && reward.endTime ? (
                <Div icss={cssCol()} className="grow break-all justify-center">
                  {getDurationText(reward.startTime, reward.endTime)}
                </Div>
              ) : undefined}
            </Grid>
          )
        }

        if (label === 'Period (yy-mm-dd)') {
          if (reward.isRewarding && reward.version === 'v3/v5') return '--'
          if (!reward.startTime || !reward.endTime) return
          return (
            <Grid className={`gap-4 h-full`}>
              {reward?.startTime && reward.endTime ? (
                <Div icss={cssCol()} className="grow justify-center">
                  <Div>{toUTC(reward.startTime)}</Div>
                  <Div>{toUTC(reward.endTime)}</Div>
                </Div>
              ) : undefined}
            </Grid>
          )
        }

        if (label === 'Est. daily rewards') {
          if (reward.isRewarding && reward.version === 'v3/v5') return '--'

          const getEstimatedValue = (amount: Numberish, startTime: TimeStamp, endTime: TimeStamp) => {
            const durationTime = endTime && startTime ? getTime(endTime) - getTime(startTime) : undefined
            const estimatedValue =
              amount && durationTime ? div(amount, parseDurationAbsolute(durationTime).days) : undefined
            return estimatedValue
          }

          const originEstimatedValue =
            reward?.amount && reward.startTime && reward.endTime
              ? getEstimatedValue(reward.amount, reward.startTime, reward.endTime)
              : undefined
          return (
            <Grid className={`gap-4 h-full`}>
              {originEstimatedValue && (
                <Div icss={cssCol()} className="grow justify-center text-xs">
                  <Div>
                    {toString(originEstimatedValue)} {reward?.token?.symbol}/day
                  </Div>
                </Div>
              )}
            </Grid>
          )
        }
      }}
      renderControlButtons={
        canUserEdit
          ? ({ destorySelf, itemData: reward }) => (
              <Div icss={cssRow()} className="gap-2 mobile:gap-3">
                <Icon
                  size="smi"
                  heroIconName="pencil"
                  className="clickable clickable-opacity-effect text-primary"
                  onClick={() => {
                    onTryEdit?.(reward, reward.id === activeReward?.id)
                  }}
                />
                <Icon
                  size="smi"
                  heroIconName="trash"
                  className={`clickable text-primary ${rewards.length > 1 ? 'hover:text-[#DA2EEF]' : 'hidden'}`}
                  onClick={() => rewards.length > 1 && destorySelf()} // delete is wrong
                />
              </Div>
            )
          : undefined
      }
      onListChange={(newRewards) => {
        useCreateFarms.setState({
          rewards: editableRewards.concat(newRewards)
        })
      }}
    />
  )
}
