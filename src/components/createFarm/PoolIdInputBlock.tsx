import useAppSettings from '@/application/appSettings/useAppSettings'
import useCreateFarms from '@/application/createFarm/useCreateFarm'
import { liquidityAtom } from '@/application/liquidity/atom'

import { poolsAtom } from '@/application/pools/atom'
import { tokenAtom } from '@/application/token'
import { AddressItem } from '@/components/AddressItem'
import CoinAvatarPair from '@/components/CoinAvatarPair'
import Icon from '@/components/Icon'
import listToMap from '@/functions/format/listToMap'
import toUsdVolume from '@/functions/format/toUsdVolume'
import { isValidPublicKey } from '@/functions/judgers/dateType'
import { useClickOutside } from '@/hooks/useClickOutside'
import AutoComplete, { AutoCompleteCandidateItem } from '@/tempUikits/AutoComplete'
import Card from '@/tempUikits/Card'
import FadeInStable from '@/tempUikits/FadeIn'
import Grid from '@/tempUikits/Grid'
import { cssRow, Div } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import { LiquidityPoolJsonInfo } from '@raydium-io/raydium-sdk'
import { RefObject, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

export interface PoolIdInputBlockHandle {
  validate?: () => void
  turnOffValidation?: () => void
}

export function PoolIdInputBlock({
  componentRef,
  onInputValidate
}: {
  componentRef?: RefObject<any>
  onInputValidate?: (result: boolean) => void
}) {
  const isMoblie = useAppSettings((s) => s.isMobile)
  const poolId = useCreateFarms((s) => s.poolId)
  const { hydratedInfos: pairInfos } = useXStore(poolsAtom)
  const { jsonInfos: liquidityPoolJsons } = useXStore(liquidityAtom)
  const { tokens } = useXStore(tokenAtom)

  const liquidityPoolMap = useMemo(() => listToMap(liquidityPoolJsons, (s) => s.id), [liquidityPoolJsons])
  const pairInfoMap = useMemo(() => listToMap(pairInfos, (s) => s.ammId), [pairInfos])

  const selectedPool = liquidityPoolJsons.find((i) => i.id === poolId)
  const selectedPoolPairInfo = pairInfos.find((i) => i.ammId === poolId)

  const candidates = liquidityPoolJsons
    // .filter((p) => tokens[p.baseMint] && tokens[p.quoteMint])
    .map((pool) =>
      Object.assign({ ...pool }, {
        label: pool.id,
        // searchText: `${tokens[pool.baseMint]?.symbol} ${tokens[pool.quoteMint]?.symbol} ${pool.id}`
        searchText: (i) => [
          { text: i.id, entirely: true },
          { text: i.baseMint, entirely: true }, // Input Auto complete result sort setting
          { text: i.quoteMint, entirely: true },
          tokens[i.baseMint]?.symbol,
          tokens[i.quoteMint]?.symbol
          // tokens[i.baseMint]?.name,
          // tokens[i.quoteMint]?.name
        ]
      } as AutoCompleteCandidateItem<LiquidityPoolJsonInfo>)
    )

  // state for validate
  const [inputValue, setInputValue] = useState<string>()
  const [isInit, setIsInit] = useState(() => !inputValue)
  const [isInputing, setIsInputing] = useState(false) // true for don't pop valid result immediately
  const inputCardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    inputValue && setIsInit(false)
  }, [inputValue])

  useEffect(() => {
    const result = Boolean(selectedPool && inputValue)
    onInputValidate?.(result)
  }, [inputValue])

  const validate = () => {
    setIsInputing(false)
  }
  const turnOffValidation = () => {
    setIsInputing(true)
  }
  useClickOutside(inputCardRef, {
    onBlurToOutside: validate
  })

  useImperativeHandle<any, PoolIdInputBlockHandle>(componentRef, () => ({
    validate,
    turnOffValidation
  }))

  return (
    <Card
      className={`p-4 mobile:p-2 bg-cyberpunk-card-bg border-1.5 border-[#abc4ff1a] ${
        isMoblie ? 'rounded-2xl' : 'rounded-3xl'
      }`}
      domRef={inputCardRef}
    >
      <AutoComplete
        candidates={candidates}
        value={selectedPool?.id}
        className="p-4 py-3 gap-2 bg-[#141041] rounded-xl min-w-[7em]"
        inputClassName="font-medium mobile:text-xs text-primary placeholder-[#abc4Ff80]"
        suffix={<Icon heroIconName="search" className="text-[rgba(196,214,255,0.5)]" />}
        placeholder="Search for a pool or paste AMM ID"
        renderCandidateItem={({ candidate, isSelected }) => (
          <Grid
            className={`py-3 px-4 mobile:p-2 items-center grid-cols-[auto,auto,1fr,auto] mobile:grid-cols-[auto,1fr,1fr] gap-2 mobile:gap-1 ${
              isSelected ? 'backdrop-brightness-50' : ''
            }`}
          >
            <CoinAvatarPair
              token1={tokens[candidate.baseMint]}
              token2={tokens[candidate.quoteMint]}
              size={isMoblie ? 'smi' : 'md'}
            />
            <Div className="text-primary font-medium mobile:text-sm">
              {tokens[candidate.baseMint]?.symbol ?? 'UNKNOWN'}-{tokens[candidate.quoteMint]?.symbol ?? 'UNKNOWN'}
            </Div>
            {pairInfoMap[candidate.id] ? (
              <Div className="text-[#abc4ff80] text-sm font-medium mobile:text-end">
                {toUsdVolume(pairInfoMap[candidate.id].liquidity, { decimalPlace: 0 })}
              </Div>
            ) : null}
            <AddressItem
              canCopy={false}
              showDigitCount={isMoblie ? 16 : 8}
              className="mobile:col-span-full"
              textClassName="text-[#abc4ff80] text-sm mobile:text-xs"
            >
              {candidate.id}
            </AddressItem>
          </Grid>
        )}
        onSelectCandiateItem={({ selected }) => {
          setIsInputing(false)
          useCreateFarms.setState({ poolId: selected.id })
        }}
        onBlurMatchCandiateFailed={({ text: candidatedPoolId }) => {
          useCreateFarms.setState({ poolId: isValidPublicKey(candidatedPoolId) ? candidatedPoolId : undefined })
        }}
        onDangerousValueChange={(v) => {
          if (!v) useCreateFarms.setState({ poolId: undefined })
          if (isValidPublicKey(v)) useCreateFarms.setState({ poolId: v })
          setInputValue(v)
        }}
        onUserInput={() => {
          setIsInit(false)
          setIsInputing(true)
        }}
        onBlur={() => {
          setIsInputing(false)
        }}
      />

      <FadeInStable show={!isInputing && !isInit}>
        <Div icss={cssRow()} className="items-center px-4 pt-2 gap-2">
          {selectedPool ? (
            <>
              <CoinAvatarPair
                token1={tokens[selectedPool.baseMint]}
                token2={tokens[selectedPool.quoteMint]}
                size={isMoblie ? 'smi' : 'md'}
              />
              <Div className="text-primary text-base mobile:text-sm font-medium">
                {tokens[selectedPool.baseMint]?.symbol ?? 'UNKNOWN'} -{' '}
                {tokens[selectedPool.quoteMint]?.symbol ?? 'UNKNOWN'}
              </Div>
              {selectedPoolPairInfo ? (
                <Div className="text-[#abc4ff80] text-sm mobile:text-xs ml-auto font-medium">
                  Liquidity: {toUsdVolume(selectedPoolPairInfo.liquidity, { decimalPlace: 0 })}
                </Div>
              ) : null}
            </>
          ) : (
            <>
              <Icon size="smi" heroIconName="x-circle" className="text-[#DA2EEF]" />
              <Div className="text-[#DA2EEF] text-sm font-medium">
                {inputValue ? "Can't find pool" : 'You need to select one pool'}
              </Div>
            </>
          )}
        </Div>
      </FadeInStable>
    </Card>
  )
}
