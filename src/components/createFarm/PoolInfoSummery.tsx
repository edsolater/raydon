import useAppSettings from '@/application/appSettings/useAppSettings'
import useCreateFarms from '@/application/createFarm/useCreateFarm'
import { liquidityAtom } from '@/application/liquidity/atom'

import { poolsAtom } from '@/application/pools/atom'
import { tokenAtom } from '@/application/token'
import { AddressItem } from '@/components/AddressItem'
import CoinAvatarPair from '@/components/CoinAvatarPair'

import Icon from '@/components/Icon'
import toPubString from '@/functions/format/toMintString'
import toPercentString from '@/functions/format/toPercentString'
import toUsdVolume from '@/functions/format/toUsdVolume'
import ListTable from '@/tempUikits/ListTable'
import Tooltip from '@/tempUikits/Tooltip'
import { cssCol, cssRow, Div } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'

export function PoolInfoSummary() {
  const poolId = useCreateFarms((s) => s.poolId)
  const { hydratedInfos: pairInfos } = useXStore(poolsAtom)
  const { jsonInfos: liquidityPoolJsons } = useXStore(liquidityAtom)
  const { tokens } = useXStore(tokenAtom)
  const isMobile = useAppSettings((s) => s.isMobile)

  const selectedPool = liquidityPoolJsons.find((i) => toPubString(i.id) === poolId)
  const selectedPoolPairInfo = pairInfos.find((i) => i.ammId === poolId)
  const pool = {
    ...selectedPool,
    ...selectedPoolPairInfo,
    baseToken: selectedPool ? tokens[selectedPool.baseMint] : undefined,
    quoteToken: selectedPool ? tokens[selectedPool.quoteMint] : undefined
  }

  return (
    <ListTable
      type={isMobile ? 'item-card' : 'list-table'}
      itemClassName={isMobile ? 'grid-cols-[1fr,2fr]' : undefined}
      list={[{ id: poolId, pool }]}
      getItemKey={(r) => r.id}
      labelMapper={[
        {
          label: 'Pool',
          cssGridItemWidth: '2fr'
        },
        { label: 'TVL' },
        {
          label: 'APR',
          renderLabel: () => (
            <Div icss={cssRow()}>
              <Div>APR</Div>
              <Tooltip>
                <Icon className="ml-1" size="sm" heroIconName="question-mark-circle" />
                <Tooltip.Panel>
                  <Div className="max-w-[300px]">
                    APR based on trading fees earned by the pool in the past 30D. Farming reward APR will be calculated
                    once the farm is live and users have staked.
                  </Div>
                </Tooltip.Panel>
              </Tooltip>
            </Div>
          )
        }
      ]}
      renderRowItem={({ item, label }) => {
        if (label === 'Pool') {
          return item.id ? (
            <Div icss={cssRow()} className="gap-1 items-center">
              <CoinAvatarPair token1={item.pool?.baseToken} token2={item.pool?.quoteToken} size="sm" />
              <Div>
                <Div>
                  {item.pool?.baseToken?.symbol ?? 'UNKNOWN'}-{item.pool?.quoteToken?.symbol ?? 'UNKNOWN'}
                </Div>
                <AddressItem showDigitCount={8} textClassName="text-[#abc4ff80] text-xs" canCopy={false}>
                  {toPubString(item.pool?.id)}
                </AddressItem>
              </Div>
            </Div>
          ) : (
            '--'
          )
        }
        if (label === 'TVL') {
          return (
            <Div icss={cssCol()} className="justify-center h-full">
              {item.pool?.liquidity ? toUsdVolume(item.pool.liquidity, { decimalPlace: 0 }) : '--'}
            </Div>
          )
        }

        if (label === 'APR') {
          return (
            <Div icss={cssCol()} className="justify-center h-full">
              {item.pool.apr30d ? toPercentString(item.pool.apr30d, { alreadyPercented: true }) : '--'}
            </Div>
          )
        }
      }}
    />
  )
}
