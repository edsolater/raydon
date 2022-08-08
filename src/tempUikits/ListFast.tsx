import React, { CSSProperties, Fragment, ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react'

import mergeRef from '@/functions/react/mergeRef'
import { useRecordedEffect } from '@/hooks/useRecordedEffect'

import { useScrollDegreeDetector } from '@/hooks/useScrollDegreeDetector'
import { DivProps, Div } from '@edsolater/uikit'
import { isObject } from '@/functions/judgers/dateType'
import { uniqueItems } from '@edsolater/hookit'
import { groupBy, shakeNil, map } from '@edsolater/fnkit'

export type ListProps<T> = {
  increaseRenderCount?: number
  initRenderCount?: number
  reachBottomMargin?: number
  renderAllAtOnce?: boolean

  sourceData: T[]
  getKey?: (item: T, index: number) => string | number

  renderItem: (item: T, index: number) => ReactNode

  getGroupTitle?: (item: T) => string /* groupName */
  renderGroupTitle?: (groupName: string, groupedItems: T[]) => ReactNode
} & DivProps

/** future version of `<List>` (use: css content-visibility) */
export default function ListFast<T>({
  increaseRenderCount = 30,
  initRenderCount = 30,
  reachBottomMargin = 50,
  renderAllAtOnce,
  sourceData,
  renderItem,
  getKey = (item, idx) => (isObject(item) ? Reflect.get(item as unknown as object, 'id') ?? idx : idx),

  renderGroupTitle = (groupName) => groupName,
  getGroupTitle,
  ...restProps
}: ListProps<T>) {
  const isItemGrouped = Boolean(getGroupTitle)
  const unsortedAllListItems = map(sourceData, (item) => ({
    item,
    groupName: getGroupTitle ? getGroupTitle(item) : '$array_list'
  }))
  const groupedAllListItems = shakeNil(groupBy(unsortedAllListItems, (listItem) => listItem.groupName))
  const allListItems = Object.values(groupedAllListItems).flat()
  // actually showed itemLength
  const [renderItemLength, setRenderItemLength] = useState(renderAllAtOnce ? allListItems.length : initRenderCount)

  const listRef = useRef<HTMLDivElement>(null)

  useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      setRenderItemLength((n) => (n >= allListItems.length ? allListItems.length : n + increaseRenderCount))
    },
    reachBottomMargin: reachBottomMargin
  })

  // attach some css-variables (too slow)
  // useScrollDetector(listRef)

  // reset if Item's length has changed
  useRecordedEffect(
    ([prevAllItems]) => {
      const prevAllItemKeys = new Set(prevAllItems?.map((i) => i.item).map(getKey))
      const currAllItemKeys = allListItems.map((i) => i.item).map(getKey)
      if (prevAllItems && !renderAllAtOnce && currAllItemKeys.some((key) => !prevAllItemKeys.has(key))) {
        setRenderItemLength(initRenderCount)
      }
    },
    [allListItems, renderAllAtOnce] as const
  )

  return (
    <Div {...restProps} domRef_={listRef} className_={`List overflow-y-scroll`} style_={{ contentVisibility: 'auto' }}>
      {allListItems.slice(0, renderItemLength).map(({ item, groupName }, idx) => (
        <Fragment key={getKey(item, idx)}>
          {isItemGrouped &&
            item === groupedAllListItems[String(groupName)]?.[0].item &&
            renderGroupTitle(
              groupName,
              map(groupedAllListItems[String(groupName)], (i) => i.item)
            )}
          <>{renderItem(item, idx)}</>
        </Fragment>
      ))}
    </Div>
  )
}
