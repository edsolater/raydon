import useAppSettings from '@/application/appSettings/useAppSettings'
import useCreateFarms from '@/application/createFarm/useCreateFarm'
import { isHydratedFarmInfo, isJsonFarmInfo } from '@/application/farms/judgeFarmInfo'
import txFarmDeposit from '@/application/farms/txFarmDeposit'
import txFarmHarvest from '@/application/farms/txFarmHarvest'
import txFarmWithdraw from '@/application/farms/txFarmWithdraw'
import { FarmPoolJsonInfo, HydratedFarmInfo, HydratedRewardInfo } from '@/application/farms/type'
import useFarmResetSelfCreatedByOwner from '@/application/farms/useFarmResetSelfCreatedByOwner'
import useFarms, { useFarmFavoriteIds } from '@/application/farms/useFarms'
import { useFarmUrlParser } from '@/application/farms/useFarmUrlParser'
import useNotification from '@/application/notification/useNotification'
import { usePools } from '@/application/pools/usePools'
import { routeTo } from '@/application/routeTools'
import { RAYMint, tokenAtom } from '@/application/token'
import useWallet from '@/application/wallet/useWallet'
import { AddressItem } from '@/components/AddressItem'
import CoinAvatar from '@/components/CoinAvatar'
import CoinAvatarPair from '@/components/CoinAvatarPair'
import CoinInputBox, { CoinInputBoxHandle } from '@/components/CoinInputBox'
import Icon from '@/components/Icon'
import LoadingCircle from '@/components/LoadingCircle'
import PageLayout from '@/components/PageLayout/PageLayout'
import RefreshCircle from '@/components/RefreshCircle'
import { addItem, removeItem, shakeFalsyItem } from '@/functions/arrayMethods'
import { toUTC } from '@/functions/date/dateFormat'
import copyToClipboard from '@/functions/dom/copyToClipboard'
import formatNumber from '@/functions/format/formatNumber'
import listToMap from '@/functions/format/listToMap'
import toPubString from '@/functions/format/toMintString'
import toPercentString from '@/functions/format/toPercentString'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import toTotalPrice from '@/functions/format/toTotalPrice'
import toUsdVolume from '@/functions/format/toUsdVolume'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { isTokenAmount } from '@/functions/judgers/dateType'
import { gt, gte, isMeaningfulNumber } from '@/functions/numberish/compare'
import { toString } from '@/functions/numberish/toString'
import { searchItems } from '@/functions/searchItems'
import useSort, { UseSortControls } from '@/hooks/useSort'
import { appColors } from '@/styles/colors'
import { Badge } from '@/tempUikits/Badge'
import Button, { ButtonHandle } from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'
import Grid from '@/tempUikits/Grid'
import Input from '@/tempUikits/Input'
import Link from '@/tempUikits/Link'
import ListFast from '@/tempUikits/ListFast'
import Popover from '@/tempUikits/Popover'
import ResponsiveDialogDrawer from '@/tempUikits/ResponsiveDialogDrawer'
import RowTabs from '@/tempUikits/RowTabs'
import Select from '@/tempUikits/Select'
import Switcher from '@/tempUikits/Switcher'
import Tooltip, { TooltipHandle } from '@/tempUikits/Tooltip'
import { cssCol, cssRow, Div, DivProps, SplitView } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import { TokenAmount } from '@raydium-io/raydium-sdk'
import { Fragment, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export default function FarmPage() {
  useFarmUrlParser()
  useFarmResetSelfCreatedByOwner()

  const hydratedInfos = useFarms((s) => s.hydratedInfos)
  const farmIds = useFarms((s) => s.detailedId) ?? []
  /** for calculate detailInfos */
  const tempHydratedInfoMap = listToMap(hydratedInfos, (i) => toPubString(i.id))
  const detailInfos = farmIds.map((farmId) => tempHydratedInfoMap[farmId])
  const currentInfo = detailInfos.at(0)

  return (
    <PageLayout
      mobileBarTitle="Farms"
      contentButtonPaddingShorter
      metaTitle="Farms - Raydium"
      propsForTopNavbar={{
        renderSlot1: <FarmTitle />
      }}
    >
      <SplitView>
        <FarmTableList icss={{ padding: 8 }} tag={SplitView.tag.flexiable} />
        {currentInfo && <FarmDetailPanel icss={{ padding: 8 }} />}
      </SplitView>
    </PageLayout>
  )
}

function FarmTitle() {
  const currentTab = useFarms((s) => s.currentTab)
  const farmCardTitleInfo =
    currentTab === 'Ecosystem'
      ? {
          title: 'Ecosystem Farms',
          description: 'Stake and earn Solana Ecosystem token rewards',
          tooltip:
            'Ecosystem Farms allow any project or user to create a farm in a decentralized manner to incentivize liquidity providers. Rewards are locked for the duration on the farm. However, creator liquidity is not locked.'
        }
      : currentTab === 'Fusion'
      ? { title: 'Fusion Farms', description: 'Stake LP tokens and earn project token rewards' }
      : currentTab === 'Staked'
      ? { title: 'Your Staked Farms', description: 'You are currently staked in these farms' }
      : { title: 'Raydium Farms', description: 'Stake LP tokens and earn token rewards' }
  return (
    <Div>
      <Div icss={cssRow()} className="items-center">
        <Div className="font-medium text-white text-lg" icss={{ letterSpacing: 1 }}>
          {farmCardTitleInfo.title}
        </Div>
        {farmCardTitleInfo.tooltip && (
          <Tooltip placement="bottom">
            <Icon className="ml-1 text-secondary" size="sm" heroIconName="question-mark-circle" />
            <Tooltip.Panel className="max-w-[300px]">{farmCardTitleInfo.tooltip}</Tooltip.Panel>
          </Tooltip>
        )}
      </Div>
      <Div className="font-medium text-[rgba(196,214,255,.5)] text-sm ">{farmCardTitleInfo.description}</Div>
    </Div>
  )
}

function FarmAdditionalRouteTools() {
  return <FarmCreateFarmEntryBlock />
}

function FarmCardControllers() {
  return (
    <Div icss={cssCol()}>
      <Grid className="grid-cols-3 justify-between items-center pb-8 pt-0">
        {/* <FarmTitle></FarmTitle> */}
        {/* <FarmTabBlock /> */}
        {/* <AdditionalFarmRouteTools></AdditionalFarmRouteTools> */}
      </Grid>
    </Div>
  )
}

/** only mobile */
function ToolsButton({ className }: { className?: string }) {
  return (
    <>
      <Popover placement="bottom-right">
        <Popover.Button>
          <Div className={twMerge('mx-1 rounded-full p-2 text-primary clickable justify-self-start', className)}>
            <Icon className="w-4 h-4" iconClassName="w-4 h-4" heroIconName="dots-vertical" />
          </Div>
        </Popover.Button>
        <Popover.Panel>
          <Div>
            <Card
              className="flex flex-col py-3 px-4  max-h-[80vh] border-1.5 border-[rgba(171,196,255,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card"
              size="lg"
            >
              <Grid className="grid-cols-1 items-center gap-2">
                <FarmStakedOnlyBlock />
                <FarmRefreshCircleBlock />
                <FarmTimeBasisSelectorBox />
                <FarmCreateFarmEntryBlock />
              </Grid>
            </Card>
          </Div>
        </Popover.Panel>
      </Popover>
    </>
  )
}

function FarmSearchBlock({ className }: { className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const storeSearchText = useFarms((s) => s.searchText)

  const tooltipComponentRef = useRef<TooltipHandle>(null)
  const [haveInitSearchText, setHaveInitSearchText] = useState(false)
  const haveInited = useRef(false)
  useEffect(() => {
    if (haveInited.current) return
    setTimeout(() => {
      // poopup immediately is strange
      haveInited.current = true
      if (storeSearchText) {
        setHaveInitSearchText(true)
        tooltipComponentRef.current?.open()
      }
    }, 600)
  }, [storeSearchText])
  return (
    <Input
      value={storeSearchText}
      className={twMerge(
        'px-2 py-2 mobile:py-1 gap-2 ring-inset ring-1 ring-[rgba(196,214,255,0.5)] rounded-lg mobile:rounded-lg min-w-[6em]',
        className
      )}
      inputClassName="font-medium text-sm mobile:text-xs text-[rgba(196,214,255,0.5)] placeholder-[rgba(196,214,255,0.5)]"
      prefix={<Icon heroIconName="search" size={isMobile ? 'sm' : 'smi'} className="text-[rgba(196,214,255,0.5)]" />}
      suffix={
        <Tooltip disable={!haveInitSearchText} componentRef={tooltipComponentRef}>
          {/* TODO: Tooltip should accept 5 minutes */}
          <Icon
            heroIconName="x"
            size={isMobile ? 'xs' : 'sm'}
            className={`text-[rgba(196,214,255,0.5)] transition clickable ${
              storeSearchText ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => {
              useFarms.setState({ searchText: '' })
            }}
          />
          <Tooltip.Panel>Click here to view all farm pools</Tooltip.Panel>
        </Tooltip>
      }
      placeholder="Search All"
      onUserInput={(searchText) => {
        useFarms.setState({ searchText })
      }}
    />
  )
}

function FarmStakedOnlyBlock({ className }: { className?: string }) {
  const onlySelfFarms = useFarms((s) => s.onlySelfFarms)
  const connected = useWallet((s) => s.connected)
  const currentTab = useFarms((s) => s.currentTab)
  if (!connected) return null
  if (currentTab === 'Staked') return null // no staked switcher if it is staked
  return (
    <Div icss={cssRow()} className="justify-self-end  mobile:justify-self-auto items-center">
      <span className="text-[rgba(196,214,255,0.5)] whitespace-nowrap font-medium text-sm mobile:text-xs">
        Show Staked
      </span>
      <Switcher
        className="ml-2 "
        defaultChecked={onlySelfFarms}
        onToggle={(isOnly) => useFarms.setState({ onlySelfFarms: isOnly })}
      />
    </Div>
  )
}

function FarmSlefCreatedOnlyBlock({ className }: { className?: string }) {
  const onlySelfCreatedFarms = useFarms((s) => s.onlySelfCreatedFarms)
  return (
    <Div icss={cssRow()} className="justify-self-end  mobile:justify-self-auto items-center">
      <span className="text-[rgba(196,214,255,0.5)] whitespace-nowrap font-medium text-sm mobile:text-xs">
        Show Created
      </span>
      <Switcher
        className="ml-2 "
        defaultChecked={onlySelfCreatedFarms}
        onToggle={(isOnly) => useFarms.setState({ onlySelfCreatedFarms: isOnly })}
      />
    </Div>
  )
}

function FarmCreateFarmEntryBlock({ className }: { className?: string }) {
  const owner = useWallet((s) => s.owner)
  const balances = useWallet((s) => s.balances)
  const userRayBalance = balances[toPubString(RAYMint)]
  const haveOver300Ray = gte(userRayBalance ?? 0, 300)
  const isMobile = useAppSettings((s) => s.isMobile)
  return (
    <Div
      icss={cssRow()}
      className={twMerge(
        `justify-self-end mobile:justify-self-auto gap-1 flex-wrap items-center opacity-100 pointer-events-auto clickable transition`,
        className
      )}
      onClick={() => {
        routeTo('/farms/create')
      }}
    >
      <Icon heroIconName="plus-circle" className="text-primary" size="sm" />
      <span className="text-primary font-medium text-sm mobile:text-xs">Create Farm</span>
    </Div>
  )
}

function FarmTabBlock({ className }: { className?: string }) {
  const currentTab = useFarms((s) => s.currentTab)
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    <RowTabs
      // showOffset={2} // TODO: temp for mobile
      currentValue={currentTab}
      urlSearchQueryKey="tab"
      values={shakeFalsyItem(['Raydium', 'Fusion', 'Ecosystem', 'Staked'] as const)}
      onChange={(tab) => useFarms.setState({ currentTab: tab })}
      className={className}
    />
  ) : (
    <RowTabs
      currentValue={currentTab}
      urlSearchQueryKey="tab"
      values={shakeFalsyItem(['Raydium', 'Fusion', 'Ecosystem', 'Staked'] as const)}
      onChange={(tab) => useFarms.setState({ currentTab: tab })}
      className={twMerge('justify-self-center mobile:col-span-full', className)}
    />
  )
}

function FarmTimeBasisSelectorBox({ className }: { className?: string }) {
  const timeBasis = useFarms((s) => s.timeBasis)
  return (
    <Select
      className={twMerge('z-20', className)}
      candidateValues={['24H', '7D', '30D']}
      localStorageKey="ui-time-basis"
      defaultValue={timeBasis}
      prefix="Time Basis:"
      onChange={(newSortKey) => {
        useFarms.setState({ timeBasis: newSortKey ?? '7D' })
      }}
    />
  )
}

function FarmTableSorterBlock({
  className,
  onChange
}: {
  className?: string
  onChange?: (newKey: 'name' | `totalApr${'7d' | '30d' | '24h'}` | 'tvl' | 'favorite' | undefined) => void
}) {
  const timeBasis = useFarms((s) => s.timeBasis)
  return (
    <Select
      className={className}
      candidateValues={[
        { label: 'Farm', value: 'name' },
        {
          label: `APRS ${timeBasis}`,
          value: timeBasis === '24H' ? 'totalApr24h' : timeBasis === '7D' ? 'totalApr7d' : 'totalApr30d'
        },
        { label: 'TVL', value: 'tvl' },
        { label: 'Favorite', value: 'favorite' }
      ]}
      prefix="Sort by:"
      onChange={onChange}
    />
  )
}

function FarmRefreshCircleBlock({ className }: { className?: string }) {
  const refreshFarmInfos = useFarms((s) => s.refreshFarmInfos)
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    <Div icss={cssRow()} className={twMerge('items-center', className)}>
      <span className="text-[rgba(196,214,255,0.5)] font-medium text-sm mobile:text-xs">Refresh farms</span>
      <RefreshCircle
        refreshKey="farms"
        className="justify-self-end"
        freshFunction={() => {
          refreshFarmInfos()
        }}
      />
    </Div>
  ) : (
    <Div className={twMerge('justify-self-end', className)}>
      <RefreshCircle
        refreshKey="farms"
        className="justify-self-end"
        freshFunction={() => {
          refreshFarmInfos()
        }}
      />
    </Div>
  )
}

function FarmDatabaseControllers({
  sortControls: { setConfig, clearSortConfig },
  ...restProps
}: {
  sortControls: UseSortControls<(FarmPoolJsonInfo | HydratedFarmInfo)[]>
} & DivProps) {
  const owner = useWallet((s) => s.owner)
  const jsonInfos = useFarms((s) => s.jsonInfos)
  const hydratedInfos = useFarms((s) => s.hydratedInfos)

  const dataSource = (
    (hydratedInfos.length ? hydratedInfos : jsonInfos) as (FarmPoolJsonInfo | HydratedFarmInfo)[]
  ).filter((i) => !isMintEqual(i.lpMint, RAYMint))

  const haveSelfCreatedFarm = dataSource.some((i) => isMintEqual(i.creator, owner))

  return (
    <Div {...restProps}>
      <Div icss={cssRow()} className="justify-end gap-4 mb-4">
        {haveSelfCreatedFarm && <FarmSlefCreatedOnlyBlock />}
        <FarmStakedOnlyBlock />
        <FarmTimeBasisSelectorBox />
        <FarmSearchBlock />
        <FarmRefreshCircleBlock />
      </Div>
    </Div>
  )
}

function FarmCardDatabaseHead({
  sortControls: { setConfig, sortConfig },
  ...restProps
}: {
  sortControls: UseSortControls<(FarmPoolJsonInfo | HydratedFarmInfo)[]>
} & DivProps) {
  const [favouriteIds] = useFarmFavoriteIds()
  const timeBasis = useFarms((s) => s.timeBasis)
  return (
    <Div
      {...restProps}
      className_="grid grid-flow-col mb-3 h-12  sticky -top-6 backdrop-filter z-10 mr-scrollbar rounded-xl mobile:rounded-lg gap-2 grid-cols-[auto,1.5fr,1.2fr,1fr,1fr,auto]"
      icss_={{
        background: 'inherit'
      }}
    >
      <Div
        icss={cssRow()}
        className="group w-20 pl-10 font-medium text-sm items-center cursor-pointer  clickable clickable-filter-effect no-clicable-transform-effect"
        onClick={() => {
          setConfig({
            key: 'favorite',
            sortModeQueue: ['decrease', 'none'],
            sortCompare: (i) => favouriteIds?.includes(toPubString(i.id))
          })
        }}
      >
        <Icon
          className={`ml-1 ${
            sortConfig?.key === 'favorite' && sortConfig.mode !== 'none'
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-30'
          } transition`}
          size="sm"
          iconSrc="/icons/msic-sort-only-down.svg"
        />
      </Div>
      {/* table head column: Farm */}
      <Div
        icss={cssRow()}
        className="font-medium text-primary text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
        onClick={() => {
          setConfig({
            key: 'name',
            sortModeQueue: ['increase', 'decrease', 'none'],
            sortCompare: (i) => (isHydratedFarmInfo(i) ? i.name : undefined)
          })
        }}
      >
        <Div className="mr-16"></Div>
        Farm
        <Icon
          className="ml-1"
          size="sm"
          iconSrc={
            sortConfig?.key === 'name' && sortConfig.mode !== 'none'
              ? sortConfig?.mode === 'decrease'
                ? '/icons/msic-sort-down.svg'
                : '/icons/msic-sort-up.svg'
              : '/icons/msic-sort.svg'
          }
        />
      </Div>
      {/* table head column: Pending Reward */}
      <Div className=" font-medium self-center text-primary text-sm">Pending Reward</Div>
      {/* table head column: Total APR */}
      <Div
        icss={cssRow()}
        className=" font-medium items-center text-primary text-sm cursor-pointer gap-1  clickable clickable-filter-effect no-clicable-transform-effect"
        onClick={() => {
          const key = timeBasis === '24H' ? 'totalApr24h' : timeBasis === '7D' ? 'totalApr7d' : 'totalApr30d'
          setConfig({
            key,
            sortCompare: (i) => (isHydratedFarmInfo(i) ? i[key] : undefined)
          })
        }}
      >
        Total APR {timeBasis}
        <Tooltip>
          <Icon className="ml-1" size="sm" heroIconName="question-mark-circle" />
          <Tooltip.Panel>Estimated APR based on trading fees earned by the pool in the past {timeBasis}</Tooltip.Panel>
        </Tooltip>
        <Icon
          className="ml-1"
          size="sm"
          iconSrc={
            sortConfig?.key.startsWith('totalApr') && sortConfig.mode !== 'none'
              ? sortConfig?.mode === 'decrease'
                ? '/icons/msic-sort-down.svg'
                : '/icons/msic-sort-up.svg'
              : '/icons/msic-sort.svg'
          }
        />
      </Div>
      {/* table head column: TVL */}
      <Div
        icss={cssRow()}
        className=" font-medium text-primary text-sm items-center cursor-pointer  clickable clickable-filter-effect no-clicable-transform-effect"
        onClick={() =>
          setConfig({
            key: 'tvl',
            sortCompare: (i) => (isHydratedFarmInfo(i) ? i.tvl : undefined)
          })
        }
      >
        TVL
        <Icon
          className="ml-1"
          size="sm"
          iconSrc={
            sortConfig?.key === 'tvl' && sortConfig.mode !== 'none'
              ? sortConfig?.mode === 'decrease'
                ? '/icons/msic-sort-down.svg'
                : '/icons/msic-sort-up.svg'
              : '/icons/msic-sort.svg'
          }
        />
      </Div>
    </Div>
  )
}

// TODO: FarmCardData to be context
function FarmTableList(divProps: DivProps) {
  const jsonInfos = useFarms((s) => s.jsonInfos)
  const hydratedInfos = useFarms((s) => s.hydratedInfos)
  const onlySelfFarms = useFarms((s) => s.onlySelfFarms)
  const onlySelfCreatedFarms = useFarms((s) => s.onlySelfCreatedFarms)
  const searchText = useFarms((s) => s.searchText)
  const [favouriteIds] = useFarmFavoriteIds()
  const owner = useWallet((s) => s.owner)
  const isLoading = useFarms((s) => s.isLoading)
  const dataSource = (
    (hydratedInfos.length ? hydratedInfos : jsonInfos) as (FarmPoolJsonInfo | HydratedFarmInfo)[]
  ).filter((i) => !isMintEqual(i.lpMint, RAYMint))

  const applyFiltersDataSource = useMemo(
    () =>
      dataSource
        .filter((i) =>
          onlySelfFarms && isHydratedFarmInfo(i) ? i.ledger && isMeaningfulNumber(i.ledger.deposited) : true
        ) // Switch
        .filter((i) => (i.version === 6 && onlySelfCreatedFarms && owner ? isMintEqual(i.creator, owner) : true)), // Switch
    [onlySelfFarms, searchText, onlySelfCreatedFarms, dataSource, owner]
  )

  const applySearchedDataSource = useMemo(
    () =>
      searchItems(applyFiltersDataSource, {
        text: searchText,
        matchConfigs: (i) =>
          isHydratedFarmInfo(i)
            ? [
                { text: toPubString(i.id), entirely: true },
                { text: i.ammId, entirely: true },
                { text: toPubString(i.base?.mint), entirely: true },
                { text: toPubString(i.quote?.mint), entirely: true },
                i.base?.symbol,
                i.quote?.symbol
                // { text: toSentenceCase(i.base?.name ?? '').split(' '), entirely: true },
                // { text: toSentenceCase(i.quote?.name ?? '').split(' '), entirely: true }
              ]
            : [{ text: toPubString(i.id), entirely: true }]
      }),
    [applyFiltersDataSource, searchText]
  )

  const sortControls = useSort(applySearchedDataSource, {
    defaultSort: {
      key: 'defaultKey',
      sortCompare: [
        /* (i) => i.isUpcomingPool, */ /* (i) => i.isNewPool, */ (i) => favouriteIds?.includes(toPubString(i.id))
      ]
    }
  })

  return (
    <Div {...divProps} icss_={[cssCol(), { height: '100%', overflowY: 'auto' }]}>
      <FarmDatabaseControllers sortControls={sortControls} />
      <FarmCardDatabaseHead sortControls={sortControls} />
      <FarmCardDatabaseBody
        icss={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        isLoading={isLoading}
        data={sortControls.sortedData}
      />
    </Div>
  )
}

function FarmCardDatabaseBody({
  isLoading,
  data,
  ...divProps
}: {
  isLoading: boolean
  data: (FarmPoolJsonInfo | HydratedFarmInfo)[]
} & DivProps) {
  const expandedItemIds = useFarms((s) => s.expandedItemIds)
  const [favouriteIds, setFavouriteIds] = useFarmFavoriteIds()
  return (
    <Div {...divProps}>
      {data.length ? (
        <ListFast
          infiniteScrollOptions={{
            renderAllQuickly: true
          }}
          className="h-full gap-3 text-primary flex-1"
          /* let scrollbar have some space */
          // TODO: sourceData should can have group
          sourceData={data}
          getKey={(i) => toPubString(i.id)}
          getGroupTitle={(i) => i.category}
          renderGroupTitle={(category) => (
            <Div
              icss={{
                border: '1px solid transparent' /*  Fix webkit render bug */,
                paddingBlock: 4,
                background: 'var(--app-bg)'
              }}
            >
              {category}
            </Div>
          )}
          renderItem={(info) => (
            <FarmCardItemFace
              info={info}
              isFavourite={favouriteIds?.includes(toPubString(info.id))}
              onUnFavorite={(farmId) => {
                setFavouriteIds((ids) => removeItem(ids ?? [], farmId))
              }}
              onStartFavorite={(farmId) => {
                setFavouriteIds((ids) => addItem(ids ?? [], farmId))
              }}
              onClickItemFace={(farmId) => {
                useFarms.setState((s) => ({ detailedId: addItem(s.detailedId ?? [], farmId) }))
              }}
            />
          )}
        />
      ) : (
        <Div icss={cssRow()} className="text-center justify-center text-2xl p-12 opacity-50 text-[rgb(171,196,255)]">
          {isLoading ? <LoadingCircle /> : '(No results found)'}
        </Div>
      )}
      <FarmStakeLpDialog />
    </Div>
  )
}

/**
 * manage component (with useFarms)
 */
function FarmDetailPanel(divProps: DivProps) {
  const hydratedInfos = useFarms((s) => s.hydratedInfos)
  const farmIds = useFarms((s) => s.detailedId) ?? []
  /** for calculate detailInfos */
  const tempHydratedInfoMap = listToMap(hydratedInfos, (i) => toPubString(i.id))
  const detailInfos = farmIds.map((farmId) => tempHydratedInfoMap[farmId])
  const currentInfo = detailInfos.at(0)

  return (
    <Div
      {...divProps}
      icss={{
        padding: 16,
        height: '100%',
        backdropFilter: 'brightness(1.5)',
        minWidth: 'min-content', // CSS: overflow is strange , so contain
        contain: 'content',
        contentVisibility: currentInfo ? undefined : 'hidden'
      }}
      tag_={currentInfo ? undefined : Div.tag.noRender}
    >
      <Icon
        iconSrc="/icons/double-right.svg"
        forceColor={appColors.iconMain}
        onClick={() => {
          if (currentInfo) {
            useFarms.setState((s) => ({
              detailedId: removeItem(s.detailedId ?? [], toPubString(currentInfo.id))
            }))
          }
        }}
        icss={{ marginBottom: 32 }}
      />
      {currentInfo && <FarmDetailPanelItemContent farmInfo={currentInfo /* temp */} />}
    </Div>
  )
}

// currently only SDKRewardInfo
function FarmRewardBadge({
  farmInfo,
  reward
}: {
  farmInfo: HydratedFarmInfo
  reward: HydratedRewardInfo | TokenAmount | undefined
}) {
  if (!reward) return null
  const isRewarding = isTokenAmount(reward) ? true : reward.isRewarding
  const isRewardEnded = isTokenAmount(reward) ? false : reward.isRewardEnded
  const isRewardBeforeStart = isTokenAmount(reward) ? false : reward.isRewardBeforeStart
  const pendingAmount = isTokenAmount(reward) ? reward : reward.userPendingReward
  return (
    <Tooltip placement="bottom">
      <Div
        icss={cssRow()}
        className={`ring-1 ring-inset ring-[#abc4ff80] p-1 rounded-full items-center gap-2 overflow-hidden ${
          isRewarding ? '' : 'opacity-50'
        } ${isRewardBeforeStart ? '' : ''}`}
      >
        {gt(pendingAmount, 0.001) && (
          <Div className="text-xs translate-y-0.125 pl-1">
            {formatNumber(toString(pendingAmount), {
              fractionLength: 3
            })}
          </Div>
        )}
        <Div className="relative">
          <CoinAvatar size="smi" token={reward.token} className={isRewardBeforeStart ? 'blur-sm' : ''} />
          {isRewardEnded && (
            <Div className="absolute h-[1.5px] w-full top-1/2 -translate-y-1/2 rotate-45 bg-[#abc4ff80] scale-x-125"></Div>
          )}
          {isRewardBeforeStart && (
            <Div className="absolute top-1/2 -translate-y-1/2 opacity-70">
              <Icon heroIconName="dots-horizontal" />
            </Div>
          )}
        </Div>
      </Div>
      <Tooltip.Panel>
        <Div className="mb-1">
          {reward.token?.symbol ?? '--'}{' '}
          {!isTokenAmount(reward) &&
            reward.openTime &&
            reward.endTime &&
            (isRewardEnded ? 'Reward Ended' : isRewardBeforeStart ? 'Reward Not Started' : 'Reward Period')}
        </Div>
        {!isTokenAmount(reward) && reward.openTime && reward.endTime && (
          <Div className="opacity-50">
            {toUTC(reward.openTime, { hideTimeDetail: true })} ~ {toUTC(reward.endTime, { hideTimeDetail: true })}
          </Div>
        )}
        {reward.token?.mint && (
          <AddressItem
            showDigitCount={6}
            addressType="token"
            canCopy
            canExternalLink
            textClassName="text-xs"
            className="w-full opacity-50 mt-2 contrast-75"
          >
            {toPubString(reward.token.mint)}
          </AddressItem>
        )}
      </Tooltip.Panel>
    </Tooltip>
  )
}

function FarmCardItemFace({
  info,
  isFavourite,
  onClickItemFace,
  onUnFavorite,
  onStartFavorite,
  ...divProps
}: {
  info: HydratedFarmInfo | FarmPoolJsonInfo
  isFavourite?: boolean
  onClickItemFace?: (farmId: string) => void
  onUnFavorite?: (farmId: string) => void
  onStartFavorite?: (farmId: string) => void
} & DivProps) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const timeBasis = useFarms((s) => s.timeBasis)

  return (
    <Div
      className_={twMerge(
        `grid grid-flow-col gap-2 grid-cols-[auto,1.5fr,1.2fr,1fr,1fr,auto] mobile:grid-cols-[1fr,1fr,1fr,auto] py-2 mobile:py-1 mobile:px-5 items-stretch rounded-t-xl mobile:rounded-t-lg transition-all`
      )}
      icss_={{
        background: 'var(--card-bg-super-light)',
        ':hover': {
          background: 'var(--card-bg)'
        }
      }}
      onClick_={() => onClickItemFace?.(toPubString(info.id))}
      {...divProps}
    >
      <Div className="w-12 self-center ml-6 mr-2">
        {isFavourite ? (
          <Icon
            iconSrc="/icons/misc-star-filled.svg"
            onClick={({ ev }) => {
              ev.stopPropagation()
              onUnFavorite?.(toPubString(info.id))
            }}
            className="clickable clickable-mask-offset-2 m-auto self-center"
          />
        ) : (
          <Icon
            iconSrc="/icons/misc-star-empty.svg"
            onClick={({ ev }) => {
              ev.stopPropagation()
              onStartFavorite?.(toPubString(info.id))
            }}
            className="clickable clickable-mask-offset-2 opacity-30 hover:opacity-80 transition m-auto self-center"
          />
        )}
      </Div>

      <CoinAvatarInfoItem info={info} className="self-center" />

      {info.version === 6 ? (
        <TextInfoItem
          name="Pending Rewards"
          value={
            <Div icss={cssRow()} className="flex-wrap gap-2 w-full pr-8">
              {isJsonFarmInfo(info)
                ? '--'
                : info.rewards.map((reward) => {
                    return (
                      <Fragment key={toPubString(reward.rewardVault)}>
                        <FarmRewardBadge farmInfo={info} reward={reward} />
                      </Fragment>
                    )
                  })}
            </Div>
          }
        />
      ) : (
        <TextInfoItem
          name="Pending Rewards"
          value={
            <Div icss={cssRow()} className="flex-wrap gap-2 w-full pr-8">
              {isJsonFarmInfo(info)
                ? '--'
                : info.rewards.map(
                    ({ token, userPendingReward, userHavedReward }) =>
                      userHavedReward &&
                      token && (
                        <Div key={toPubString(token?.mint)}>
                          <FarmRewardBadge farmInfo={info} reward={userPendingReward ?? toTokenAmount(token, 0)} />
                        </Div>
                      )
                  )}
            </Div>
          }
        />
      )}

      <TextInfoItem
        name={`Total APR ${timeBasis}`}
        className="w-max"
        value={
          isJsonFarmInfo(info) ? (
            '--'
          ) : timeBasis === '24H' ? (
            <Tooltip placement="right">
              {info.totalApr24h ? toPercentString(info.totalApr24h) : '--'}
              <Tooltip.Panel>
                {info.raydiumFeeApr24h && (
                  <Div className="whitespace-nowrap">Fees {toPercentString(info.raydiumFeeApr24h)}</Div>
                )}
                {info.rewards.map(
                  ({ apr, token, userHavedReward }, idx) =>
                    userHavedReward && (
                      <Div key={idx} className="whitespace-nowrap">
                        {token?.symbol} {toPercentString(apr)}
                      </Div>
                    )
                )}
              </Tooltip.Panel>
            </Tooltip>
          ) : timeBasis == '30D' ? (
            <Tooltip placement="right">
              {info.totalApr30d ? toPercentString(info.totalApr30d) : '--'}
              <Tooltip.Panel>
                {info.raydiumFeeApr30d && (
                  <Div className="whitespace-nowrap">Fees {toPercentString(info.raydiumFeeApr30d)}</Div>
                )}
                {info.rewards.map(
                  ({ apr, token, userHavedReward }, idx) =>
                    userHavedReward && (
                      <Div key={idx} className="whitespace-nowrap">
                        {token?.symbol} {toPercentString(apr)}
                      </Div>
                    )
                )}
              </Tooltip.Panel>
            </Tooltip>
          ) : (
            <Tooltip placement="right">
              {info.totalApr7d ? toPercentString(info.totalApr7d) : '--'}
              <Tooltip.Panel>
                {info.raydiumFeeApr7d && (
                  <Div className="whitespace-nowrap">Fees {toPercentString(info.raydiumFeeApr7d)}</Div>
                )}
                {info.rewards.map(
                  ({ apr, token, userHavedReward }, idx) =>
                    userHavedReward && (
                      <Div key={idx} className="whitespace-nowrap">
                        {token?.symbol} {toPercentString(apr)}
                      </Div>
                    )
                )}
              </Tooltip.Panel>
            </Tooltip>
          )
        }
      />
      <TextInfoItem
        name="TVL"
        value={isJsonFarmInfo(info) ? '--' : info.tvl ? `~${toUsdVolume(info.tvl, { decimalPlace: 0 })}` : '--'}
        subValue={
          isJsonFarmInfo(info)
            ? '--'
            : info.stakedLpAmount && `${formatNumber(toString(info.stakedLpAmount, { decimalLength: 0 }))} LP`
        }
      />
    </Div>
  )
}

function FarmItemStakeLpButtons({ farmInfo, ...divProps }: { farmInfo: HydratedFarmInfo } & DivProps) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const balances = useWallet((s) => s.balances)
  const hasLp = isMeaningfulNumber(balances[toPubString(farmInfo.lpMint)])
  const connected = useWallet((s) => s.connected)
  return (
    <Div {...divProps} icss_={cssRow({ gap: 12 })}>
      {farmInfo.userHasStaked ? (
        <>
          <Button
            className="mobile:px-6 mobile:py-2 mobile:text-xs"
            disabled={(farmInfo.isClosedPool && !farmInfo.isUpcomingPool) || !hasLp}
            validators={[
              {
                should: !farmInfo.isClosedPool
              },
              {
                should: connected,
                forceActive: true,
                fallbackProps: {
                  children: 'Connect Wallet',
                  onClick: () =>
                    useAppSettings.setState({
                      isWalletSelectorShown: true
                    })
                }
              },
              {
                should: hasLp,
                forceActive: true,
                fallbackProps: {
                  children: 'Add Liquidity',
                  onClick: () =>
                    routeTo('/liquidity/add', {
                      queryProps: {
                        coin1: farmInfo.base,
                        coin2: farmInfo.quote
                      }
                    })
                }
              }
            ]}
            onClick={() => {
              if (connected) {
                useFarms.setState({
                  isStakeDialogOpen: true,
                  stakeDialogMode: 'deposit',
                  stakeDialogInfo: farmInfo
                })
              } else {
                useAppSettings.setState({
                  isWalletSelectorShown: true
                })
              }
            }}
          >
            Stake
          </Button>
          <Tooltip>
            <Icon
              size={isMobile ? 'sm' : 'smi'}
              heroIconName="minus"
              className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
              onClick={() => {
                if (connected) {
                  useFarms.setState({
                    isStakeDialogOpen: true,
                    stakeDialogMode: 'withdraw',
                    stakeDialogInfo: farmInfo
                  })
                } else {
                  useAppSettings.setState({
                    isWalletSelectorShown: true
                  })
                }
              }}
            />
            <Tooltip.Panel>Unstake LP</Tooltip.Panel>
          </Tooltip>
        </>
      ) : (
        <Button
          className="mobile:py-2 mobile:text-xs"
          validators={[
            {
              should: !farmInfo.isClosedPool
            },
            {
              should: connected,
              forceActive: true,
              fallbackProps: {
                children: 'Connect Wallet',
                onClick: () =>
                  useAppSettings.setState({
                    isWalletSelectorShown: true
                  })
              }
            },
            {
              should: hasLp,
              forceActive: true,
              fallbackProps: {
                children: 'Add Liquidity',
                onClick: () =>
                  routeTo('/liquidity/add', {
                    queryProps: {
                      coin1: farmInfo.base,
                      coin2: farmInfo.quote
                    }
                  })
              }
            }
          ]}
          onClick={() => {
            useFarms.setState({
              isStakeDialogOpen: true,
              stakeDialogMode: 'deposit',
              stakeDialogInfo: farmInfo
            })
          }}
        >
          Start Farming
        </Button>
      )}
    </Div>
  )
}

function FarmItemHavestButton({ farmInfo, ...divProps }: { farmInfo: HydratedFarmInfo } & DivProps<'button'>) {
  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)
  const connected = useWallet((s) => s.connected)
  const hasPendingReward = farmInfo.rewards.some(({ userPendingReward }) => isMeaningfulNumber(userPendingReward))
  return (
    <Button // disable={Number(info.pendingReward?.numerator) <= 0}
      {...divProps}
      className="rounded-xl mobile:w-full mobile:py-2 mobile:text-xs whitespace-nowrap"
      isLoading={isApprovePanelShown}
      onClick={() => {
        txFarmHarvest(farmInfo, {
          isStaking: false,
          rewardAmounts: farmInfo.rewards
            .map(({ userPendingReward }) => userPendingReward)
            .filter(isMeaningfulNumber) as TokenAmount[]
        })
      }}
      validators={[
        {
          should: connected,
          forceActive: true,
          fallbackProps: {
            onClick: () =>
              useAppSettings.setState({
                isWalletSelectorShown: true
              }),
            children: 'Connect Wallet'
          }
        },
        { should: hasPendingReward }
      ]}
    >
      Harvest
    </Button>
  )
}

function FarmDetailPanelItemContent({ farmInfo, ...divProps }: { farmInfo: HydratedFarmInfo } & DivProps) {
  const lpPrices = usePools((s) => s.lpPrices)
  const { tokenPrices: prices } = useXStore(tokenAtom)
  const isMobile = useAppSettings((s) => s.isMobile)
  const lightBoardClass = 'bg-[rgba(20,16,65,.2)]'
  const owner = useWallet((s) => s.owner)
  const logSuccess = useNotification((s) => s.logSuccess)
  return (
    <Div {...divProps} icss_={cssCol({ gap: 12 * 4 })}>
      <Div icss={cssRow()} className="items-center gap-3">
        <Div className="flex-grow">
          <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mb-1">Deposited</Div>
          <Div className="text-white font-medium text-base mobile:text-xs">
            {lpPrices[String(farmInfo.lpMint)] && farmInfo.userStakedLpAmount
              ? toUsdVolume(toTotalPrice(farmInfo.userStakedLpAmount, lpPrices[String(farmInfo.lpMint)]))
              : '--'}
          </Div>
          {farmInfo.userStakedLpAmount && (
            <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-xs">
              {formatNumber(toString(farmInfo.userStakedLpAmount), {
                fractionLength: farmInfo.userStakedLpAmount?.token.decimals
              })}{' '}
              LP
            </Div>
          )}
        </Div>
        <FarmItemStakeLpButtons farmInfo={farmInfo} />
      </Div>

      <Div icss={cssRow()} className="flex-grow items-center gap-3">
        {farmInfo.version === 6 ? (
          <Div className="flex-grow w-full">
            <Div
              className={`text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs ${
                farmInfo.rewards.length > 2 ? 'mb-5' : 'mb-1'
              }`}
            >
              Pending rewards
            </Div>
            <Grid
              className={`gap-board 
                   ${farmInfo.rewards.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
              style={{
                clipPath: 'inset(17px)', // 1px for gap-board
                margin: '-17px'
              }}
            >
              {farmInfo.rewards.map((reward, idx) => (
                <Div key={idx} className="p-4">
                  <Div className={`text-white font-medium text-base mobile:text-xs`}>
                    {reward.userPendingReward ? toString(reward.userPendingReward) : 0} {reward.token?.symbol}
                  </Div>
                  <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-xs">
                    {prices?.[String(reward.token?.mint)] && reward?.userPendingReward
                      ? toUsdVolume(toTotalPrice(reward.userPendingReward, prices[String(reward.token?.mint)]))
                      : null}
                  </Div>
                </Div>
              ))}
            </Grid>
          </Div>
        ) : (
          <Div icss={cssRow()} className="flex-grow divide-x-1.5 w-full">
            {farmInfo.rewards?.map(
              (reward, idx) =>
                reward.userHavedReward && (
                  <Div
                    key={idx}
                    className={`px-4 ${idx === 0 ? 'pl-0' : ''} ${
                      idx === farmInfo.rewards.length - 1 ? 'pr-0' : ''
                    } border-[rgba(171,196,255,.5)]`}
                  >
                    <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mb-1">
                      Pending rewards
                    </Div>
                    <Div className={`text-white font-medium text-base mobile:text-xs`}>
                      {reward.userPendingReward ? toString(reward.userPendingReward) : 0} {reward.token?.symbol}
                    </Div>
                    <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-xs">
                      {prices?.[String(reward.token?.mint)] && reward?.userPendingReward
                        ? toUsdVolume(toTotalPrice(reward.userPendingReward, prices[String(reward.token?.mint)]))
                        : null}
                    </Div>
                  </Div>
                )
            )}
          </Div>
        )}
        <FarmItemHavestButton farmInfo={farmInfo} />
      </Div>

      <Div icss={cssRow()} className={`gap-3 items-center self-center justify-center`}>
        <Tooltip>
          <Icon
            size="smi"
            heroIconName="link"
            className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
            onClick={() => {
              copyToClipboard(
                new URL(
                  `farms/?tab=${useFarms.getState().currentTab}&farmid=${toPubString(farmInfo.id)}`,
                  globalThis.location.origin
                ).toString()
              ).then(() => {
                logSuccess('Copy Farm Link', <Div>Farm ID: {toPubString(farmInfo.id)}</Div>)
              })
            }}
          />
          <Tooltip.Panel>Copy Farm Link</Tooltip.Panel>
        </Tooltip>
        <Tooltip>
          <Icon
            size="smi"
            heroIconName="plus"
            className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
            onClick={() => {
              routeTo('/liquidity/add', { queryProps: { ammId: farmInfo.ammId } })
            }}
          />
          <Tooltip.Panel>Add Liquidity</Tooltip.Panel>
        </Tooltip>
        <Tooltip>
          <Icon
            size="smi"
            iconSrc="/icons/msic-swap-h.svg"
            className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
            onClick={() => {
              routeTo('/swap', { queryProps: { coin1: farmInfo.base, coin2: farmInfo.quote } })
            }}
          />
          <Tooltip.Panel>Swap</Tooltip.Panel>
        </Tooltip>
      </Div>

      {/* farm edit button  */}
      {isMintEqual(farmInfo.creator, owner) && (
        <Div icss={cssRow()} className="bg-[#14104133] py-3 px-8 justify-end">
          <Button
            className="frosted-glass-teal"
            onClick={() => {
              useCreateFarms.setState({
                isRoutedByCreateOrEdit: true
              })
              routeTo('/farms/edit', { queryProps: { farmInfo: farmInfo } })
            }}
          >
            Edit Farm
          </Button>
        </Div>
      )}
    </Div>
  )
}

function FarmStakeLpDialog() {
  const connected = useWallet((s) => s.connected)
  const balances = useWallet((s) => s.balances)
  const tokenAccounts = useWallet((s) => s.tokenAccounts)

  const stakeDialogFarmInfo = useFarms((s) => s.stakeDialogInfo)
  const isStakeDialogOpen = useFarms((s) => s.isStakeDialogOpen)
  const stakeDialogMode = useFarms((s) => s.stakeDialogMode)

  const [amount, setAmount] = useState<string>()

  const isApprovePanelShown = useAppSettings((s) => s.isApprovePanelShown)

  const userHasLpAccount = useMemo(
    () =>
      Boolean(stakeDialogFarmInfo?.lpMint) &&
      tokenAccounts.some(({ mint }) => String(mint) === String(stakeDialogFarmInfo?.lpMint)),
    [tokenAccounts, stakeDialogFarmInfo]
  )
  const avaliableTokenAmount = useMemo(
    () =>
      stakeDialogMode === 'deposit'
        ? stakeDialogFarmInfo?.lpMint && balances[String(stakeDialogFarmInfo.lpMint)]
        : stakeDialogFarmInfo?.userStakedLpAmount,
    [stakeDialogFarmInfo, balances, stakeDialogMode]
  )
  const userInputTokenAmount = useMemo(() => {
    if (!stakeDialogFarmInfo?.lp || !amount) return undefined
    return toTokenAmount(stakeDialogFarmInfo.lp, amount, { alreadyDecimaled: true })
  }, [stakeDialogFarmInfo, amount])

  // for keyboard navigation
  const coinInputBoxComponentRef = useRef<CoinInputBoxHandle>()
  const buttonComponentRef = useRef<ButtonHandle>()

  return (
    <ResponsiveDialogDrawer
      open={isStakeDialogOpen}
      onClose={() => {
        setAmount(undefined)
        useFarms.setState({ isStakeDialogOpen: false, stakeDialogInfo: undefined })
      }}
      placement="from-bottom"
    >
      {({ close }) => (
        <Card
          className="backdrop-filter backdrop-blur-xl p-8 w-[min(468px,100vw)] mobile:w-full border-1.5 border-[rgba(171,196,255,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card"
          size="lg"
        >
          {/* {String(info?.lpMint)} */}
          <Div icss={cssRow()} className="justify-between items-center mb-6">
            <Div className="text-xl font-semibold text-white">
              {stakeDialogMode === 'withdraw' ? 'Unstake LP' : 'Stake LP'}
            </Div>
            <Icon className="text-primary cursor-pointer" heroIconName="x" onClick={close} />
          </Div>
          {/* input-container-box */}
          <CoinInputBox
            className="mb-6"
            componentRef={coinInputBoxComponentRef}
            topLeftLabel="Farm"
            token={stakeDialogFarmInfo?.lp}
            onUserInput={setAmount}
            onEnter={(input) => {
              if (!input) return
              buttonComponentRef.current?.click?.()
            }}
            maxValue={stakeDialogMode === 'withdraw' ? stakeDialogFarmInfo?.userStakedLpAmount : undefined}
            topRightLabel={
              stakeDialogMode === 'withdraw'
                ? stakeDialogFarmInfo?.userStakedLpAmount
                  ? `Deposited: ${toString(stakeDialogFarmInfo?.userStakedLpAmount)}`
                  : '(no deposited)'
                : undefined
            }
          />
          <Div icss={cssRow()} className="flex-col gap-1">
            <Button
              className="frosted-glass-teal"
              componentRef={buttonComponentRef}
              isLoading={isApprovePanelShown}
              validators={[
                { should: connected },
                { should: stakeDialogFarmInfo?.lp },
                { should: amount },
                { should: gt(userInputTokenAmount, 0) },
                {
                  should: gte(avaliableTokenAmount, userInputTokenAmount),
                  fallbackProps: { children: 'Insufficient Lp Balance' }
                },
                {
                  should: stakeDialogMode == 'withdraw' ? true : userHasLpAccount,
                  fallbackProps: { children: 'No Stakable LP' }
                }
              ]}
              onClick={() => {
                if (!stakeDialogFarmInfo?.lp || !amount) return
                const tokenAmount = toTokenAmount(stakeDialogFarmInfo.lp, amount, { alreadyDecimaled: true })
                ;(stakeDialogMode === 'withdraw'
                  ? txFarmWithdraw(stakeDialogFarmInfo, { isStaking: false, amount: tokenAmount })
                  : txFarmDeposit(stakeDialogFarmInfo, { isStaking: false, amount: tokenAmount })
                ).then(() => {
                  close()
                })
              }}
            >
              {stakeDialogMode === 'withdraw' ? 'Unstake LP' : 'Stake LP'}
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

function CoinAvatarInfoItem({ info, className }: { info: HydratedFarmInfo | FarmPoolJsonInfo; className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const { getLpToken, getToken } = useXStore(tokenAtom)
  const isStable = isJsonFarmInfo(info) ? false : info.isStablePool

  if (isJsonFarmInfo(info)) {
    const lpToken = getLpToken(info.lpMint) // TODO: may be token can cache?
    const name = lpToken ? `${lpToken.base.symbol ?? '--'} - ${lpToken.quote.symbol ?? '--'}` : '--' // TODO: rule of get farm name should be a issolate function
    return (
      <Div
        icss_={isMobile ? cssCol() : cssRow()}
        className={twMerge('flex-wrap items-center mobile:items-start', className)}
      >
        <CoinAvatarPair
          className="justify-self-center mr-2"
          size={isMobile ? 'sm' : 'md'}
          token1={getToken(info.baseMint)}
          token2={getToken(info.quoteMint)}
        />
        <Div>
          {getToken(info.baseMint) && (
            <Div className="mobile:text-xs font-medium mobile:mt-px mr-1.5">{`${
              getToken(info.baseMint)?.symbol ?? 'unknown'
            }-${getToken(info.quoteMint)?.symbol ?? 'unknown'}`}</Div>
          )}
        </Div>
      </Div>
    )
  }
  const { base, quote, name } = info
  return (
    <Div
      icss_={isMobile ? cssCol() : cssRow()}
      className={twMerge('flex-wrap items-center mobile:items-start gap-x-2 gap-y-1', className)}
    >
      <CoinAvatarPair className="justify-self-center mr-2" size={isMobile ? 'sm' : 'md'} token1={base} token2={quote} />
      <Div className="mobile:text-xs font-medium mobile:mt-px mr-1.5">{name}</Div>
      {info.isClosedPool && <Badge cssColor="#DA2EEF">Inactive</Badge>}
      {isStable && <Badge>Stable</Badge>}
      {info.isDualFusionPool && info.version !== 6 && <Badge cssColor="#DA2EEF">Dual Yield</Badge>}
      {info.isNewPool && <Badge cssColor="#00d1ff">New</Badge>}
      {info.isUpcomingPool && <Badge cssColor="#5dadee">Upcoming</Badge>}
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
  const isMobile = useAppSettings((s) => s.isMobile)
  return (
    <Div icss={cssCol()} className={className}>
      {isMobile && <Div className=" mb-1 text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">{name}</Div>}
      <Div icss={cssCol()} className="flex-grow justify-center">
        <Div className="text-base mobile:text-xs">{value || '--'}</Div>
        {subValue && <Div className="text-sm mobile:text-2xs text-[rgba(171,196,255,0.5)]">{subValue}</Div>}
      </Div>
    </Div>
  )
}

function FarmCardTooltipPanelAddressItem({
  className,
  address,
  type = 'account'
}: {
  className?: string
  address: string
  type?: 'token' | 'account'
}) {
  return (
    <Div icss={cssRow()} className={twMerge('grid w-full gap-2 items-center grid-cols-[1fr,auto]', className)}>
      <Div icss={cssRow()} className="text-xs font-normal text-white">
        {/* setting text-overflow empty string will make effect in FireFox, not Chrome */}
        <Div className="self-end overflow-hidden tracking-wide">{address.slice(0, 6)}</Div>
        <Div className="tracking-wide">...</Div>
        <Div className="overflow-hidden tracking-wide">{address.slice(-6)}</Div>
      </Div>
      <Div icss={cssRow()} className="gap-1 items-center">
        <Icon
          size="sm"
          heroIconName="clipboard-copy"
          className="clickable text-primary"
          onClick={() => {
            copyToClipboard(address)
          }}
        />
        <Link href={`https://solscan.io/${type}/${address}`}>
          <Icon size="sm" heroIconName="external-link" className="clickable text-primary" />
        </Link>
      </Div>
    </Div>
  )
}
