import React, { ReactNode, useEffect, useMemo, useState } from 'react'

import { cssCol, cssRow, Div } from '@edsolater/uikit'
import useAppSettings from '@/application/appSettings/useAppSettings'
import useConnection from '@/application/connection/useConnection'
import txIdoClaim from '@/application/ido/txIdoClaim'
import txIdoPurchase from '@/application/ido/txIdoPurchase'
import { HydratedIdoInfo, TicketInfo } from '@/application/ido/type'
import useAutoFetchIdoInfos from '@/application/ido/useAutoFetchIdoInfos'
import useIdo from '@/application/ido/useIdo'
import { routeTo } from '@/application/routeTools'
import useStaking from '@/application/staking/useStaking'
import useWallet from '@/application/wallet/useWallet'
import AlertText from '@/components/AlertText'
import CoinAvatar from '@/components/CoinAvatar'
import CoinInputBox from '@/components/CoinInputBox'
import { StakingPageStakeLpDialog } from '@/components/dialogs/StakingPageStakeLpDialog'
import Icon, { socialIconSrcMap } from '@/components/Icon'
import IdoCountDownClock from '@/components/IdoCountDownClock'
import LoadingCircle from '@/components/LoadingCircle'
import { Markdown } from '@/components/Markdown'
import PageLayout from '@/components/PageLayout/PageLayout'
import RefreshCircle from '@/components/RefreshCircle'
import { shakeFalsyItem } from '@/functions/arrayMethods'
import { toUTC } from '@/functions/date/dateFormat'
import { isDateBefore } from '@/functions/date/judges'
import formatNumber from '@/functions/format/formatNumber'
import toPercentNumber from '@/functions/format/toPercentNumber'
import toPercentString from '@/functions/format/toPercentString'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import { eq, gt, gte, isMeaningfulNumber, lte } from '@/functions/numberish/compare'
import { mul } from '@/functions/numberish/operations'
import toBN from '@/functions/numberish/toBN'
import { toString } from '@/functions/numberish/toString'
import { recursivelyDo } from '@/functions/recursivelyDo'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { Badge } from '@/tempUikits/Badge'
import Button from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'

import CyberpunkStyleCard from '@/tempUikits/CyberpunkStyleCard'
import { FadeIn } from '@/tempUikits/FadeIn'
import Grid from '@/tempUikits/Grid'
import Link from '@/tempUikits/Link'
import Progress from '@/tempUikits/Progress'
import RowTabs from '@/tempUikits/RowTabs'
import Tooltip from '@/tempUikits/Tooltip'
import { Numberish } from '@/types/constants'
import { useRouter } from 'next/router'
import { twMerge } from 'tailwind-merge'

// paser url to patch idoid
function useUrlParser() {
  const idoHydratedInfos = useIdo((s) => s.idoHydratedInfos)
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  const { query } = useRouter()
  useEffect(() => {
    if (idoInfo) return
    const idoIdFromUrl = query.idoId as string | undefined
    if (idoIdFromUrl) {
      useIdo.setState({ currentIdoId: idoIdFromUrl })
    }
  }, [idoHydratedInfos])
}

function NavButtons({ className }: { className?: string }) {
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  return (
    <Div icss={cssRow()} className={twMerge('items-center justify-between', className)}>
      <Button
        type="text"
        className="text-sm text-primary opacity-50 px-0"
        prefix={<Icon heroIconName="chevron-left" size="sm" />}
        onClick={() => routeTo('/acceleraytor/list')}
      >
        Back to all pools
      </Button>

      <Link
        className={`rounded-none font-medium text-sm text-primary opacity-50 flex gap-1 items-center ${
          idoInfo?.projectDetailLink ? 'opacity-50' : 'opacity-0'
        } transition`}
        href={idoInfo?.projectDetailLink}
      >
        <Icon size="sm" inline heroIconName="information-circle" />
        Read full details
      </Link>
    </Div>
  )
}

function PageGridTemplate({ children }: { children?: ReactNode }) {
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  const isMobile = useAppSettings((s) => s.isMobile)
  const gridTemplate = isMobile
    ? idoInfo?.isClosed
      ? `
          "b" auto
          "c" auto
          "a" auto
          "d" auto
          "e" auto / 1fr`
      : `
          "a" auto
          "b" auto
          "c" auto
          "d" auto
          "e" auto / 1fr`
    : idoInfo?.isUpcoming
    ? `
        "b b" auto
        "c a" auto
        "d a" auto
        "e a" auto / 3fr minmax(350px, 1fr)`
    : ` 
        "b a" auto
        "c a" auto
        "d a" auto
        "e a" auto / 3fr minmax(350px, 1fr)`
  return (
    <Grid className="gap-5" style={{ gridTemplate }}>
      {children}
    </Grid>
  )
}

