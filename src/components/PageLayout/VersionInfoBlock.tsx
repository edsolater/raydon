import React from 'react'
import useConnection from '@/application/connection/useConnection'
import Tooltip from '../../tempUikits/Tooltip'
import { useAppVersion } from '@/application/appVersion/useAppVersion'
import { toUTC } from '@/functions/date/dateFormat'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { Div } from '@/../../uikit/dist'

export function VersionInfoBlock() {
  const lastestVersion = useAppVersion((s) => s.lastest)
  const currentVersion = useAppVersion((s) => s.currentVersion)
  return (
    <Tooltip>
      <Div className="text-sm mobile:text-2xs m-2 mb-0 leading-relaxed opacity-50 hover:opacity-100 transition font-medium text-primary whitespace-nowrap cursor-default">
        <Div>V {currentVersion.slice(1)}</Div>
        <Div>
          <BlockTimeClock />
        </Div>
      </Div>
      <Tooltip.Panel>
        <Div className="text-xs mobile:text-2xs m-2 leading-relaxed font-medium text-primary whitespace-nowrap cursor-default">
          <Div>Current: {currentVersion}</Div>
          <Div>Lastest: {lastestVersion}</Div>
          <Div>Block time: {<BlockTimeClock showSeconds />}</Div>
        </Div>
      </Tooltip.Panel>
    </Tooltip>
  )
}
function BlockTimeClock({ showSeconds, hideUTCBadge }: { showSeconds?: boolean; hideUTCBadge?: boolean }) {
  const chainTimeOffset = useConnection((s) => s.chainTimeOffset)
  useForceUpdate({ loop: 1000 })
  return (
    <Div className="inline-block">
      {chainTimeOffset != null ? toUTC(Date.now() + chainTimeOffset, { showSeconds, hideUTCBadge }) : undefined}
    </Div>
  )
}
