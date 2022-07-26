import useAppSettings from '@/application/appSettings/useAppSettings'
import { farmAtom } from '@/application/farms/atom'
import { poolsAtom } from '@/application/pools/atom'
import { autoRefreshTvlAndVolume24hData } from '@/application/pools/effects/autoRefreshTvlAndVolume24hData'
import { HydratedPairItemInfo } from '@/application/pools/type'
import { usePoolFavoriteIds } from '@/application/pools/usePools'
import { isHydratedPoolItemInfo } from '@/application/pools/utils/is'
import { routeTo } from '@/application/routeTools'
import { tokenAtom } from '@/application/token'
import { LpToken } from '@/application/token/type'
import useWallet from '@/application/wallet/useWallet'
import CoinAvatarPair from '@/components/CoinAvatarPair'
import Icon from '@/components/Icon'
import LoadingCircle from '@/components/LoadingCircle'
import PageLayout from '@/components/PageLayout/PageLayout'
import RefreshCircle from '@/components/RefreshCircle'
import { addItem, removeItem } from '@/functions/arrayMethods'
import { capitalize } from '@/functions/changeCase'
import formatNumber from '@/functions/format/formatNumber'
import toPubString from '@/functions/format/toMintString'
import toPercentString from '@/functions/format/toPercentString'
import toTotalPrice from '@/functions/format/toTotalPrice'
import toUsdVolume from '@/functions/format/toUsdVolume'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { gt, isMeaningfulNumber, lt } from '@/functions/numberish/compare'
import { toString } from '@/functions/numberish/toString'
import { objectFilter, objectShakeFalsy } from '@/functions/objectMethods'
import { searchItems } from '@/functions/searchItems'
import useSort from '@/hooks/useSort'
import { Badge } from '@/tempUikits/Badge'
import Button from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'
import Collapse from '@/tempUikits/Collapse'
import CyberpunkStyleCard from '@/tempUikits/CyberpunkStyleCard'
import Grid from '@/tempUikits/Grid'
import Input from '@/tempUikits/Input'
import ListFast from '@/tempUikits/ListFast'
import Popover from '@/tempUikits/Popover'
import Select from '@/tempUikits/Select'
import Switcher from '@/tempUikits/Switcher'
import Tooltip from '@/tempUikits/Tooltip'
import { cssCol, cssRow, Div } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import { useCallback, useEffect, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * store:
 * {@link useCurrentPage `useCurrentPage`} ui page store
 * {@link useDatabase `useDatabase`} detail data is from liquidity
 */
export default function PoolsPage() {
  useEffect(() => {
    const stop = autoRefreshTvlAndVolume24hData.activate()
    return stop
  }, [])
  return (
    <PageLayout contentButtonPaddingShorter mobileBarTitle="Pools" metaTitle="Pools - Raydium">
      <PoolHeader />
      <PoolCard />
    </PageLayout>
  )
}

function PoolHeader() {
  const { tvl } = useXStore(poolsAtom)
  const { volume24h } = useXStore(poolsAtom)
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    <Div
      icss={cssRow()}
      className="mx-auto my-2 text-base mobile:text-xs justify-self-start self-end text-[#abc4ff80] gap-4"
    >
      <Div className="whitespace-nowrap">
        TVL: <span className="font-medium text-primary">${formatNumber(tvl)}</span>
      </Div>
      <Div className="whitespace-nowrap">
        Volume24H: <span className="font-medium text-primary">${formatNumber(volume24h)}</span>
      </Div>
    </Div>
  ) : (
    <Grid className="grid-cols-[1fr,1fr] mobile:grid-cols-2 grid-flow-row-dense items-center gap-y-8 pb-8">
      <Div icss={cssRow()} className="justify-self-start gap-8">
        <Div className="text-2xl mobile:text-lg text-white font-semibold">Pools</Div>
        <Div
          icss={cssRow()}
          className="title text-base mobile:text-xs justify-self-start self-end text-[#abc4ff80] gap-4"
        >
          <Div className="whitespace-nowrap">
            TVL: <span className="font-medium text-primary">${formatNumber(tvl)}</span>
          </Div>
          <Div className="whitespace-nowrap">
            Volume24H: <span className="font-medium text-primary">${formatNumber(volume24h)}</span>
          </Div>
        </Div>
      </Div>
      <Div
        icss={cssRow()}
        className={`justify-self-end self-center gap-1 flex-wrap items-center opacity-100 pointer-events-auto clickable transition`}
        onClick={() => {
          routeTo('/liquidity/create')
        }}
      >
        <Icon heroIconName="plus-circle" className="text-primary" size="sm" />
        <span className="text-primary font-medium text-sm mobile:text-xs">Create Pool</span>
      </Div>
    </Grid>
  )
}

