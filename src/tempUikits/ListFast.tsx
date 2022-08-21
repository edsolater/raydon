import { Fragment, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react'

import { useRecordedEffect } from '@/hooks/useRecordedEffect'

import { isObject } from '@/functions/judgers/dateType'
import { useScrollDegreeDetector } from '@/hooks/useScrollDegreeDetector'
import { groupBy, map, shakeNil } from '@edsolater/fnkit'
import { Div, DivProps } from '@edsolater/uikit'
import { useForceUpdate } from '@edsolater/hookit'

type InfiniteScrollOptions = {
  increaseRenderCount?: number
  initRenderCount?: number
  reachBottomMargin?: number
  renderAllAtOnce?: boolean
}

export type ListProps<T> = {
  infiniteScrollOptions?: InfiniteScrollOptions

  sourceData: T[]
  getKey?: (item: T, index: number) => string | number

  renderItem: (item: T, index: number) => ReactNode

  getGroupTitle?: (item: T) => string /* groupName */
  renderGroupTitle?: (groupName: string, groupedItems: T[]) => ReactNode
} & DivProps

const ungroupName = '$ungroup_array_list'

/** future version of `<List>` (use: css content-visibility) */
export default function ListFast<T>({
  infiniteScrollOptions,
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
  const { listRef, renderItemLength } = useInfiniteScrollItemCount({
    ...infiniteScrollOptions,
    allItems: allListItems.map((i) => i.item),
    getKey
  })
  const turncatedListItems = allListItems.slice(0, renderItemLength)
  const turncatedGroupedListItems = shakeNil(groupBy(turncatedListItems, (listItem) => listItem.groupName))

  // list item cache (for improve performance)
  const renderCache = useRef(new Map<string | number, { item: T; node: ReactNode }>())
  const getRenderNode = (item: T, idx: number) => {
    const key = getKey(item, idx)
    if (renderCache.current.has(key) && renderCache.current.get(key)?.item === item) {
      return renderCache.current.get(key)!.node
    } else {
      const node = renderItem(item, idx)
      renderCache.current.set(key, { item, node })
      return node
    }
  }

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
                <Fragment key={getKey(item, idx)}>{getRenderNode(item, idx)}</Fragment>
              ))}
            </Div>
          ))
        : turncatedListItems.map(({ item }, idx) => (
            <Fragment key={getKey(item, idx)}>{getRenderNode(item, idx)}</Fragment>
          ))}
    </Div>
  )
}

function useInfiniteScrollItemCount<T>({
  allItems,
  getKey,
  increaseRenderCount = 30,
  initRenderCount = 30,
  reachBottomMargin = 50,
  renderAllAtOnce
}: InfiniteScrollOptions & { allItems: T[]; getKey: (item: T, index: number) => string | number }): {
  renderItemLength: number
  listRef: RefObject<HTMLElement>
  /** if change, re-calc renderItemLength */
  recalcListItem: () => void
} {
  const [, forceUpdate] = useForceUpdate()

  // actually showed itemLength
  const [renderItemLength, setRenderItemLength] = useState(renderAllAtOnce ? allItems.length : initRenderCount)
  const listRef = useRef<HTMLElement>(null)
  useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      setRenderItemLength((n) => (n >= allItems.length ? allItems.length : n + increaseRenderCount))
    },
    reachBottomMargin
  })

  // reset if Item's length has changed
  useRecordedEffect(
    ([prevAllItems]) => {
      const prevAllItemKeys = new Set(prevAllItems?.map(getKey))
      const currAllItemKeys = allItems.map(getKey)
      if (prevAllItems && !renderAllAtOnce && currAllItemKeys.some((key) => !prevAllItemKeys.has(key))) {
        setRenderItemLength(initRenderCount)
      }
    },
    [allItems, renderAllAtOnce] as const
  )

  return { renderItemLength, listRef, recalcListItem: forceUpdate }
}
