import { ReactNode, useMemo } from 'react'

import useConnection from '@/application/connection/useConnection'
import txIdoClaim from '@/application/ido/txIdoClaim'
import txIdoPurchase from '@/application/ido/txIdoPurchase'
import { HydratedIdoInfo } from '@/application/ido/type'
import useAutoFetchIdoInfos from '@/application/ido/useAutoFetchIdoInfos'
import useIdo from '@/application/ido/useIdo'
import { tokenAtom } from '@/application/token'
import { getWalletBalance } from '@/application/txTools/getWalletBalance'
import txTransferToken from '@/application/txTools/txTransformSqlToken'
import useWallet from '@/application/wallet/useWallet'
import { AddressItem } from '@/components/AddressItem'
import PageLayout from '@/components/PageLayout/PageLayout'
import asyncMap from '@/functions/asyncMap'
import toPubString from '@/functions/format/toMintString'
import { isTokenAmount } from '@/functions/judgers/dateType'
import { gt } from '@/functions/numberish/compare'
import { add, mul, sub } from '@/functions/numberish/operations'
import { toString } from '@/functions/numberish/toString'
import useAsyncMemo from '@/hooks/useAsyncMemo'
import Button from '@/tempUikits/Button'
import Grid from '@/tempUikits/Grid'
import { ThreeSlotItem } from '@/tempUikits/ThreeSlotItem'
import { Numberish } from '@/types/constants'
import { Div } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import assert from 'assert'

export default function BasementPage() {
  useAutoFetchIdoInfos()
  return (
    <PageLayout mobileBarTitle="Staking" metaTitle="Staking - Raydium" contentButtonPaddingShorter>
      <IdoPanel />
    </PageLayout>
  )
}