function PoolStakedOnlyBlock() {
  const { onlySelfPools } = useXStore(poolsAtom)
  const connected = useWallet((s) => s.connected)
  if (!connected) return null
  return (
    <Div icss={cssRow()} className="justify-self-end mobile:justify-self-auto items-center">
      <span className="text-[rgba(196,214,255,0.5)] font-medium text-sm mobile:text-xs whitespace-nowrap">
        Show Staked
      </span>
      <Switcher
        className="ml-2"
        defaultChecked={onlySelfPools}
        onToggle={(isOnly) => {
          poolsAtom.set({ onlySelfPools: isOnly })
        }}
      />
    </Div>
  )
}

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
                <PoolStakedOnlyBlock />
                <PoolRefreshCircleBlock />
                <PoolTimeBasisSelectorBox />
              </Grid>
            </Card>
          </Div>
        </Popover.Panel>
      </Popover>
    </>
  )
}

function PoolSearchBlock({ className }: { className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const { searchText } = useXStore(poolsAtom)
  return (
    <Input
      value={searchText}
      className={twMerge(
        'px-2 py-2 mobile:py-1 gap-2 ring-inset ring-1 ring-[rgba(196,214,255,0.5)] rounded-xl mobile:rounded-lg min-w-[6em]',
        className
      )}
      inputClassName="font-medium text-sm mobile:text-xs text-[rgba(196,214,255,0.5)] placeholder-[rgba(196,214,255,0.5)]"
      prefix={<Icon heroIconName="search" size={isMobile ? 'sm' : 'smi'} className="text-[rgba(196,214,255,0.5)]" />}
      suffix={
        <Icon
          heroIconName="x"
          size={isMobile ? 'xs' : 'sm'}
          className={`text-[rgba(196,214,255,0.5)] transition clickable ${
            searchText ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => {
            poolsAtom.set({ searchText: '' })
          }}
        />
      }
      placeholder="Search All"
      onUserInput={(searchText) => {
        poolsAtom.set({ searchText })
      }}
    />
  )
}

function PoolLabelBlock({ className }: { className?: string }) {
  return (
    <Div className={className}>
      <Div className="font-medium text-xl mobile:text-base text-white">Liquidity Pools</Div>
      <Div className="font-medium text-[rgba(196,214,255,.5)] text-base mobile:text-sm">
        Earn yield on trading fees by providing liquidity
      </Div>
    </Div>
  )
}

function PoolTimeBasisSelectorBox({ className }: { className?: string }) {
  const { timeBasis } = useXStore(poolsAtom)
  return (
    <Select
      className={twMerge('z-20', className)}
      candidateValues={['24H', '7D', '30D']}
      localStorageKey="ui-time-basis"
      defaultValue={timeBasis}
      prefix="Time Basis:"
      onChange={(newSortKey) => {
        poolsAtom.set({ timeBasis: newSortKey ?? '7D' })
      }}
    />
  )
}

function PoolTableSorterBox({
  className,
  onChange
}: {
  className?: string
  onChange?: (
    sortKey:
      | 'liquidity'
      | 'apr24h'
      | 'apr7d'
      | 'apr30d'
      | 'fee7d'
      | 'fee24h'
      | 'fee30d'
      | 'name'
      | 'volume7d'
      | 'volume24h'
      | 'volume30d'
      | 'favorite'
      | undefined
  ) => void
}) {
  const { timeBasis } = useXStore(poolsAtom)
  return (
    <Select
      className={className}
      candidateValues={[
        { label: 'Pool', value: 'name' },
        { label: 'Liquidity', value: 'liquidity' },
        {
          label: `Volume ${timeBasis}`,
          value: timeBasis === '24H' ? 'volume24h' : timeBasis === '7D' ? 'volume7d' : 'volume30d'
        },
        {
          label: `Fees ${timeBasis}`,
          value: timeBasis === '24H' ? 'fee24h' : timeBasis === '7D' ? 'fee7d' : 'fee30d'
        },
        { label: `APR ${timeBasis}`, value: timeBasis === '24H' ? 'apr24h' : timeBasis === '7D' ? 'apr7d' : 'apr30d' },
        { label: 'Favorite', value: 'favorite' }
      ]}
      // defaultValue="apr"
      prefix="Sort by:"
      onChange={onChange}
    />
  )
}
function PoolRefreshCircleBlock({ className }: { className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    <Div icss={cssRow()} className={twMerge('items-center', className)}>
      <span className="text-[rgba(196,214,255,0.5)] font-medium text-sm mobile:text-xs">Refresh Pools</span>
      <RefreshCircle
        refreshKey="pools"
        freshFunction={() => {
          poolsAtom.get().refreshPools()
        }}
      />
    </Div>
  ) : (
    <Div className={twMerge('justify-self-end', className)}>
      <RefreshCircle
        refreshKey="pools"
        freshFunction={() => {
          poolsAtom.get().refreshPools()
        }}
      />
    </Div>
  )
}

function PoolCard() {
  const balances = useWallet((s) => s.balances)
  const unZeroBalances = objectFilter(balances, (tokenAmount) => gt(tokenAmount, 0))
  const { hydratedInfos } = useXStore(poolsAtom)
  // const { searchText, setSearchText, currentTab, onlySelfPools } = usePageState()

  const { searchText } = useXStore(poolsAtom)
  const { currentTab } = useXStore(poolsAtom)
  const { onlySelfPools } = useXStore(poolsAtom)
  const { timeBasis } = useXStore(poolsAtom)

  const isMobile = useAppSettings((s) => s.isMobile)
  const [favouriteIds] = usePoolFavoriteIds()

  const dataSource = useMemo(
    () =>
      hydratedInfos
        .filter((i) => (currentTab === 'All' ? true : currentTab === 'Raydium' ? i.official : !i.official)) // Tab
        .filter((i) => (onlySelfPools ? Object.keys(unZeroBalances).includes(i.lpMint) : true)), // Switch
    [onlySelfPools, searchText, hydratedInfos]
  )

  const searched = useMemo(
    () =>
      searchItems(dataSource, {
        text: searchText,
        matchConfigs: (i) => [
          { text: i.ammId, entirely: true },
          { text: i.market, entirely: true }, // Input Auto complete result sort setting
          { text: i.lpMint, entirely: true },
          { text: toPubString(i.base?.mint), entirely: true },
          { text: toPubString(i.quote?.mint), entirely: true },
          i.base?.symbol,
          i.quote?.symbol
          // i.base?.name,
          // i.quote?.name
        ]
      }),
    [dataSource, searchText]
  )

  const {
    sortedData,
    setConfig: setSortConfig,
    sortConfig,
    clearSortConfig
  } = useSort(searched, {
    defaultSort: { key: 'defaultKey', sortCompare: [(i) => favouriteIds?.includes(i.ammId), (i) => i.liquidity] }
  })

  const TableHeaderBlock = useCallback(
    () => (
      <Div className="grid grid-flow-col mb-3 h-12 justify-between sticky -top-6 backdrop-filter z-10 backdrop-blur-md bg-[rgba(20,16,65,0.2)] mr-scrollbar rounded-xl mobile:rounded-lg gap-2 grid-cols-[auto,1.6fr,1fr,1fr,1fr,.8fr,auto]">
        <Div
          icss={cssRow()}
          className="group w-20 pl-10 font-medium text-primary text-sm items-center cursor-pointer  clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            setSortConfig({
              key: 'favorite',
              sortModeQueue: ['decrease', 'none'],
              sortCompare: [(i) => favouriteIds?.includes(i.ammId), (i) => i.liquidity]
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

        {/* empty header */}
        <Grid className="grid-cols-[.4fr,1.2fr] clickable clickable-filter-effect no-clicable-transform-effect">
          <Div></Div>

          {/* table head column: Pool */}
          <Div
            icss={cssRow()}
            className="font-medium text-primary text-sm items-center cursor-pointer"
            onClick={() => {
              setSortConfig({
                key: 'name',
                sortModeQueue: ['increase', 'decrease', 'none'],
                sortCompare: (i) => i.name
              })
            }}
          >
            Pool
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
        </Grid>

        {/* table head column: liquidity */}
        <Div
          icss={cssRow()}
          className="font-medium text-primary text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            setSortConfig({ key: 'liquidity', sortCompare: (i) => i.liquidity })
          }}
        >
          Liquidity
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key === 'liquidity' && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Div>

        {/* table head column: volume24h */}
        <Div
          icss={cssRow()}
          className="font-medium text-primary text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            const key = timeBasis === '24H' ? 'volume24h' : timeBasis === '7D' ? 'volume7d' : 'volume30d'
            setSortConfig({ key, sortCompare: (i) => i[key] })
          }}
        >
          Volume {timeBasis}
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key.startsWith('volume') && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Div>

        {/* table head column: fee7d */}
        <Div
          icss={cssRow()}
          className="font-medium text-primary text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            const key = timeBasis === '24H' ? 'fee24h' : timeBasis === '7D' ? 'fee7d' : 'fee30d'
            setSortConfig({ key, sortCompare: (i) => i[key] })
          }}
        >
          Fees {timeBasis}
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key.startsWith('fee') && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Div>

        {/* table head column: volume24h */}
        <Div
          icss={cssRow()}
          className="font-medium text-primary text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            const key = timeBasis === '24H' ? 'apr24h' : timeBasis === '7D' ? 'apr7d' : 'apr30d'
            setSortConfig({ key, sortCompare: (i) => i[key] })
          }}
        >
          APR {timeBasis}
          <Tooltip>
            <Icon className="ml-1" size="sm" heroIconName="question-mark-circle" />
            <Tooltip.Panel>
              Estimated APR based on trading fees earned by the pool in the past {timeBasis}
            </Tooltip.Panel>
          </Tooltip>
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key.startsWith('apr') && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Div>

        <PoolRefreshCircleBlock className="pr-8 self-center" />
      </Div>
    ),
    [sortConfig, timeBasis]
  )

  // NOTE: filter widgets
  const innerPoolDatabaseWidgets = isMobile ? (
    <Div>
      <Div icss={cssRow()} className="mb-4">
        <Grid className="grow gap-3 grid-cols-auto-fit">
          <PoolSearchBlock />
          <PoolTableSorterBox
            onChange={(newSortKey) => {
              newSortKey
                ? setSortConfig({
                    key: newSortKey,
                    sortCompare:
                      newSortKey === 'favorite' ? (i) => favouriteIds?.includes(i.ammId) : (i) => i[newSortKey]
                  })
                : clearSortConfig()
            }}
          />
        </Grid>
        <ToolsButton className="self-center" />
      </Div>
    </Div>
  ) : (
    <Div>
      <Div icss={cssRow()} className={'justify-between pb-5 gap-16 items-center'}>
        <PoolLabelBlock />
        <Div icss={cssRow()} className="gap-6 items-stretch">
          <PoolStakedOnlyBlock />
          <PoolTimeBasisSelectorBox />
          <PoolSearchBlock />
        </Div>
      </Div>
    </Div>
  )
  return (
    <CyberpunkStyleCard
      haveMinHeight
      wrapperClassName="flex-1 overflow-hidden flex flex-col"
      className="p-10 pb-4 mobile:px-3 mobile:py-3 w-full flex flex-col flex-grow h-full"
    >
      {innerPoolDatabaseWidgets}
      {!isMobile && <TableHeaderBlock />}
      <PoolCardDatabaseBody sortedData={sortedData} />
    </CyberpunkStyleCard>
  )
}

function PoolCardDatabaseBody({ sortedData }: { sortedData: HydratedPairItemInfo[] }) {
  const { loading } = useXStore(poolsAtom)
  const [favouriteIds, setFavouriteIds] = usePoolFavoriteIds()
  return sortedData.length ? (
    <ListFast
      infiniteScrollOptions={{
        renderAllQuickly: true
      }}
      className="gap-3 mobile:gap-2 text-primary flex-1 -mx-2 px-2" /* let scrollbar have some space */
      sourceData={sortedData}
      getKey={(info) => toPubString(info.lpMint)}
      renderItem={(info) => (
        <Collapse>
          <Collapse.Face>
            {(open) => (
              <PoolCardDatabaseBodyCollapseItemFace
                open={open}
                info={info}
                isFavourite={favouriteIds?.includes(info.ammId)}
                onUnFavorite={(ammId) => {
                  setFavouriteIds((ids) => removeItem(ids ?? [], ammId))
                }}
                onStartFavorite={(ammId) => {
                  setFavouriteIds((ids) => addItem(ids ?? [], ammId))
                }}
              />
            )}
          </Collapse.Face>
          <Collapse.Body>
            <PoolCardDatabaseBodyCollapseItemContent poolInfo={info} />
          </Collapse.Body>
        </Collapse>
      )}
    />
  ) : (
    <Div className="text-center text-2xl p-12 opacity-50 text-[rgb(171,196,255)]">
      {loading ? <LoadingCircle /> : '(No results found)'}
    </Div>
  )
}

function PoolCardDatabaseBodyCollapseItemFace({
  open,
  info,
  isFavourite,
  onUnFavorite,
  onStartFavorite
}: {
  open: boolean
  info: HydratedPairItemInfo
  isFavourite?: boolean
  onUnFavorite?: (ammId: string) => void
  onStartFavorite?: (ammId: string) => void
}) {
  const { lpTokens } = useXStore(tokenAtom)
  const lpToken = lpTokens[info.lpMint] as LpToken | undefined
  const haveLp = Boolean(lpToken)
  const isMobile = useAppSettings((s) => s.isMobile)
  const isTablet = useAppSettings((s) => s.isTablet)
  const { timeBasis } = useXStore(poolsAtom)

  const pcCotent = (
    <Div
      className={`grid grid-flow-col py-5 mobile:py-4 mobile:px-5 bg-[#141041] items-center gap-2 grid-cols-[auto,1.6fr,1fr,1fr,1fr,.8fr,auto] mobile:grid-cols-[1fr,1fr,1fr,auto] rounded-t-3xl mobile:rounded-t-lg ${
        open ? '' : 'rounded-b-3xl mobile:rounded-b-lg'
      } transition-all`}
    >
      <Div className="w-12 self-center ml-6 mr-2">
        {isFavourite ? (
          <Icon
            iconSrc="/icons/misc-star-filled.svg"
            onClick={({ ev }) => {
              ev.stopPropagation()
              onUnFavorite?.(info.ammId)
            }}
            className="clickable clickable-mask-offset-2 m-auto self-center"
          />
        ) : (
          <Icon
            iconSrc="/icons/misc-star-empty.svg"
            onClick={({ ev }) => {
              ev.stopPropagation()
              onStartFavorite?.(info.ammId)
            }}
            className="clickable clickable-mask-offset-2 opacity-30 hover:opacity-80 transition m-auto self-center"
          />
        )}
      </Div>

      <CoinAvatarInfoItem info={info} className="pl-0" />

      <TextInfoItem
        name="Liquidity"
        value={
          isHydratedPoolItemInfo(info)
            ? toUsdVolume(info.liquidity, { autoSuffix: isTablet, decimalPlace: 0 })
            : undefined
        }
      />
      <TextInfoItem
        name={`Volume(${timeBasis})`}
        value={
          isHydratedPoolItemInfo(info)
            ? timeBasis === '24H'
              ? toUsdVolume(info.volume24h, { autoSuffix: isTablet, decimalPlace: 0 })
              : timeBasis === '7D'
              ? toUsdVolume(info.volume7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume(info.volume30d, { autoSuffix: isTablet, decimalPlace: 0 })
            : undefined
        }
      />
      <TextInfoItem
        name={`Fees(${timeBasis})`}
        value={
          isHydratedPoolItemInfo(info)
            ? timeBasis === '24H'
              ? toUsdVolume(info.fee24h, { autoSuffix: isTablet, decimalPlace: 0 })
              : timeBasis === '7D'
              ? toUsdVolume(info.fee7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume(info.fee30d, { autoSuffix: isTablet, decimalPlace: 0 })
            : undefined
        }
      />
      <TextInfoItem
        name={`APR(${timeBasis})`}
        value={
          isHydratedPoolItemInfo(info)
            ? timeBasis === '24H'
              ? toPercentString(info.apr24h, { alreadyPercented: true })
              : timeBasis === '7D'
              ? toPercentString(info.apr7d, { alreadyPercented: true })
              : toPercentString(info.apr30d, { alreadyPercented: true })
            : undefined
        }
      />
      <Grid className="w-9 h-9 mr-8 place-items-center">
        <Icon size="sm" heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
      </Grid>
    </Div>
  )

  const mobileContent = (
    <Collapse open={open}>
      <Collapse.Face>
        <Div
          className={`grid grid-flow-col py-3 px-3 items-center gap-2 grid-cols-[auto,1.5fr,1fr,1fr,auto] bg-[#141041] mobile:rounded-t-lg ${
            open ? '' : 'rounded-b-3xl mobile:rounded-b-lg'
          }`}
        >
          <Div className="w-8 self-center ">
            {isFavourite ? (
              <Icon
                className="clickable m-auto self-center"
                iconSrc="/icons/misc-star-filled.svg"
                onClick={({ ev }) => {
                  ev.stopPropagation()
                  onUnFavorite?.(info.ammId)
                }}
                size="sm"
              />
            ) : (
              <Icon
                className="clickable opacity-30 hover:opacity-80 transition clickable-mask-offset-2 m-auto self-center"
                iconSrc="/icons/misc-star-empty.svg"
                onClick={({ ev }) => {
                  ev.stopPropagation()
                  onStartFavorite?.(info.ammId)
                }}
                size="sm"
              />
            )}
          </Div>

          <CoinAvatarInfoItem info={info} />

          <TextInfoItem
            name="Liquidity"
            value={
              isHydratedPoolItemInfo(info)
                ? toUsdVolume(info.liquidity, { autoSuffix: true, decimalPlace: 1 })
                : undefined
            }
          />
          <TextInfoItem
            name={`APR(${timeBasis})`}
            value={
              isHydratedPoolItemInfo(info)
                ? timeBasis === '24H'
                  ? toPercentString(info.apr24h, { alreadyPercented: true })
                  : timeBasis === '7D'
                  ? toPercentString(info.apr7d, { alreadyPercented: true })
                  : toPercentString(info.apr30d, { alreadyPercented: true })
                : undefined
            }
          />

          <Grid className="w-6 h-6 place-items-center">
            <Icon size="sm" heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
          </Grid>
        </Div>
      </Collapse.Face>

      <Collapse.Body>
        <Div className="grid grid-flow-col py-4 px-5 pl-12 relative items-center gap-2 grid-cols-[1.5fr,1fr,1fr,auto]  bg-[#141041]">
          <Div className="absolute top-0 left-5 right-5 border-[rgba(171,196,255,.2)] border-t-1.5"></Div>
          <TextInfoItem
            name="Volume(7d)"
            value={
              isHydratedPoolItemInfo(info)
                ? toUsdVolume(info.volume7d, { autoSuffix: true, decimalPlace: 0 })
                : undefined
            }
          />
          <TextInfoItem
            name="Volume(24h)"
            value={
              isHydratedPoolItemInfo(info)
                ? toUsdVolume(info.volume24h, { autoSuffix: true, decimalPlace: 0 })
                : undefined
            }
          />
          <TextInfoItem
            name="Fees(7d)"
            value={
              isHydratedPoolItemInfo(info) ? toUsdVolume(info.fee7d, { autoSuffix: true, decimalPlace: 0 }) : undefined
            }
          />

          <Grid className="w-6 h-6 place-items-center"></Grid>
        </Div>
      </Collapse.Body>
    </Collapse>
  )

  if (!haveLp) return null
  return isMobile ? mobileContent : pcCotent
}

function PoolCardDatabaseBodyCollapseItemContent({ poolInfo: info }: { poolInfo: HydratedPairItemInfo }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const balances = useWallet((s) => s.balances)
  const lightBoardClass = 'bg-[rgba(20,16,65,.2)]'
  const { hydratedInfos: farmPoolsList } = useXStore(farmAtom)
  const { lpPrices: prices } = useXStore(poolsAtom)

  const hasLp = isMeaningfulNumber(balances[info.lpMint])

  const correspondingFarm = useMemo(
    () => farmPoolsList.find((farmInfo) => isMintEqual(farmInfo.lpMint, info.lpMint) && !farmInfo.isClosedPool),
    [info]
  )

  return (
    <Div
      icss_={isMobile ? cssCol() : cssRow()}
      className={`justify-between rounded-b-3xl mobile:rounded-b-lg`}
      style={{
        background: 'linear-gradient(126.6deg, rgba(171, 196, 255, 0.12), rgb(171 196 255 / 4%) 100%)'
      }}
    >
      <Div
        icss={isMobile ? cssCol() : cssRow()}
        className={`py-5 px-8 mobile:py-3 mobile:px-4 gap-[4vw] mobile:gap-3 mobile:grid-cols-3-auto flex-grow justify-between mobile:m-0`}
      >
        <Div icss={cssRow()}>
          <Div className="flex-grow">
            <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mb-1">Your Liquidity</Div>
            <Div className="text-white font-medium text-base mobile:text-xs">
              {toUsdVolume(toTotalPrice(balances[info.lpMint], prices[info.lpMint]))}
            </Div>
            <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">
              {isHydratedPoolItemInfo(info) ? toString(balances[info.lpMint] ?? 0) + ' LP' : '--'}
            </Div>
          </Div>
        </Div>
        <Div icss={cssRow()}>
          <Div className="flex-grow">
            <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mb-1">Assets Pooled</Div>
            <Div className="text-white font-medium text-base mobile:text-xs">
              {isHydratedPoolItemInfo(info) ? `${toString(info.basePooled || 0)} ${info.base?.symbol ?? ''}` : '--'}
            </Div>
            <Div className="text-white font-medium text-base mobile:text-xs">
              {isHydratedPoolItemInfo(info) ? `${toString(info.quotePooled || 0)} ${info.quote?.symbol ?? ''}` : '--'}
            </Div>
          </Div>
        </Div>
        <Div icss={cssRow()}>
          <Div className="flex-grow">
            <Div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mb-1">Your Share</Div>
            <Div className="text-white font-medium text-base mobile:text-xs">
              {isHydratedPoolItemInfo(info) ? toPercentString(info.sharePercent) : '--%'}
            </Div>
          </Div>
        </Div>
      </Div>

      <Div
        icss={cssRow()}
        className={`px-8 py-2 gap-3 items-center self-center justify-center ${
          isMobile ? lightBoardClass : ''
        } mobile:w-full`}
      >
        {isMobile ? (
          <Div icss={cssRow()} className="gap-5">
            <Icon
              size="sm"
              heroIconName="plus"
              className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
              onClick={() => {
                routeTo('/liquidity/add', {
                  queryProps: {
                    ammId: info.ammId
                  }
                })
              }}
            />
            <Icon
              size="sm"
              iconSrc="/icons/pools-remove-liquidity-entry.svg"
              className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] 'clickable' clickable-filter-effect`}
              onClick={() => {
                routeTo('/liquidity/add', {
                  queryProps: {
                    ammId: info.ammId,
                    mode: 'removeLiquidity'
                  }
                })
              }}
            />
            <Icon
              size="sm"
              iconSrc="/icons/msic-swap-h.svg"
              className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
              onClick={() => {
                routeTo('/swap', {
                  queryProps: {
                    coin1: info.base,
                    coin2: info.quote
                  }
                })
              }}
            />
          </Div>
        ) : (
          <>
            <Button
              className="frosted-glass-teal"
              onClick={() => {
                routeTo('/liquidity/add', {
                  queryProps: {
                    ammId: info.ammId
                  }
                })
              }}
            >
              Add Liquidity
            </Button>
            <Tooltip>
              <Icon
                size="smi"
                iconSrc="/icons/pools-farm-entry.svg"
                className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable-filter-effect ${
                  correspondingFarm ? 'clickable' : 'not-clickable'
                }`}
                onClick={() => {
                  routeTo('/farms', {
                    //@ts-expect-error no need to care about enum of this error
                    queryProps: objectShakeFalsy({
                      currentTab: correspondingFarm?.category ? capitalize(correspondingFarm?.category) : undefined,
                      newExpandedItemId: toPubString(correspondingFarm?.id),
                      searchText: [info.base?.symbol, info.quote?.symbol].join(' ')
                    })
                  })
                }}
              />
              <Tooltip.Panel>Farm</Tooltip.Panel>
            </Tooltip>
            <Tooltip>
              <Icon
                size="smi"
                iconSrc="/icons/pools-remove-liquidity-entry.svg"
                className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] ${
                  hasLp ? 'opacity-100 clickable clickable-filter-effect' : 'opacity-50 not-clickable'
                }`}
                onClick={() => {
                  hasLp &&
                    routeTo('/liquidity/add', {
                      queryProps: {
                        ammId: info.ammId,
                        mode: 'removeLiquidity'
                      }
                    })
                }}
              />
              <Tooltip.Panel>Remove Liquidity</Tooltip.Panel>
            </Tooltip>
            <Tooltip>
              <Icon
                iconSrc="/icons/msic-swap-h.svg"
                size="smi"
                className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
                onClick={() => {
                  routeTo('/swap', {
                    queryProps: {
                      coin1: info.base,
                      coin2: info.quote
                    }
                  })
                }}
              />
              <Tooltip.Panel>Swap</Tooltip.Panel>
            </Tooltip>
          </>
        )}
      </Div>
    </Div>
  )
}