export default function LotteryDetailPageLayout() {
  useUrlParser()
  useAutoFetchIdoInfos()
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  return (
    <PageLayout metaTitle="AcceleRaytor" mobileBarTitle="AcceleRaytor" contentYPaddingShorter>
      <NavButtons className="mb-8 sticky top-0" />
      {idoInfo ? (
        <Div className="max-w-[1130px] mobile:max-w-[530px] mx-auto">
          <Div className="-z-10 cyberpunk-bg-light-acceleraytor-detail-page top-1/2 left-1/2"></Div>

          <WinningTicketPanel className="mb-5" />

          <PageGridTemplate>
            <LotteryInputPanel className="grid-area-a self-start" />
            <LotteryStateInfoPanel className="grid-area-b" />
            <LotteryLedgerPanel className="grid-area-c" />
            <LotteryProjectInfoPanel className="grid-area-d" />
            <LotteryLicense className="grid-area-e" />
          </PageGridTemplate>
        </Div>
      ) : (
        <LoadingCircle className="mx-auto my-12" />
      )}
    </PageLayout>
  )
}

function TicketItem({
  idoInfo,
  ticket,
  className
}: {
  idoInfo?: HydratedIdoInfo
  ticket?: TicketInfo
  className?: string
}) {
  if (!ticket) return null
  return (
    <Div className={['items-center gap-1', className]} icss={cssRow()}>
      <Div className={`text-xs font-semibold ${ticket.isWinning ? 'text-[#39D0D8]' : 'text-primary'} `}>
        {ticket.no}
      </Div>
      {idoInfo?.isClosed && (
        <Icon
          size="smi"
          className={ticket.isWinning ? 'text-[#39D0D8]' : 'invisible'}
          heroIconName={ticket.isWinning ? 'check-circle' : 'x-circle'}
        />
      )}
    </Div>
  )
}

