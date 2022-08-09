import { Fragment, ReactNode, useMemo, useRef, useState } from 'react'

import { useRecordedEffect } from '@/hooks/useRecordedEffect'

import { isObject } from '@/functions/judgers/dateType'
import { useScrollDegreeDetector } from '@/hooks/useScrollDegreeDetector'
import { groupBy, map, shakeNil } from '@edsolater/fnkit'
import { Div, DivProps } from '@edsolater/uikit'

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

const ungroupName = '$ungroup_array_list'

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
  const isGrouped = Boolean(getGroupTitle)
  const unsortedAllListItems = useMemo(
    () =>
      map(sourceData, (item) => ({
        item,
        groupName: getGroupTitle ? getGroupTitle(item) : ungroupName
      })),
    [sourceData]
  )
  // TODO: groupBy may have map fn as parameter
  const groupedAllListItems = useMemo(
    () => shakeNil(groupBy(unsortedAllListItems, (listItem) => listItem.groupName)),
    [unsortedAllListItems]
  )
  const allListItems = Object.values(groupedAllListItems).flat()

  // actually showed itemLength
  const [renderItemLength, setRenderItemLength] = useState(renderAllAtOnce ? allListItems.length : initRenderCount)
  const turncatedListItems = allListItems.slice(0, renderItemLength)
  const turncatedGroupedListItems = shakeNil(groupBy(turncatedListItems, (listItem) => listItem.groupName))

  const listRef = useRef<HTMLDivElement>(null)

  useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      setRenderItemLength((n) => (n >= allListItems.length ? allListItems.length : n + increaseRenderCount))
    },
    reachBottomMargin: reachBottomMargin
  })

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
      {isGrouped
        ? Object.entries(turncatedGroupedListItems).map(([groupName, groupItems]) => (
            <Div key={groupName} icss={{ position: 'relative' }}>
              {/* WrapDivIfNot */}
              <Div icss={{ position: 'sticky', top: 0, zIndex: 1000 }}>
                {renderGroupTitle(
                  groupName,
                  map(groupItems, (i) => i.item)
                )}
              </Div>
              {groupItems.map(({ item }, idx) => (
                <Fragment key={getKey(item, idx)}>{renderItem(item, idx)}</Fragment>
              ))}
            </Div>
          ))
        : turncatedListItems.map(({ item }, idx) => (
            <Fragment key={getKey(item, idx)}>{renderItem(item, idx)}</Fragment>
          ))}
    </Div>
  )
}
