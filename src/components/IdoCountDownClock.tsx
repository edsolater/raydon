import React, { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import parseDuration from '../functions/date/parseDuration'
import { TimeStamp } from '@/functions/date/interface'
import useConnection from '@/application/connection/useConnection'
import { Div, cssRow } from '@edsolater/uikit'

/** !!! use Chain time  */
export default function IdoCountDownClock({
  singleValueMode,
  labelClassName = '',
  play = true,
  className,
  endTime,
  onEnd
}: {
  /** only have one value `90 seconds` instead of `1 minute 30 seconds` */
  singleValueMode?: boolean
  labelClassName?: string
  play?: boolean
  className?: string
  endTime: TimeStamp
  onEnd?: () => void
}) {
  const getChainDate = useConnection((s) => s.getChainDate)
  const [currentDate, setCurrentDate] = useState(getChainDate())
  const endDate = new Date(endTime)
  const duration = parseDuration(endDate.getTime() - currentDate.getTime())
  const labels = {
    days: singleValueMode ? 'd' : duration.days <= 1 ? 'Day' : 'Days',
    hours: singleValueMode ? 'h' : duration.hours <= 1 ? 'Hour' : 'Hours',
    minutes: singleValueMode ? 'm' : duration.minutes <= 1 ? 'Minute' : 'Minutes',
    seconds: singleValueMode ? 's' : duration.seconds <= 1 ? 'Second' : 'Seconds'
  }

  const isValueNegative = duration.full < 0

  const showDaysNumber = duration.days > 0
  const showHourNumber = duration.hours > 0
  const showMinutesNumber = !showDaysNumber && duration.minutes > 0
  const showSecondsNumber = !showHourNumber

  useEffect(() => {
    if (isValueNegative) return
    if (showSecondsNumber) {
      const timeId = globalThis.setInterval(() => {
        if (play) setCurrentDate(getChainDate())
      }, 1000)
      return () => clearInterval(timeId)
    } else if (showMinutesNumber) {
      const timeId = globalThis.setInterval(() => {
        if (play) setCurrentDate(getChainDate())
      }, 1000 * 60)
      return () => clearInterval(timeId)
    } else if (showHourNumber) {
      const timeId = globalThis.setInterval(() => {
        if (play) setCurrentDate(getChainDate())
      }, 1000 * 60 * 60)
      return () => clearInterval(timeId)
    }
  }, [play, isValueNegative, showHourNumber, showMinutesNumber, showSecondsNumber])

  useEffect(() => {
    /** nearly 50ms from zero */
    if (0 <= duration.full && duration.full < 50) {
      onEnd?.()
    }
  }, [duration])

  if (singleValueMode) {
    if (duration.days >= 1)
      return (
        <Div icss={cssRow()} className={twMerge('items-baseline', className)}>
          <Div>{'>'}24</Div>
          <Div className={twMerge('text-xs', labelClassName)}>{labels['hours']}</Div>
        </Div>
      )
    if (duration.hours >= 1 || duration.minutes >= 1)
      return (
        <Div icss={cssRow()} className={twMerge('items-baseline gap-1', className)}>
          {duration.hours >= 1 && (
            <Div icss={cssRow()}>
              <Div>{24 * duration['days'] + duration['hours']}</Div>
              <Div className={twMerge('text-xs', labelClassName)}>{labels['hours']}</Div>
            </Div>
          )}
          <Div icss={cssRow()}>
            <Div>{duration['minutes']}</Div>
            <Div className={twMerge('text-xs', labelClassName)}>{labels['minutes']}</Div>
          </Div>
        </Div>
      )
    return (
      <Div icss={cssRow()} className={twMerge('items-baseline', className)}>
        <Div>
          {24 * 60 * 60 * duration['days'] +
            60 * 60 * duration['hours'] +
            60 * duration['minutes'] +
            duration['seconds']}
        </Div>
        <Div className={twMerge('text-xs', labelClassName)}>{labels['seconds']}</Div>
      </Div>
    )
  }
  return (
    <Div icss={cssRow()} className={twMerge(`space-x-1 ${className ?? ''}`)}>
      {showDaysNumber && (
        <Div icss={cssRow()} className="items-baseline">
          <Div>{duration['days']}</Div>
          <Div className={twMerge('ml-1 text-xs', labelClassName)}>{labels['days']}</Div>
        </Div>
      )}
      {showHourNumber && (
        <Div icss={cssRow()} className="items-baseline">
          <Div>{duration['hours']}</Div>
          <Div className={twMerge('ml-1 text-xs', labelClassName)}>{labels['hours']}</Div>
        </Div>
      )}
      {showMinutesNumber && (
        <Div icss={cssRow()} className="items-baseline">
          <Div>{String(duration['minutes']).padStart(2, '0')}</Div>
          <Div className={twMerge('ml-1 text-xs', labelClassName)}>{labels['minutes']}</Div>
        </Div>
      )}
      {showSecondsNumber && (
        <Div icss={cssRow()} className="items-baseline">
          <Div>{String(duration['seconds']).padStart(2, '0')}</Div>
          <Div className={twMerge('ml-1 text-xs', labelClassName)}>{labels['seconds']}</Div>
        </Div>
      )}
    </Div>
  )
}
