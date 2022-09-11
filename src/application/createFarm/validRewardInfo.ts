import { isDateAfter } from '@/functions/date/judges'
import { getDuration } from '@/functions/date/parseDuration'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { gte, isMeaningfulNumber, lt, lte } from '@/functions/numberish/compare'
import { add, div } from '@/functions/numberish/operations'
import useConnection from '../connection/useConnection'
import { MAX_DURATION, MIN_DURATION } from '../farms/utils/handleFarmInfo'
import { RAYMint } from '../token'
import useWallet from '../wallet/useWallet'
import { UIRewardInfo } from './type'
import useCreateFarms from './useCreateFarm'

export function valid300Ray(): { valid: boolean; reason?: string } {
  const { getBalance, owner } = useWallet.getState()
  if (!owner) return { valid: false, reason: 'wallet not connected' }

  const { rewards } = useCreateFarms.getState()
  const rewardRayAmount = rewards.find((r) => isMintEqual(r.token?.mint, RAYMint))?.amount
  const haveOver300Ray = gte(getBalance(RAYMint) ?? 0, add(300, rewardRayAmount ?? 0)) /** Test */
  if (!haveOver300Ray) return { valid: false, reason: 'User must have 300 RAY' }
  return { valid: true }
}

export function validUiRewardInfo(rewards: UIRewardInfo[]): { valid: boolean; reason?: string } {
  const { getBalance, owner } = useWallet.getState()
  if (!owner) return { valid: false, reason: 'wallet not connected' }

  const { chainTimeOffset = 0 } = useConnection.getState()
  const chainDate = new Date(Date.now() + chainTimeOffset)
  for (const reward of rewards) {
    // check user has select a token
    if (!reward.token) return { valid: false, reason: 'Confirm reward token' }

    // check user has set amount
    if (!isMeaningfulNumber(reward.amount))
      return { valid: false, reason: `Enter ${reward.token.symbol ?? '--'} token amount` }

    // check user have enough balance
    const haveBalance = gte(getBalance(reward.token), reward.amount)
    if (!haveBalance) return { valid: false, reason: `Insufficient ${reward.token.symbol} balance` }

    // check if startTime and endTime is setted
    if (!reward.startTime || !reward.endTime) return { valid: false, reason: 'Confirm emission time setup' }

    const minBoundary = div(getDuration(reward.endTime, reward.startTime) / 1000, 10 ** reward.token.decimals)
    if (lt(reward.amount, minBoundary)) return { valid: false, reason: `Emission rewards is lower than min required` }

    // check starttime is valid
    if (!isDateAfter(reward.startTime, chainDate)) return { valid: false, reason: 'Insufficient start time' }

    // check duration
    const duration = getDuration(reward.endTime, reward.startTime)
    if (!gte(duration, MIN_DURATION) && lte(duration, MAX_DURATION))
      return { valid: false, reason: 'Insufficient duration' }
  }
  return { valid: true }
}
