import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'

import useAppSettings from '@/application/appSettings/useAppSettings'
import txFarmHarvest from '@/application/farms/tx/txFarmHarvest'
import { HydratedFarmInfo } from '@/application/farms/type'
import useStaking from '@/application/staking/useStaking'
import { tokenAtom } from '@/application/token'
import useWallet from '@/application/wallet/useWallet'
import CoinAvatar from '@/components/CoinAvatar'
import Icon from '@/components/Icon'
import LoadingCircle from '@/components/LoadingCircle'
import PageLayout from '@/components/PageLayout/PageLayout'
import RefreshCircle from '@/components/RefreshCircle'
import formatNumber from '@/functions/format/formatNumber'
import toPercentString from '@/functions/format/toPercentString'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import toTotalPrice from '@/functions/format/toTotalPrice'
import toUsdVolume from '@/functions/format/toUsdVolume'
import { gt, isMeaningfulNumber } from '@/functions/numberish/compare'
import { add } from '@/functions/numberish/operations'
import { toString } from '@/functions/numberish/toString'
import Button from '@/tempUikits/Button'
import { cssCol, cssRow, Div } from '@edsolater/uikit'
import { Fraction, TokenAmount, ZERO } from '@raydium-io/raydium-sdk'
import { twMerge } from 'tailwind-merge'

import { farmAtom } from '@/application/farms/atom'
import Collapse from '@/tempUikits/Collapse'
import CyberpunkStyleCard from '@/tempUikits/CyberpunkStyleCard'
import Grid from '@/tempUikits/Grid'
import { useXStore } from '@edsolater/xstore'
import { StakingPageStakeLpDialog } from '../components/dialogs/StakingPageStakeLpDialog'

export default function StakingPage() {
  return (
    <PageLayout mobileBarTitle="Staking" metaTitle="Staking - Raydium" contentButtonPaddingShorter>
      <StakingHeader />
      <StakingCard />
    </PageLayout>
  )
}

function StakingHeader() {
  const { refreshFarmInfos } = useXStore(farmAtom)
  return (
    <Grid className="grid-cols-[1fr,1fr] items-center gap-y-8 pb-4 pt-2">
      <Div className="title text-2xl mobile:text-lg font-semibold justify-self-start text-white">Staking</Div>
      <Div className="justify-self-end">
        <RefreshCircle
          refreshKey="staking"
          popPlacement="left"
          className="justify-self-end"
          freshFunction={refreshFarmInfos}
        />
      </Div>
    </Grid>
  )
}

function StakingCard() {
  const { hydratedInfos } = useXStore(farmAtom)
  const infos = useMemo(() => hydratedInfos.filter((i) => i.isStakePool), [hydratedInfos])
  if (!infos.length)
    return (
      <Div icss={cssRow()} className="text-center justify-center text-2xl p-12 opacity-50 text-[rgb(171,196,255)]">
        <LoadingCircle />
      </Div>
    )
  return (
    <CyberpunkStyleCard>
      <Div className="grid gap-3 text-primary">
        {infos.map((info) => (
          <Div key={String(info.id)}>
            <Collapse>
              <Collapse.Face>{(open) => <StakingCardCollapseItemFace open={open} info={info} />}</Collapse.Face>
              <Collapse.Body>
                <StakingCardCollapseItemContent hydratedInfo={info} />
              </Collapse.Body>
            </Collapse>
          </Div>
        ))}
        <StakingPageStakeLpDialog />
      </Div>
    </CyberpunkStyleCard>
  )
}