function WinningTicketPanel({ className }: { className?: string }) {
  const connected = useWallet((s) => s.connected)
  const owner = useWallet((s) => s.owner)
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  const isMobile = useAppSettings((s) => s.isMobile)
  const refreshIdo = useIdo((s) => s.refreshIdo)

  const [, forceUpdate] = useForceUpdate()

  const [isBaseClaimed, setIsBaseClaimed] = useState(false)
  const [isQuoteClaimed, setIsQuoteClaimed] = useState(false)

  useEffect(() => {
    setIsBaseClaimed(false)
    setIsQuoteClaimed(false)
  }, [owner])

  useEffect(() => {
    if (isMeaningfulNumber(idoInfo?.ledger?.baseWithdrawn)) setIsBaseClaimed(true)
    if (isMeaningfulNumber(idoInfo?.ledger?.quoteWithdrawn)) setIsQuoteClaimed(true)
  }, [idoInfo])

  return (
    <FadeIn ignoreEnterTransition /* no need. inside has FadeIn already */>
      {idoInfo?.canWithdrawBase || idoInfo?.isClosed || idoInfo?.depositedTickets?.length ? (
        <Card
          className={twMerge(
            'overflow-hidden rounded-3xl border-1.5 border-[rgba(171,196,255,0.1)] bg-cyberpunk-card-bg',
            className
          )}
          size="lg"
        >
          {idoInfo.isClosed && (
            <Div icss={cssRow()} className="flex-wrap gap-7 justify-between p-8 mobile:p-5">
              <Div icss={cssCol()} className="gap-1">
                {idoInfo.winningTicketsTailNumber ? (
                  <Div className="mobile:text-sm font-semibold text-base text-white">
                    {['1', '2'].includes(String(idoInfo.winningTicketsTailNumber?.isWinning)) ? (
                      <Div>
                        {idoInfo.winningTicketsTailNumber?.tickets
                          .map(({ no, isPartial }) => `${no}${isPartial ? ' (partial)' : ''}`)
                          .join(', ')}
                      </Div>
                    ) : ['3'].includes(String(idoInfo.winningTicketsTailNumber?.isWinning)) ? (
                      <Div>(Every deposited ticket wins)</Div>
                    ) : (
                      <Div className="opacity-50">
                        {idoInfo?.isClosed ? '(Lottery in progress)' : '(Numbers selected when lottery ends)'}
                      </Div>
                    )}
                  </Div>
                ) : (
                  <Div></Div>
                )}
                <Div className="text-xs font-semibold  text-primary opacity-50">
                  {
                    {
                      '0': 'Lucky Ending Numbers',
                      '1': 'All numbers not ending with',
                      '2': 'Lucky Ending Numbers',
                      '3': 'All Tickets Win',
                      undefined: 'Lucky Ending Numbers'
                    }[String(idoInfo.winningTicketsTailNumber?.isWinning)] // TODO: to hydrated info
                  }
                </Div>
              </Div>
              <FadeIn>
                {idoInfo.ledger && idoInfo?.depositedTickets?.length && (
                  <Div icss={cssRow()} className="gap-8 mobile:gap-6 mobile:w-full mobile:grid mobile:grid-cols-2">
                    <Div icss={cssCol()} className="items-center">
                      <Button
                        size={isMobile ? 'sm' : 'md'}
                        className="frosted-glass-teal mobile:w-full"
                        validators={[
                          { should: !isBaseClaimed },
                          {
                            should: connected,
                            fallbackProps: {
                              onClick: () => useAppSettings.setState({ isWalletSelectorShown: true })
                            }
                          },
                          { should: gt(idoInfo.winningTickets?.length, 0) && eq(idoInfo.ledger.baseWithdrawn, 0) },
                          {
                            should: idoInfo.canWithdrawBase,
                            fallbackProps: {
                              children: (
                                <Div icss={cssRow()}>
                                  Claim {idoInfo.base?.symbol ?? 'UNKNOWN'} in{' '}
                                  <IdoCountDownClock
                                    className="ml-1"
                                    singleValueMode
                                    labelClassName="text-base"
                                    endTime={Number(idoInfo.startWithdrawTime)}
                                    onEnd={forceUpdate}
                                  />
                                </Div>
                              )
                            }
                          }
                        ]}
                        onClick={() => {
                          txIdoClaim({
                            idoInfo: idoInfo,
                            side: 'base',
                            onTxSuccess: () => {
                              setIsQuoteClaimed(true)
                              refreshIdo(idoInfo.id)
                            }
                          })
                        }}
                      >
                        {isBaseClaimed
                          ? `${idoInfo.base?.symbol ?? 'UNKNOWN'} Claimed`
                          : `Claim ${idoInfo.base?.symbol ?? 'UNKNOWN'}`}
                      </Button>
                      <FadeIn>
                        {gt(idoInfo.winningTickets?.length, 0) && eq(idoInfo.ledger.baseWithdrawn, 0) && (
                          <Div className="text-xs mt-1 font-semibold text-primary opacity-50">
                            {idoInfo.winningTickets?.length} winning tickets
                          </Div>
                        )}
                      </FadeIn>
                    </Div>

                    <Div icss={cssCol()} className="items-center">
                      <Button
                        size={isMobile ? 'sm' : 'md'}
                        className="frosted-glass-teal mobile:w-full"
                        validators={[
                          { should: !isQuoteClaimed },
                          { should: connected },
                          { should: eq(idoInfo.ledger.quoteWithdrawn, 0) },
                          { should: idoInfo.isClosed },
                          {
                            should: connected,
                            forceActive: true,
                            fallbackProps: {
                              onClick: () => useAppSettings.setState({ isWalletSelectorShown: true })
                            }
                          }
                        ]}
                        onClick={() => {
                          txIdoClaim({
                            idoInfo: idoInfo,
                            side: 'quote',
                            onTxSuccess: () => {
                              setIsQuoteClaimed(true)
                              refreshIdo(idoInfo.id)
                            }
                          })
                        }}
                      >
                        {isQuoteClaimed
                          ? `${idoInfo.quote?.symbol ?? 'UNKNOWN'} Claimed`
                          : `Claim ${idoInfo.quote?.symbol ?? 'UNKNOWN'}`}
                      </Button>
                      <FadeIn>
                        {eq(idoInfo.ledger?.quoteWithdrawn, 0) && (
                          <Div className="text-xs mt-1 font-semibold text-primary opacity-50">
                            {(idoInfo.depositedTickets?.length ?? 0) - (idoInfo.winningTickets?.length ?? 0)}{' '}
                            non-winning tickets
                          </Div>
                        )}
                      </FadeIn>
                    </Div>
                  </Div>
                )}
              </FadeIn>
            </Div>
          )}

          <FadeIn>
            {isMeaningfulNumber(idoInfo.depositedTickets?.length) && (
              <Div icss={cssCol()} className="bg-[#141041] py-5 px-6">
                {!idoInfo.isClosed && (
                  <Div className="text-xl mobile:text-sm font-semibold  text-white">
                    You have deposited successfully
                  </Div>
                )}
                <Div className="text-sm mb-5 font-semibold  text-primary opacity-50">Your ticket numbers</Div>
                <Grid
                  className="gap-board -mx-5"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    clipPath: 'inset(1px 16px)'
                  }}
                >
                  {idoInfo.depositedTickets?.map((ticket) => (
                    <TicketItem idoInfo={idoInfo} key={ticket.no} ticket={ticket} className="px-5 py-3" />
                  ))}
                </Grid>
              </Div>
            )}
          </FadeIn>
        </Card>
      ) : null}
    </FadeIn>
  )
}

