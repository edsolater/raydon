import { cssCol, Div, DivProps } from '@edsolater/uikit'
import addPropsToReactElement from '@/functions/react/addPropsToReactElement'
import mergeRef from '@/functions/react/mergeRef'
import { pickReactChildren } from '@/functions/react/pickChild'
import { useRecordedEffect } from '@/hooks/useRecordedEffect'
import { useScrollDegreeDetector } from '@/hooks/useScrollDegreeDetector'
import { ComponentProps, CSSProperties, ReactNode, RefObject, useMemo, useRef, useState } from 'react'

export default function List({
  increaseRenderCount = 30,
  initRenderCount = 30,
  reachBottomMargin = 50,
  renderAllAtOnce,

  domRef,
  className,
  children,
  style
}: {
  increaseRenderCount?: number
  initRenderCount?: number
  reachBottomMargin?: number
  renderAllAtOnce?: boolean

  domRef?: RefObject<any>
  className?: string
  children?: ReactNode
  style?: CSSProperties
}) {
  // all need to render items
  const allListItems = useMemo(
    () =>
      pickReactChildren(children, List.Item, (el, idx) =>
        addPropsToReactElement<ComponentProps<typeof List['Item']>>(el, {
          key: el.key ?? idx,
          $isRenderByMain: true
        })
      ),
    [children]
  )
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
      const prevAllItemKeys = new Set(prevAllItems?.map((el) => el?.key))
      const currAllItemKeys = allListItems.map((el) => el?.key)
      if (prevAllItems && !renderAllAtOnce && currAllItemKeys.some((key) => !prevAllItemKeys.has(key))) {
        setRenderItemLength(initRenderCount)
      }
    },
    [allListItems, renderAllAtOnce] as const
  )

  return (
    <Div
      icss={cssCol()}
      domRef={mergeRef(domRef, listRef)}
      className={`List overflow-y-scroll ${className ?? ''}`}
      style={{ ...style, contentVisibility: 'auto' }}
    >
      {allListItems.slice(0, renderItemLength)}
    </Div>
  )
}

List.Item = function ListItem({
  $isRenderByMain,
  children,
  className = '',
  style,
  domRef
}: {
  $isRenderByMain?: boolean
  children?: ReactNode
  className?: string
  style?: DivProps['style']
  domRef?: RefObject<any>
}) {
  if (!$isRenderByMain) return null
  return (
    <Div className={`ListItem w-full ${className}`} domRef={domRef} style={style}>
      {children}
    </Div>
  )
}
