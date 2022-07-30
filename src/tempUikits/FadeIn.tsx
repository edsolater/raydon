import { Fragment, ReactNode, useEffect, useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { Transition as HeadlessTransition } from '@headlessui/react'
import {
  CSSStyle,
  cssTransitionTimeFnOutQuadratic,
  Div,
  DivProps,
  ICSS,
  opacityInOut,
  Transition,
  TransitionProps
} from '@edsolater/uikit'

export default function FadeInStable({
  heightOrWidth = 'height',
  ignoreEnterTransition,
  ignoreLeaveTransition,
  show,
  children
}: {
  heightOrWidth?: 'height' | 'width'
  ignoreEnterTransition?: boolean
  ignoreLeaveTransition?: boolean
  show?: any
  children?: ReactNode // if immediately, inner content maybe be still not render ready
}) {
  // const [nodeExist, { off: destory }] = useToggle(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const innerChildren = useRef<ReactNode>(children)
  if (children) innerChildren.current = children // TODO: should cache child result for close transition
  const inTransitionDuration = useRef(false) // flag for transition is start from transition cancel
  const cachedElementHeight = useRef<number>() // for transition start may start from transition cancel, which height is not correct
  const cachedElementWidth = useRef<number>() // for transition start may start from transition cancel, which height is not correct
  return (
    <HeadlessTransition
      show={Boolean(show)}
      appear
      static
      // unmount={false} // TODO: although it will lose state, but not unmount will lose element's height, cause display: none will make height lose. so, have to customized a <Transition> component.
      enter="select-none transition-all duration-200 ease"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="select-none transition-all duration-200 ease"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      beforeEnter={() => {
        if (ignoreEnterTransition) {
          contentRef.current?.style.removeProperty('position')
          contentRef.current?.style.removeProperty('opacity')
          return
        }

        window.requestAnimationFrame(() => {
          contentRef.current?.style.removeProperty('position')
          contentRef.current?.style.removeProperty('opacity')

          if (inTransitionDuration.current) {
            contentRef.current?.style.setProperty('height', `${cachedElementHeight.current}px`)
            contentRef.current?.style.setProperty('width', `${cachedElementWidth.current}px`)
          } else {
            const height = contentRef.current?.clientHeight
            const width = contentRef.current?.clientWidth
            cachedElementHeight.current = height
            cachedElementWidth.current = width

            if (heightOrWidth === 'height') {
              contentRef.current?.style.setProperty('height', '0')
              /// Force bowser to paint the frame  🤯🤯🤯🤯
              contentRef.current?.clientHeight
              contentRef.current?.style.setProperty('height', `${height}px`)
            }

            if (heightOrWidth === 'width') {
              contentRef.current?.style.setProperty('width', '0')
              /// Force bowser to paint the frame  🤯🤯🤯🤯
              contentRef.current?.clientWidth
              contentRef.current?.style.setProperty('width', `${width}px`)
            }
          }
          inTransitionDuration.current = true
        })
      }}
      afterEnter={() => {
        contentRef.current?.style.removeProperty('height')
        contentRef.current?.style.removeProperty('width')
        inTransitionDuration.current = false
      }}
      beforeLeave={() => {
        if (ignoreLeaveTransition) return
        if (inTransitionDuration.current) {
          if (heightOrWidth === 'height') contentRef.current?.style.setProperty('height', `0`)
        } else {
          const height = contentRef.current?.clientHeight
          const width = contentRef.current?.clientWidth
          cachedElementHeight.current = height
          cachedElementHeight.current = height

          if (heightOrWidth === 'height') {
            contentRef.current?.style.setProperty('height', `${height}px`)
            // Force bowser to paint the frame  🤯🤯🤯🤯
            contentRef.current?.clientHeight
            contentRef.current?.style.setProperty('height', '0')
          }

          if (heightOrWidth === 'width') {
            contentRef.current?.style.setProperty('width', `${width}px`)
            // Force bowser to paint the frame  🤯🤯🤯🤯
            contentRef.current?.clientWidth
            contentRef.current?.style.setProperty('width', '0')
          }
        }
        inTransitionDuration.current = true
      }}
      afterLeave={() => {
        contentRef.current?.style.removeProperty('height')
        contentRef.current?.style.removeProperty('width')
        contentRef.current?.style.setProperty('position', 'absolute')
        contentRef.current?.style.setProperty('opacity', '0')
        innerChildren.current = null // clean from internal storage
        inTransitionDuration.current = false
      }}
    >
      {/* outer div can't set ref for it's being used by headless-ui <Transition/> */}
      <div
        ref={contentRef}
        style={{ position: 'absolute', opacity: 0, transition: '200ms' }}
        className={twMerge(`transition-all duration-200 ease overflow-hidden`)}
      >
        {innerChildren.current}
      </div>
    </HeadlessTransition>
  )
}

type FadeInProps = {
  heightOrWidth?: 'height' | 'width'
  show?: boolean
  duration?: number
  transitionTimeFuncing?: string
  /** advanced settings */
  transitionPresets?: TransitionProps['presets']
  ignoreEnterTransition?: boolean
  ignoreLeaveTransition?: boolean
  children?: ReactNode // if immediately, inner content maybe be still not render ready
  /** when set this, `<FadeIn>` will not have additional <Div> . (direct `<FadeIn>`'s child must be `<Div>`-like) */
  noWrapperDivBox?: boolean
} & TransitionProps

const baseTransitionStyle = { overflow: 'hidden' } as CSSStyle

export function FadeIn({
  children,
  heightOrWidth = 'height',
  show = Boolean(children),
  appear,

  duration = 600,
  transitionTimeFuncing = cssTransitionTimeFnOutQuadratic,
  transitionPresets = [opacityInOut({ min: 0.3 })],
  ignoreEnterTransition,
  ignoreLeaveTransition,
  noWrapperDivBox
}: FadeInProps) {
  const init = useInitFlag()

  const contentCachedTrueHeightOrWidth = useRef<number>()
  const innerChildren = useRef<ReactNode>(children)
  if (children) innerChildren.current = children // cache for close transition

  const haveInitTransition = show && appear
  const innerStyle = useRef([
    // cache for not change in rerender
    baseTransitionStyle,
    show && !appear ? undefined : { position: 'absolute', opacity: '0' }
  ] as DivProps['style'])
  return (
    <Transition
      show={Boolean(show)}
      appear={appear}
      cssTransitionDurationMs={duration}
      cssTransitionTimingFunction={transitionTimeFuncing}
      presets={transitionPresets}
      style={innerStyle.current}
      onBeforeEnter={({ contentDivRef: contentRef, from }) => {
        contentRef.current?.style.removeProperty('position')
        contentRef.current?.style.removeProperty('opacity')
        if (ignoreEnterTransition) return
        if (from === 'during-process') {
          contentRef.current?.style.setProperty(heightOrWidth, `${contentCachedTrueHeightOrWidth.current}px`)
        } else {
          contentCachedTrueHeightOrWidth.current =
            contentRef.current?.[heightOrWidth === 'height' ? 'clientHeight' : 'clientWidth']
          contentRef.current?.style.setProperty(heightOrWidth, '0')
          contentRef.current?.clientHeight
          contentRef.current?.style.setProperty(heightOrWidth, `${contentCachedTrueHeightOrWidth.current}px`)
        }
      }}
      onAfterEnter={({ contentDivRef: contentRef }) => {
        if (init && !haveInitTransition) {
          contentRef.current?.style.removeProperty('position')
          contentRef.current?.style.removeProperty('opacity')
        }
        contentRef.current?.style.removeProperty(heightOrWidth)
      }}
      onBeforeLeave={({ contentDivRef: contentRef, from }) => {
        if (ignoreLeaveTransition) return
        if (from === 'during-process') {
          contentRef.current?.style.setProperty(heightOrWidth, '0')
        } else {
          contentCachedTrueHeightOrWidth.current =
            contentRef.current?.[heightOrWidth === 'height' ? 'clientHeight' : 'clientWidth']
          contentRef.current?.style.setProperty(heightOrWidth, `${contentCachedTrueHeightOrWidth.current}px`)
          contentRef.current?.clientHeight
          contentRef.current?.style.setProperty(heightOrWidth, '0')
        }
      }}
      onAfterLeave={({ contentDivRef: contentRef }) => {
        contentRef.current?.style.removeProperty(heightOrWidth)
        contentRef.current?.style.setProperty('position', 'absolute')
        contentRef.current?.style.setProperty('opacity', '0')

        // change ref's value to rerender rerender may use wrong value of innerStyle
        innerStyle.current = [baseTransitionStyle, { position: 'absolute', opacity: '0' }] as DivProps['style']
        // clear cache for friendlier js GC
        // innerChildren.current = null
      }}
    >
      {noWrapperDivBox ? innerChildren.current : <Div>{innerChildren.current}</Div>}
    </Transition>
  )
}

function useInitFlag() {
  const inInit = useRef(true)
  useEffect(() => () => {
    inInit.current = false
  })
  return inInit.current // Value will only updated by rerender
}
