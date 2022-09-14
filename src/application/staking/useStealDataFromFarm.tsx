import { useXStore } from '@/../../xstore/dist'
import { useEffect } from 'react'
import { farmAtom } from '../farms/atom'
import useStaking from './useStaking'

export default function useStealDataFromFarm() {
  const { hydratedInfos: hydratedFarmInfos } = useXStore(farmAtom)
  useEffect(() => {
    useStaking.setState({ stakeDialogInfo: hydratedFarmInfos.find((info) => info.isStakePool) })
  }, [hydratedFarmInfos])
}