function LotteryStateInfoPanel({ className }: { className?: string }) {
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  const stakingHydratedInfo = useStaking((s) => s.stakeDialogInfo)
  const connected = useWallet((s) => s.connected)
  const isMobile = useAppSettings((s) => s.isMobile)
  const getChainDate = useConnection((s) => s.getChainDate)

  if (!idoInfo) return null

  const IdoInfoItem = ({
    fieldName,
    fieldValue,
    className
  }: {
    className?: string
    fieldName?: ReactNode
    fieldValue?: ReactNode
  }) =>
    isMobile ? (
      <Grid className={twMerge('grid-cols-[3fr,4fr] items-center p-3 px-4 gap-3', className)}>
        <Div className="text-xs font-bold text-primary opacity-50">{fieldName}</Div>
        <Div className="text-sm font-semibold text-white">{fieldValue}</Div>
      </Grid>
    ) : (
      <Div className={twMerge('py-3 px-4', className)}>
        <Div>{fieldValue}</Div>
        <Div className="text-primary font-bold text-xs mt-1">{fieldName}</Div>
      </Div>
    )
  return (
    <Card
      className={twMerge(
        `flex ${
          isMobile ? 'flex-col items-stretch' : ''
        } overflow-hidden rounded-3xl mobile:rounded-2xl border-1.5 border-[rgba(171,196,255,0.1)] bg-[#141041]`,
        className
      )}
      size="lg"
    >
      <CyberpunkStyleCard
        className="flex flex-col mobile:flex-row mobile:rounded-2xl mobile:py-4 mobile:px-5 items-center justify-center mobile:justify-start gap-2"
        wrapperClassName="w-[140px] mobile:w-auto mobile:rounded-2xl"
      >
        <CoinAvatar noCoinIconBorder size="lg" token={idoInfo.base} />
        <Div>
          <Div className="text-center mobile:text-left text-base font-semibold text-white">
            {idoInfo.base?.symbol ?? 'UNKNOWN'}
          </Div>
          <Div className="text-center mobile:text-left text-sm text-primary opacity-50">{idoInfo.projectName}</Div>
        </Div>
        <Badge
          size="md"
          className="mobile:ml-auto"
          cssColor={idoInfo.isUpcoming ? '#ABC4FF' : idoInfo.isOpen ? '#39D0D8' : '#DA2EEF'}
        >
          {idoInfo.isUpcoming ? 'upcoming' : idoInfo.isOpen ? 'open' : 'closed'}
        </Badge>
      </CyberpunkStyleCard>

      <Div className={`${isMobile ? '' : 'w-0 grow'} m-4`}>
        <Grid
          className={`${
            isMobile
              ? ''
              : idoInfo.isUpcoming
              ? 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]'
              : 'grid-cols-[repeat(auto-fit,minmax(154px,1fr))]'
          } gap-board`}
        >
          <IdoInfoItem
            fieldName="Total Raise"
            fieldValue={
              <Div icss={cssRow()} className="items-baseline gap-1">
                <Div className="text-white font-medium">{formatNumber(toString(idoInfo.totalRaise))}</Div>
                <Div className="text-[#ABC4FF80] font-medium text-xs">
                  {idoInfo.totalRaise?.token.symbol ?? 'UNKNOWN'}
                </Div>
              </Div>
            }
          />
          <IdoInfoItem
            fieldName={`Allocation / Winning Ticket`}
            fieldValue={
              <Div icss={cssRow()} className="items-baseline gap-1">
                <Div className="text-white font-medium">
                  {formatNumber(toString(idoInfo.ticketPrice), { fractionLength: 'auto' })}
                </Div>
                <Div className="text-[#ABC4FF80] font-medium text-xs">{idoInfo.quote?.symbol ?? 'UNKNOWN'}</Div>
              </Div>
            }
          />
          <IdoInfoItem
            fieldName={`Per ${idoInfo.base?.symbol ?? 'UNKNOWN'}`}
            fieldValue={
              <Div icss={cssRow()} className="items-baseline gap-1">
                <Div className="text-white font-medium">
                  {formatNumber(toString(idoInfo.coinPrice), { fractionLength: 'auto' })}
                </Div>
                <Div className="text-[#ABC4FF80] font-medium text-xs">{idoInfo.quote?.symbol ?? 'UNKNOWN'}</Div>
              </Div>
            }
          />
          <Div>
            <IdoInfoItem
              fieldName="Total tickets deposited"
              fieldValue={
                <Div icss={cssRow()} className="items-baseline gap-1">
                  <Div className="text-white font-medium">{formatNumber(idoInfo.depositedTicketCount)}</Div>
                  <Div className="text-[#ABC4FF80] font-medium text-xs"> / {formatNumber(idoInfo.maxWinLotteries)}</Div>
                  <Tooltip placement="bottom" className="self-center">
                    <Icon size="sm" heroIconName="information-circle" className="text-[#ABC4FF80]" />
                    <Tooltip.Panel>
                      <Div className="max-w-[260px]">
                        <Div className="font-normal text-xs opacity-50">
                          The amount shows the number of winning tickets. A pool can be oversubscribed if more tickets
                          are deposited.
                        </Div>
                      </Div>
                    </Tooltip.Panel>
                  </Tooltip>
                </Div>
              }
            />
            <Progress
              className="-mt-2 px-4"
              slotClassName="h-1"
              labelClassName="text-xs font-bold px-4"
              value={toPercentNumber(idoInfo.filled)}
            />
          </Div>
          <IdoInfoItem
            fieldName="Pool open"
            fieldValue={
              <Div icss={cssRow()} className="items-baseline gap-1">
                {isDateBefore(getChainDate(), idoInfo.startTime) ? (
                  <>
                    <Div className="text-[#ABC4FF80] font-medium text-xs">in</Div>
                    <Div className="text-white font-medium">
                      <IdoCountDownClock endTime={idoInfo.startTime} />
                    </Div>
                  </>
                ) : (
                  <>
                    <Div className="text-white font-medium">{toUTC(idoInfo.startTime, { hideUTCBadge: true })}</Div>
                    <Div className="text-[#ABC4FF80] font-medium text-xs">{'UTC'}</Div>
                  </>
                )}
              </Div>
            }
          />
          <IdoInfoItem
            fieldName="Pool close"
            fieldValue={
              <Div icss={cssRow()} className="items-baseline gap-1">
                {isDateBefore(getChainDate(), idoInfo.endTime) ? (
                  <>
                    <Div className="text-[#ABC4FF80] font-medium text-xs">in</Div>
                    <Div className="text-white font-medium">
                      <IdoCountDownClock endTime={Number(idoInfo.endTime)} />
                    </Div>
                  </>
                ) : (
                  <>
                    <Div className="text-white font-medium">
                      {toUTC(Number(idoInfo.endTime), { hideUTCBadge: true })}
                    </Div>
                    <Div className="text-[#ABC4FF80] font-medium text-xs">{'UTC'}</Div>
                  </>
                )}
              </Div>
            }
          />
          {idoInfo.isUpcoming && (
            <Div
              icss_={isMobile ? cssCol() : cssRow()}
              className="items-center mobile:items-stretch justify-between gap-4 p-3 px-4"
            >
              <IdoInfoItem
                className="p-0"
                fieldValue={
                  <Div icss={cssRow()} className="items-baseline gap-1">
                    <Div className="text-white font-medium">
                      {formatNumber(toString(stakingHydratedInfo?.userStakedLpAmount)) || '--'} RAY
                    </Div>
                  </Div>
                }
                fieldName={
                  <Div icss={cssRow()} className="gap-1 items-center">
                    <Div>Your staking</Div>

                    <Tooltip placement="bottom">
                      <Icon size="sm" heroIconName="information-circle" className="text-[#ABC4FF80]" />
                      <Tooltip.Panel>
                        <Div className="text-sm font-semibold max-w-[160px]">
                          <Div className="text-white pb-1">
                            Your Stake Ray:{' '}
                            {connected
                              ? formatNumber(toString(stakingHydratedInfo?.userStakedLpAmount))
                              : '(not connected)'}
                          </Div>
                          <Div className="font-normal text-xs opacity-50">
                            The more and longer you stake RAY the more tickets you will receive.
                          </Div>
                        </Div>
                      </Tooltip.Panel>
                    </Tooltip>
                  </Div>
                }
              />
              <Div icss={cssCol()}>
                <Button
                  className="frosted-glass-skygray"
                  size="xs"
                  validators={[
                    {
                      should: connected,
                      fallbackProps: {
                        onClick: () => useAppSettings.setState({ isWalletSelectorShown: true })
                      }
                    },
                    {
                      should: isDateBefore(getChainDate(), idoInfo.stakeTimeEnd)
                    }
                  ]}
                  disabled={!isDateBefore(getChainDate(), idoInfo.stakeTimeEnd)}
                  onClick={() => {
                    useStaking.setState({
                      isStakeDialogOpen: true,
                      stakeDialogMode: 'deposit'
                    })
                  }}
                >
                  Stake
                </Button>

                <Div className="text-xs text-center text-primary mt-1">
                  APR: {toPercentString(stakingHydratedInfo?.totalApr7d)}
                </Div>
              </Div>
            </Div>
          )}
          {idoInfo.isUpcoming && (
            <IdoInfoItem
              fieldName="RAY staking deadline"
              fieldValue={
                <Div icss={cssRow()} className="items-baseline gap-1">
                  {isDateBefore(getChainDate(), idoInfo.stakeTimeEnd) ? (
                    <>
                      <Div className="text-[#ABC4FF80] font-medium text-xs">in</Div>
                      <Div className="text-white font-medium">
                        <IdoCountDownClock endTime={idoInfo.stakeTimeEnd} />
                      </Div>
                    </>
                  ) : (
                    <>
                      <Div className="text-white font-medium">
                        {toUTC(idoInfo.stakeTimeEnd, { hideUTCBadge: true })}
                      </Div>
                      <Div className="text-[#ABC4FF80] font-medium text-xs">{'UTC'}</Div>
                    </>
                  )}
                </Div>
              }
            />
          )}
        </Grid>
      </Div>
    </Card>
  )
}

