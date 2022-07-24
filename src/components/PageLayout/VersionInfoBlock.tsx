import React from 'react'
import useConnection from '@/application/connection/useConnection'
import Tooltip from '../../tempUikits/Tooltip'
import { useAppVersion } from '@/application/appVersion/useAppVersion'
import { toUTC } from '@/functions/date/dateFormat'
import { useForceUpdate } from '@/hooks/useForceUpdate'

export function VersionInfoBlock() {
  const lastestVersion = useAppVersion((s) => s.lastest)
  const currentVersion = useAppVersion((s) => s.currentVersion)
  return (
    <Tooltip>
      <div className="text-sm m-2 mb-0 leading-relaxed opacity-50 hover:opacity-100 transition font-medium text-[#abc4ff] whitespace-nowrap cursor-default">
        <div>V {currentVersion.slice(1)}</div>
        <div>
          <BlockTimeClock />
        </div>
      </div>
      <Tooltip.Panel>
        <div className="text-xs m-2 leading-relaxed font-medium text-[#abc4ff] whitespace-nowrap cursor-default">
          <div>Current: {currentVersion}</div>
          <div>Lastest: {lastestVersion}</div>
          <div>Block time: {<BlockTimeClock showSeconds />}</div>
        </div>
      </Tooltip.Panel>
    </Tooltip>
  )
}
function BlockTimeClock({ showSeconds, hideUTCBadge }: { showSeconds?: boolean; hideUTCBadge?: boolean }) {
  const chainTimeOffset = useConnection((s) => s.chainTimeOffset)
  useForceUpdate({ loop: 1000 })
  return (
    <div className="inline-block">
      {chainTimeOffset != null ? toUTC(Date.now() + chainTimeOffset, { showSeconds, hideUTCBadge }) : undefined}
    </div>
  )
}