function IdoPanel() {
  const shadowKeypairs = useWallet((s) => s.shadowKeypairs)
  const connection = useConnection((s) => s.connection)
  const { tokens, getToken } = useXStore(tokenAtom)

  const idoHydratedInfos = useIdo((s) => s.idoHydratedInfos)
  const shadowIdoHydratedInfos = useIdo((s) => s.shadowIdoHydratedInfos) // maybe independent it from useEffect
  const switchKeyLeveledShadowIdoHydratedInfos = useMemo(() => {
    const items = [] as { shadowWalletAddress: string; idoid: string; hydratedInfo: HydratedIdoInfo }[]

    // decode
    for (const [shadowWalletAddress, infoBlock] of Object.entries(shadowIdoHydratedInfos ?? {})) {
      for (const [idoid, hydratedInfo] of Object.entries(infoBlock)) {
        items.push({
          shadowWalletAddress,
          idoid,
          hydratedInfo
        })
      }
    }

    // re-compose
    const composed = {} as { [idoid: string]: { [walletOwnerAddress: string]: HydratedIdoInfo } }
    for (const { idoid, shadowWalletAddress, hydratedInfo } of items) {
      composed[idoid] = { ...composed[idoid], [shadowWalletAddress]: hydratedInfo }
    }

    return composed
  }, [shadowIdoHydratedInfos])
  const shallowBalanceList = useAsyncMemo(
    async () =>
      connection &&
      shadowKeypairs &&
      asyncMap(shadowKeypairs, ({ publicKey }) =>
        getWalletBalance({ connection, walletPublickeyish: publicKey, getPureToken: getToken })
      ),
    [tokens, shadowKeypairs, connection]
  )
  const shallowBalanceMap =
    shallowBalanceList &&
    Object.fromEntries(
      shadowKeypairs?.map(({ publicKey }, idx) => [toPubString(publicKey), shallowBalanceList[idx]]) ?? []
    )
  return (
    <Div className="justify-self-end">
      <Div className="text-2xl mobile:text-lg font-semibold justify-self-start text-white col-span-full mb-8">
        Ido Tickets
      </Div>
      <Grid className="grid-cols-2 gap-24 pb-4 pt-2">
        {Object.entries(switchKeyLeveledShadowIdoHydratedInfos ?? {}).map(([idoId, idoHydratedInfoCollection]) => (
          <Grid key={idoId} className="gap-2">
            <Div className="text-2xl mobile:text-lg font-semibold justify-self-start text-white col-span-full mb-8">
              {Object.values(idoHydratedInfoCollection)[0].base?.symbol}
            </Div>
            {Object.entries(idoHydratedInfoCollection ?? {}).map(([walletOwner, idoHydratedInfo]) => (
              <Div key={walletOwner} className="odd:backdrop-brightness-50 p-4">
                <AddressItem>{walletOwner}</AddressItem>
                <Grid className="grid-cols-3 gap-4">
                  <ItemBlock
                    label="Eligible tickets"
                    value={String(idoHydratedInfo.userEligibleTicketAmount ?? '--')}
                  />
                  <ItemBlock label="Winning tickets count" value={idoHydratedInfo.winningTickets?.length} />
                  <Div>
                    <ItemBlock
                      label={`claimable ${idoHydratedInfo.quote?.symbol ?? '--'}`}
                      value={toString(idoHydratedInfo.claimableQuote)}
                    />
                    {toString(idoHydratedInfo.claimableQuote) && (
                      <Button
                        className="frosted-glass-teal"
                        size="xs"
                        onClick={() => {
                          const targetKeypair = shadowKeypairs?.find(
                            (keypair) => toPubString(keypair.publicKey) === walletOwner
                          )
                          txIdoClaim({
                            idoInfo: idoHydratedInfo,
                            side: 'quote',
                            forceKeyPairs: targetKeypair ? { ownerKeypair: targetKeypair } : undefined
                          })
                        }}
                      >
                        claim
                      </Button>
                    )}
                  </Div>
                  <ItemBlock
                    label={`claimable ${idoHydratedInfo.quote?.symbol ?? '--'}`}
                    value={toString(idoHydratedInfo.claimableQuote)}
                  />
                  <Div>
                    <ItemBlock
                      label={`${idoHydratedInfo.quote?.symbol ?? '--'} balance`}
                      value={`${
                        toString(shallowBalanceMap?.[walletOwner]?.balances?.[idoHydratedInfo.quoteMint]) || '--'
                      }(${toString(
                        sub(
                          shallowBalanceMap?.[walletOwner]?.balances?.[idoHydratedInfo.quoteMint],
                          mul(idoHydratedInfo.userEligibleTicketAmount, idoHydratedInfo.ticketPrice)
                        )
                      )})`}
                    />
                    {toString(idoHydratedInfo.userEligibleTicketAmount) && (
                      <Button
                        className="frosted-glass-teal"
                        size="xs"
                        onClick={() => {
                          const targetKeypair = shadowKeypairs?.find(
                            (keypair) => toPubString(keypair.publicKey) === walletOwner
                          )
                          idoHydratedInfo.userEligibleTicketAmount &&
                            txIdoPurchase({
                              idoInfo: idoHydratedInfo,
                              ticketAmount: idoHydratedInfo.userEligibleTicketAmount,
                              forceKeyPairs: targetKeypair ? { ownerKeypair: targetKeypair } : undefined
                            })
                        }}
                      >
                        join
                      </Button>
                    )}
                    <Button
                      className="frosted-glass-teal"
                      size="xs"
                      onClick={() => {
                        const DJWallet = shadowKeypairs?.find((keypair) =>
                          toPubString(keypair.publicKey).startsWith('DJ')
                        )?.publicKey
                        if (!DJWallet) return

                        const amount = shallowBalanceMap?.[walletOwner]?.balances?.[idoHydratedInfo.quoteMint]
                        assert(isTokenAmount(amount), 'amount is not token amount, maybe SOL?')

                        const targetKeypair = shadowKeypairs?.find(
                          (keypair) => toPubString(keypair.publicKey) === walletOwner
                        )
                        assert(targetKeypair, "can't find target keypair")

                        assert(gt(amount, 0), `no ${idoHydratedInfo.quoteSymbol}`)
                        txTransferToken({
                          to: DJWallet,
                          from: walletOwner,
                          tokenAmount: amount,
                          forceKeyPairs: {
                            ownerKeypair: targetKeypair
                          }
                        })
                      }}
                    >
                      transform to DJ
                    </Button>
                  </Div>
                </Grid>
              </Div>
            ))}
            <Grid className="grid-cols-3 gap-4">
              <ItemBlock
                label="Total Eligible tickets"
                value={toString(
                  Object.values(idoHydratedInfoCollection ?? {}).reduce(
                    (acc, idoHydratedInfo) => add(acc, idoHydratedInfo.userEligibleTicketAmount ?? 0),
                    0 as Numberish
                  )
                )}
              />
              <ItemBlock
                label="Total winning tickets"
                value={toString(
                  Object.values(idoHydratedInfoCollection ?? {}).reduce(
                    (acc, idoHydratedInfo) => add(acc, idoHydratedInfo.winningTickets?.length ?? 0),
                    0 as Numberish
                  )
                )}
              />
              <ItemBlock
                label={`Total claimable ${idoHydratedInfos?.[idoId]?.quote?.symbol ?? '--'}`}
                value={toString(
                  Object.values(idoHydratedInfoCollection ?? {}).reduce(
                    (acc, idoHydratedInfo) => add(acc, idoHydratedInfo.claimableQuote ?? 0),
                    0 as Numberish
                  )
                )}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Div>
  )
}

function ItemBlock(props: { label: ReactNode; value: ReactNode }) {
  return (
    <ThreeSlotItem
      prefix={<Div className="text-xs opacity-75">{props.label}: </Div>}
      text={props.value}
      textClassName="text-base"
    />
  )
}