function LotteryLedgerPanel({ className }: { className?: string }) {
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  const connected = useWallet((s) => s.connected)
  const isMobile = useAppSettings((s) => s.isMobile)

  const TopInfoPanelFieldItem = (props: { fieldName: ReactNode; fieldValue: ReactNode }) =>
    isMobile ? (
      <Grid className="grid-cols-[3fr,1fr] items-center p-3 px-4 gap-3">
        <Div className="text-xs font-bold text-primary opacity-50">{props.fieldName}</Div>
        <Div className="text-sm font-semibold text-white">{props.fieldValue}</Div>
      </Grid>
    ) : (
      <Div className="px-6">
        <Div className="text-base font-semibold text-white">{props.fieldValue}</Div>
        <Div className="text-sm text-primary font-bold">{props.fieldName}</Div>
      </Div>
    )

  if (!idoInfo) return null
  return (
    <Card
      className={twMerge(
        'py-5 mobile:py-1 rounded-3xl border-1.5 border-[rgba(171,196,255,0.1)] bg-[#141041]',
        className
      )}
      size="lg"
    >
      <Grid className="grid-cols-4 mobile:grid-cols-1 gap-board">
        <TopInfoPanelFieldItem
          fieldName="Eligible Tickets"
          fieldValue={connected ? `${formatNumber(idoInfo.userEligibleTicketAmount)}` : '--'}
        />
        <TopInfoPanelFieldItem
          fieldName="Deposited Tickets"
          fieldValue={connected ? `${formatNumber(idoInfo.depositedTickets?.length ?? 0)}` : '--'}
        />
        <TopInfoPanelFieldItem
          fieldName="Winning Tickets"
          fieldValue={
            connected ? `${formatNumber(idoInfo.depositedTickets?.filter((i) => i.isWinning)?.length ?? 0)}` : '--'
          }
        />
        <TopInfoPanelFieldItem
          fieldName="Allocation"
          fieldValue={
            <Div icss={cssRow()} className="items-baseline gap-1">
              <Div>{connected ? formatNumber(toString(idoInfo.userAllocation) || 0) : '--'}</Div>
              <Div className="text-sm text-primary opacity-50"> {idoInfo.base?.symbol ?? ''}</Div>
            </Div>
          }
        />
      </Grid>
    </Card>
  )
}