function StakingCardCollapseItemFace({ open, info }: { open: boolean; info: HydratedFarmInfo }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const pcCotent = (
    <Div
      className={`grid grid-flow-col py-5 px-8 mobile:py-4 mobile:px-5 gap-2 items-stretch grid-cols-[1.5fr,1fr,1fr,1fr,1fr,auto] mobile:grid-cols-[1fr,1fr,1fr,auto] rounded-t-3xl mobile:rounded-t-lg ${
        open ? '' : 'rounded-b-3xl mobile:rounded-b-lg'
      }`}
    >
      <CoinAvatarInfoItem info={info} />

      <TextInfoItem
        name="Pending Rewards"
        value={
          <Div>
            {info.rewards.map(
              ({ token, userPendingReward, userHavedReward }, idx) =>
                userHavedReward && (
                  <Div key={idx}>
                    {toString(userPendingReward ?? 0)} {token?.symbol}
                  </Div>
                )
            )}
          </Div>
        }
      />
      <TextInfoItem
        name="Staked"
        value={
          info.base && info.ledger
            ? `${toString(toTokenAmount(info.base, info.ledger.deposited))} ${info.base?.symbol ?? ''}`
            : `0 ${info.base?.symbol ?? ''}`
        }
      />

      <TextInfoItem name="APR" value={info.totalApr7d ? toPercentString(info.totalApr7d) : '0%'} />

      <TextInfoItem
        name="Total Staked"
        value={info.tvl ? `~${toUsdVolume(info.tvl, { decimalPlace: 0 })}` : '--'}
        subValue={
          info.stakedLpAmount &&
          `${formatNumber(toString(info.stakedLpAmount, { decimalLength: 0 }))} ${info.base?.symbol ?? ''}`
        }
      />

      <Grid className="w-9 h-9 place-items-center self-center">
        <Icon size="sm" className="justify-self-end mr-1.5" heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
      </Grid>
    </Div>
  )

  const mobileContent = (
    <Collapse open={open}>
      <Collapse.Face>
        <Div
          className={`grid grid-flow-col py-4 px-5 items-center gap-2 grid-cols-[1fr,1fr,1fr,auto] mobile:rounded-t-lg ${
            open ? '' : 'rounded-b-3xl mobile:rounded-b-lg'
          }`}
        >
          <CoinAvatarInfoItem info={info} />

          <TextInfoItem
            name="Pending Rewards"
            value={
              <Div>
                {info.rewards.map(
                  ({ token, userPendingReward, userHavedReward }, idx) =>
                    userHavedReward && (
                      <Div key={idx}>
                        {toString(userPendingReward ?? 0)} {token?.symbol ?? ''}
                      </Div>
                    )
                )}
              </Div>
            }
          />

          {/* {console.log(info)} */}
          <TextInfoItem name="APR" value={info.totalApr7d ? toPercentString(info.totalApr7d) : '--'} />

          <Grid className="w-6 h-6 place-items-center">
            <Icon size="sm" heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
          </Grid>
        </Div>
      </Collapse.Face>

      <Collapse.Body>
        <Div className="grid grid-flow-col py-4 px-5 relative items-stretch gap-2 grid-cols-[1fr,1fr,1fr,auto]">
          <Div className="absolute top-0 left-5 right-5 border-[rgba(171,196,255,.2)] border-t-1.5"></Div>

          <TextInfoItem
            name="Staked"
            value={info.base && info.ledger ? toString(toTokenAmount(info.base, info.ledger.deposited)) : '--'}
          />

          <TextInfoItem
            name="Total Staked"
            value={info.tvl ? `≈${toUsdVolume(info.tvl, { autoSuffix: true })}` : '--'}
            subValue={info.stakedLpAmount && `${formatNumber(toString(info.stakedLpAmount, { decimalLength: 0 }))} RAY`}
          />
          <Div></Div>

          <Grid className="w-6 h-6 place-items-center"></Grid>
        </Div>
      </Collapse.Body>
    </Collapse>
  )

  return isMobile ? mobileContent : pcCotent
}

