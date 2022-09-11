import { createXEffect } from '@edsolater/xstore'
import { connectionAtom } from '../../connection'
import { jsonInfo2PoolKeys } from '../../txTools/jsonInfo2PoolKeys'
import { mergeSdkFarmInfo } from '../utils/handleFarmInfo'
import { farmAtom } from '../atom'
import { walletAtom } from '@/application/wallet'

export const autoSDKParseFarmJsonInfos = createXEffect(async () => {
  const { jsonInfos } = farmAtom.get()
  const { connection } = connectionAtom.get()
  const { owner } = walletAtom.get()

  if (!jsonInfos || !connection) return
  if (!jsonInfos?.length) return
  const sdkParsedInfos = await mergeSdkFarmInfo(
    {
      connection,
      pools: jsonInfos.map(jsonInfo2PoolKeys),
      owner,
      config: { commitment: 'confirmed' }
    },
    { jsonInfos }
  )
  farmAtom.set({ sdkParsedInfos })
}, [farmAtom.subscribe.jsonInfos, connectionAtom.subscribe.connection, walletAtom.subscribe.owner])