function LotteryProjectInfoPanel({ className }: { className?: string }) {
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  const connected = useWallet((s) => s.connected)
  const stakingHydratedInfo = useStaking((s) => s.stakeDialogInfo)
  const isMobile = useAppSettings((s) => s.isMobile)

  const [currentTab, setCurrentTab] = useState<'Project Details' | 'How to join?'>('Project Details')

  if (!idoInfo) return null

  const renderProjectDetails = (
    <>
      <Markdown className="py-6">{idoInfo.projectDetails ?? ''}</Markdown>
      <Div icss={cssRow()} className="justify-between mobile:gap-board">
        <Div icss_={isMobile ? cssCol() : cssRow()} className="gap-6 mobile:gap-3">
          {Object.entries(idoInfo.projectDocs ?? {}).map(([docName, linkAddress]) => (
            <Link
              key={docName}
              href={linkAddress}
              className="text-primary opacity-50 capitalize mobile:text-xs font-semibold"
            >
              {docName}
            </Link>
          ))}
        </Div>
        <Div icss={cssRow()} className="gap-6 mobile:gap-3">
          {Object.entries(idoInfo.projectSocials ?? {}).map(([socialName, link]) => (
            <Link key={socialName} href={link} className="flex items-center">
              <Icon
                className="frosted-glass-skygray p-2.5 rounded-lg text"
                iconClassName="w-3 h-3 opacity-50"
                iconSrc={socialIconSrcMap[socialName.toLowerCase()]}
              />
            </Link>
          ))}
        </Div>
      </Div>
    </>
  )
  const renderHowToJoin = (
    <Div>
      {/* wrapbox(have scroll bar) */}
      <Div icss={cssRow()}>
        {/* card row */}
        <Div icss={cssRow()} className="overflow-auto gap-6 grow w-0">
          {/* step 1 */}
          <Card
            size="lg"
            className="shrink-0 flex flex-col py-5 px-4 gap-3 bg-[#1B1659] grow w-[206px] cyberpunk-bg-acceleraytor-prject-step-1"
          >
            <Div icss={cssCol()} className="items-center gap-3">
              <StepBadge n={1} />
              <Div className="text-sm text-center text-primary font-semibold">Stake RAY</Div>
            </Div>

            <Div icss={cssCol()} className="grow gap-3">
              <Div className="text-xs text-center text-primary opacity-50">
                Stake and Earn RAY to participate in pools. The more and longer you stake the more lottery tickets
                you'll be eligible to join with.
              </Div>
              <Div icss={cssCol()} className="items-center">
                <Button
                  className="frosted-glass-skygray"
                  size="xs"
                  validators={[
                    {
                      should: connected,
                      forceActive: true,
                      fallbackProps: {
                        onClick: () => useAppSettings.setState({ isWalletSelectorShown: true })
                      }
                    }
                  ]}
                  onClick={() => {
                    useStaking.setState({
                      isStakeDialogOpen: true,
                      stakeDialogMode: 'deposit'
                    })
                  }}
                >
                  Stake
                </Button>

                <Div className="text-xs text-center text-primary opacity-50 mt-1">
                  APR: {toPercentString(stakingHydratedInfo?.totalApr7d)}
                </Div>
              </Div>
            </Div>
          </Card>

          {/* step 2 */}
          <Card
            size="lg"
            className="shrink-0 flex flex-col py-5 px-4 gap-3 bg-[#1B1659] grow w-[206px] cyberpunk-bg-acceleraytor-prject-step-2"
          >
            <Div icss={cssCol()} className="items-center gap-3">
              <StepBadge n={2} />
              <Div className="text-sm text-center text-primary font-semibold">Deposit {idoInfo.quote?.symbol}</Div>
            </Div>

            <Div icss={cssCol()} className="grow gap-3">
              <Div className="text-xs text-center text-primary opacity-50 space-y-3">
                <p>
                  When the pool opens, deposit {idoInfo.quote?.symbol} for each ticket in order for it to be counted in
                  the lottery.
                </p>
                <p>
                  The lottery will be done on-chain, with lottery numbers assigned to tickets in the order that users
                  deposit.
                </p>
              </Div>
            </Div>
          </Card>

          {/* step 3 */}
          <Card
            size="lg"
            className="shrink-0 flex flex-col py-5 px-4 gap-3 bg-[#1B1659] grow w-[206px] cyberpunk-bg-acceleraytor-prject-step-3"
          >
            <Div icss={cssCol()} className="items-center gap-3">
              <StepBadge n={3} />
              <Div className="text-sm text-center text-primary font-semibold">Claim tokens</Div>
            </Div>

            <Div icss={cssCol()} className="grow gap-3">
              <Div className="text-xs text-center text-primary opacity-50 space-y-3">
                <p>
                  If you have winning tickets you can claim your token allocation. You can then stake these tokens to
                  earn yield on them.
                </p>
                <p>For the non-winning tickets you can withdraw your {idoInfo.quote?.symbol}.</p>
              </Div>
            </Div>
          </Card>
        </Div>
      </Div>
      <Link
        className="pt-4 rounded-none flex-grow font-medium text-primary text-xs flex justify-center gap-1 items-center"
        href={idoInfo.projectDetailLink}
      >
        <Icon size="sm" inline heroIconName="information-circle" />
        Read full details on Medium
      </Link>
    </Div>
  )
  return (
    <Card
      className={twMerge('p-6 rounded-3xl border-1.5 border-[rgba(171,196,255,0.1)] bg-[#141041]', className)}
      size="lg"
    >
      <RowTabs
        className="mb-6"
        currentValue={currentTab}
        values={shakeFalsyItem(['Project Details', 'How to join?'] as const)}
        onChange={(tab) => setCurrentTab(tab)}
      />

      {currentTab === 'Project Details' ? renderProjectDetails : renderHowToJoin}
      <StakingPageStakeLpDialog />
    </Card>
  )
}