function StakingCardCollapseItemContent({ hydratedInfo }: { hydratedInfo: HydratedFarmInfo }) {
  const { tokenPrices: prices } = useXStore(tokenAtom)
  const isMobile = useAppSettings((s) => s.isMobile)
  const lightBoardClass = 'bg-[rgba(20,16,65,.2)]'
  const { push } = useRouter()
  const connected = useWallet((s) => s.connected)
  const hasPendingReward = useMemo(
    () =>
      gt(
        hydratedInfo.rewards.reduce((acc, reward) => add(acc, reward.userPendingReward ?? ZERO), new Fraction(ZERO)),
        ZERO
      ),
    [hydratedInfo]
  )
  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)
  return (
    <Div
      icss_={isMobile ? cssCol() : cssRow()}
      className={`gap-8 mobile:gap-3 flex-grow px-8 py-5 mobile:px-4 mobile:py-3 bg-gradient-to-br from-[rgba(171,196,255,0.12)] to-[rgba(171,196,255,0.06)]  rounded-b-3xl mobile:rounded-b-lg`}
    >
      <Div
        icss={cssRow()}
        className="p-6 mobile:py-3 mobile:px-4 flex-grow ring-inset ring-1.5 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-3xl mobile:rounded-xl items-center gap-3"
      >
        <Div className="flex-grow">
          <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mb-1">Deposited</Div>
          <Div className="text-white font-medium text-base mobile:text-xs">
            {formatNumber(toString(hydratedInfo.userStakedLpAmount ?? 0), {
              fractionLength: hydratedInfo.userStakedLpAmount?.token.decimals
            })}{' '}
            RAY
          </Div>
          <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-xs">
            {prices[String(hydratedInfo.lpMint)] && hydratedInfo.userStakedLpAmount
              ? toUsdVolume(toTotalPrice(hydratedInfo.userStakedLpAmount, prices[String(hydratedInfo.lpMint)]))
              : '--'}
          </Div>
        </Div>
        <Div icss={cssRow()} className="gap-3">
          {hydratedInfo.userHasStaked ? (
            <>
              <Button
                className="frosted-glass-teal mobile:px-6 mobile:py-2 mobile:text-xs"
                onClick={() => {
                  if (connected) {
                    useStaking.setState({
                      isStakeDialogOpen: true,
                      stakeDialogMode: 'deposit'
                    })
                  } else {
                    useAppSettings.setState({ isWalletSelectorShown: true })
                  }
                }}
              >
                Stake
              </Button>
              <Icon
                size={isMobile ? 'sm' : 'smi'}
                heroIconName="minus"
                className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1.5 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
                onClick={() => {
                  if (connected) {
                    useStaking.setState({
                      isStakeDialogOpen: true,
                      stakeDialogMode: 'withdraw'
                    })
                  } else {
                    useAppSettings.setState({ isWalletSelectorShown: true })
                  }
                }}
              />
            </>
          ) : (
            <Button
              className="frosted-glass-teal mobile:py-2 mobile:text-xs"
              onClick={() => {
                if (connected) {
                  useStaking.setState({
                    isStakeDialogOpen: true,
                    stakeDialogMode: 'deposit'
                  })
                } else {
                  useAppSettings.setState({ isWalletSelectorShown: true })
                }
              }}
            >
              {connected ? 'Start Staking' : 'Connect Wallet'}
            </Button>
          )}
        </Div>
      </Div>

      <Div
        icss_={isMobile ? cssCol() : cssRow()}
        className={twMerge(
          'p-6 mobile:py-3 mobile:px-4 flex-grow ring-inset ring-1.5 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-3xl mobile:rounded-xl items-center gap-3'
        )}
      >
        <Div icss={cssRow()} className="flex-grow divide-x-1.5 w-full">
          {hydratedInfo.rewards?.map(
            (reward, idx) =>
              reward.userHavedReward && (
                <Div
                  key={idx}
                  className={`px-4 ${idx === 0 ? 'pl-0' : ''} ${
                    idx === hydratedInfo.rewards.length - 1 ? 'pr-0' : ''
                  } border-[rgba(171,196,255,.5)]`}
                >
                  <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mb-1">
                    Pending rewards
                  </Div>
                  <Div className="text-white font-medium text-base mobile:text-xs">
                    {toString(reward.userPendingReward ?? 0)} {reward.token?.symbol}
                  </Div>
                  <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">
                    {prices?.[String(reward.token?.mint)] && reward?.userPendingReward
                      ? toUsdVolume(toTotalPrice(reward.userPendingReward, prices[String(reward.token?.mint)]))
                      : '--'}
                  </Div>
                </Div>
              )
          )}
        </Div>
        <Button
          // disable={Number(info.pendingReward?.numerator) <= 0}
          className="frosted-glass frosted-glass-teal rounded-xl mobile:w-full mobile:py-2 mobile:text-xs whitespace-nowrap"
          isLoading={isApprovePanelShown}
          onClick={() => {
            txFarmHarvest(hydratedInfo, {
              isStaking: true,
              rewardAmounts: hydratedInfo.rewards
                .map(({ userPendingReward }) => userPendingReward)
                .filter(isMeaningfulNumber) as TokenAmount[]
            })
          }}
          validators={[
            {
              should: connected,
              forceActive: true,
              fallbackProps: {
                onClick: () => useAppSettings.setState({ isWalletSelectorShown: true }),
                children: 'Connect Wallet'
              }
            },
            { should: hasPendingReward }
          ]}
        >
          Harvest
        </Button>
      </Div>
    </Div>
  )
}

function CoinAvatarInfoItem({ info }: { info: HydratedFarmInfo }) {
  const { base, name } = info
  const isMobile = useAppSettings((s) => s.isMobile)
  return (
    <Div
      icss_={isMobile ? cssCol() : cssRow()}
      className="clickable flex-wrap items-center mobile:items-start"
      // onClick={() => {
      //   push(`/liquidity/?coin1=${base?.mint}&coin2=${quote?.mint}`)
      // }}
    >
      <CoinAvatar size={isMobile ? 'sm' : 'md'} token={base} className="justify-self-center mr-2" />
      <Div className="mobile:text-xs font-medium mobile:mt-px mr-1.5">{name}</Div>
    </Div>
  )
}

function TextInfoItem({
  name,
  value,
  subValue,
  className
}: {
  name: string
  value?: ReactNode
  subValue?: ReactNode
  className?: string
}) {
  return (
    <Div icss={cssCol()} className={twMerge('w-max', className)}>
      <Div className="mb-1 text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">{name}</Div>
      <Div icss={cssCol()} className="flex-grow justify-center">
        <Div className="text-base mobile:text-xs">{value || '--'}</Div>
        {subValue && <Div className="text-sm mobile:text-2xs text-[rgba(171,196,255,0.5)]">{subValue}</Div>}
      </Div>
    </Div>
  )
}