function CoinAvatarInfoItem({ info, className }: { info: HydratedPairItemInfo | undefined; className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const lowLiquidityAlertText = `This pool has relatively low liquidity. Always check the quoted price and that the pool has sufficient liquidity before trading.`

  return (
    <Div
      icss_={isMobile ? cssCol() : cssRow()}
      className={twMerge('clickable flex-wrap items-center mobile:items-start', className)}
      // onClick={() => {
      //   if (!isMobile) push(`/liquidity/?ammId=${ammId}`)
      // }}
    >
      <CoinAvatarPair
        className="justify-self-center mr-2"
        size={isMobile ? 'sm' : 'md'}
        token1={info?.base}
        token2={info?.quote}
      />
      <Div icss={cssRow()} className="mobile:text-xs font-medium mobile:mt-px items-center flex-wrap gap-2">
        {info?.name}
        {info?.isStablePool && <Badge className="self-center">Stable</Badge>}
        {lt(info?.liquidity.toFixed(0) ?? 0, 100000) && (
          <Tooltip placement="right">
            <Icon size="sm" heroIconName="question-mark-circle" className="cursor-help" />
            <Tooltip.Panel>
              <Div className="whitespace-pre">{lowLiquidityAlertText}</Div>
            </Tooltip.Panel>
          </Tooltip>
        )}
      </Div>
    </Div>
  )
}

function TextInfoItem({ name, value }: { name: string; value?: any }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    <Div>
      <Div className="mb-1 text-[rgba(171,196,255,0.5)] font-medium text-2xs">{name}</Div>
      <Div className="text-xs">{value || '--'}</Div>
    </Div>
  ) : (
    <Div className="tablet:text-sm">{value || '--'}</Div>
  )
}