function LotteryInputPanel({ className }: { className?: string }) {
  const tempJoined = useIdo((s) => s.tempJoined)
  const idoInfo = useIdo((s) => (s.currentIdoId ? s.idoHydratedInfos[s.currentIdoId] : undefined))
  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)
  const { connected, balances, checkWalletHasEnoughBalance, owner } = useWallet()
  const refreshIdo = useIdo((s) => s.refreshIdo)
  const refreshSelf = () => refreshIdo(idoInfo?.id)

  const [ticketAmount, setTicketAmount] = useState<Numberish | undefined>(undefined)
  const quoteTokenAmount =
    idoInfo?.quote &&
    ticketAmount &&
    toTokenAmount(idoInfo.quote, mul(ticketAmount, idoInfo.ticketPrice), { alreadyDecimaled: true })

  const haveEnoughQuoteCoin = useMemo(
    () => Boolean(quoteTokenAmount && checkWalletHasEnoughBalance(quoteTokenAmount)),
    [quoteTokenAmount, checkWalletHasEnoughBalance, balances]
  )

  const clickPurchase = async () => {
    if (!idoInfo || !ticketAmount) return
    try {
      await txIdoPurchase({
        idoInfo,
        ticketAmount: toBN(ticketAmount),
        onTxSuccess: () => {
          useIdo.setState({ tempJoined: true })
          recursivelyDo(
            () => {
              // eslint-disable-next-line no-console
              console.info('refresh idoInfo by txIdoPurchase')
              refreshIdo(idoInfo.id)
              return {
                ticketCount: idoInfo.depositedTickets?.length
              }
            },
            {
              retrySpeed: 'slow',
              stopWhen: ({ ticketCount }) => isMeaningfulNumber(ticketCount)
            }
          )
        }
      })
      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  if (!idoInfo) return null
  const renderPoolUpcoming = (
    <Div icss={cssRow()} className="items-center">
      <Div icss={cssRow()} className="items-center gap-1">
        <span>Pool opens in</span>
        <IdoCountDownClock singleValueMode labelClassName="text-base" endTime={idoInfo.startTime} onEnd={refreshSelf} />
      </Div>
      <Div className="ml-auto">
        <RefreshCircle
          refreshKey="acceleraytor"
          freshFunction={() => {
            refreshIdo(idoInfo.id)
          }}
        />
      </Div>
    </Div>
  )
  const renderPoolOpen = (
    <Div icss={cssRow()} className="items-center">
      {idoInfo.isEligible || idoInfo.isEligible == null || !connected
        ? 'Join Lottery'
        : "You're not eligible to join pool"}
      <Div className="ml-auto">
        <RefreshCircle
          refreshKey="acceleraytor"
          freshFunction={() => {
            refreshIdo(idoInfo.id)
          }}
        />
      </Div>
    </Div>
  )
  const renderPoolClosed = (
    <Div icss={cssRow()} className="items-center">
      Pool Closed
      <Div className="ml-auto"></Div>
    </Div>
  )

  const joined = Boolean(owner && isMeaningfulNumber(idoInfo.ledger?.quoteDeposited))
  const notJoined = !joined
  return (
    <CyberpunkStyleCard
      className="flex flex-col mobile:rounded-2xl p-6 mobile:px-4 space-y-5"
      wrapperClassName={className}
    >
      <Div className="font-semibold text-base text-white">
        {idoInfo.isUpcoming ? renderPoolUpcoming : idoInfo.isOpen ? renderPoolOpen : renderPoolClosed}
      </Div>
      <FadeIn>
        {connected && (idoInfo.isUpcoming || (idoInfo.isOpen && idoInfo.isEligible != null)) && (
          <AlertText
            className="p-3 bg-[rgba(171,196,255,0.1)] rounded-xl text-[#ABC4FF80] text-xs font-semibold"
            iconSize="sm"
          >
            {idoInfo.isUpcoming ? (
              'Eligible tickets will be visible a couple of hourse before the pool opens.'
            ) : idoInfo.isEligible ? (
              `Once deposited ${
                idoInfo.quote?.symbol ?? '--'
              } can be claimed after lottery ends and tokens after ${toUTC(idoInfo.startWithdrawTime)}.`
            ) : (
              <Div>
                <Link className="text-primary" href="https://twitter.com/RaydiumProtocol">
                  Follow us on Twitter
                </Link>{' '}
                or{' '}
                <Link className="text-primary" href="https://discord.gg/raydium">
                  join our Discord
                </Link>
                to get notified when we lunch our next pool.
              </Div>
            )}
          </AlertText>
        )}
      </FadeIn>
      <Div className={`space-y-3 ${tempJoined || !notJoined || idoInfo.isClosed ? 'not-clickable' : ''}`}>
        <CoinInputBox
          className="px-4"
          topLeftLabel="Tickets"
          topRightLabel={`Eligible tickets: ${toString(idoInfo.userEligibleTicketAmount ?? 0)}`}
          maxValue={idoInfo.userEligibleTicketAmount}
          hideTokenPart
          hidePricePredictor
          onUserInput={(input) => setTicketAmount(input)}
        />
        <CoinInputBox
          className="px-4"
          topLeftLabel="Deposit"
          token={idoInfo.quote}
          value={toString(quoteTokenAmount)}
          disabled
          noDisableStyle
          haveCoinIcon
          hideMaxButton
        />
      </Div>
      <Button
        className="block w-full frosted-glass-teal"
        isLoading={isApprovePanelShown}
        validators={[
          {
            should: !idoInfo?.isClosed,
            fallbackProps: { children: 'Pool Closed' }
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
            should: idoInfo?.isEligible,
            fallbackProps: { children: idoInfo?.isEligible == null ? 'Data Loading' : 'Not eligible' }
          },
          {
            should: !idoInfo?.isUpcoming,
            fallbackProps: { children: 'Upcoming Pool' }
          },
          {
            should: notJoined,
            fallbackProps: { children: 'Deposited' }
          },
          {
            should: (idoInfo.depositedTickets?.length ?? 0) === 0,
            fallbackProps: { children: 'You have already deposited' }
          },
          {
            should: gt(ticketAmount, 0),
            fallbackProps: { children: 'Enter ticket amount' }
          },
          {
            should: isMeaningfulNumber(idoInfo.userEligibleTicketAmount),
            fallbackProps: { children: 'No eligible tickets' }
          },
          {
            should: ticketAmount && idoInfo.state && gte(ticketAmount, idoInfo.state.perUserMinLotteries),
            fallbackProps: { children: `Min. tickets amount is ${idoInfo.state?.perUserMinLotteries}` }
          },
          {
            should: ticketAmount && idoInfo.state && lte(ticketAmount, idoInfo.state.perUserMaxLotteries),
            fallbackProps: { children: `Max. tickets amount is ${idoInfo.userEligibleTicketAmount}` }
          },
          {
            should: ticketAmount && lte(ticketAmount, idoInfo.userEligibleTicketAmount),
            fallbackProps: { children: `Not enough eligible tickets` }
          },
          {
            should: haveEnoughQuoteCoin,
            fallbackProps: { children: `Not enough ${idoInfo.quote?.symbol ?? ''}` }
          }
        ]}
        onClick={clickPurchase}
      >
        Join Lottery
      </Button>
      <Link
        href={idoInfo.projectDetailLink}
        className="text-xs text-center text-primary opacity-50 font-semibold pt-3 border-t border-[rgba(171,196,255,0.1)]"
      >
        When can I withdraw?
      </Link>
    </CyberpunkStyleCard>
  )
}

function LotteryLicense({ className }: { className?: string }) {
  return (
    <Div
      className={twMerge(
        'text-2xs text-[#ABC4FF80] leading-relaxed pt-5 font-medium text-justify border-t border-[rgba(171,196,255,0.1)] mobile:p-4',
        className
      )}
    >
      People located in or residents of the United States, North Korea, Iran, Venezuela, any sanctioned countries as
      provided by OFAC, or any other jurisdiction in which it is prohibited from using any of the services offered on
      the Raydium website, including AcceleRaytor, (the "Prohibited Jurisdictions") are not permitted to make use of
      these services or participate in this token sale. For the avoidance of doubt, the foregoing restrictions on any of
      the services offered on the Raydium website from Prohibited Jurisdictions apply equally to residents and citizens
      of other nations while located in a Prohibited Jurisdiction.
    </Div>
  )
}

function StepBadge(props: { n: number }) {
  return (
    <CyberpunkStyleCard wrapperClassName="w-8 h-8" className="grid place-content-center bg-[#2f2c78]">
      <Div className="font-semibold text-white">{props.n}</Div>
    </CyberpunkStyleCard>
  )
}
