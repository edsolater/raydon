import React, { CSSProperties, Fragment, ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { twMerge } from 'tailwind-merge'

import { inClient } from '@/functions/judgers/isSSR'
import { shrinkToValue } from '@/functions/shrinkToValue'
import useTwoStateSyncer from '@/hooks/use2StateSyncer'
import { MayFunction } from '@/types/constants'
import { Div, DivProps, Portal, Transition } from '@edsolater/uikit'

export const DRAWER_STACK_ID = 'drawer-stack'

const placementClasses = {
  'from-left': {
    absolutePostion: 'left-0 top-0 bottom-0',
    translateFadeOut: '-translate-x-full'
  },
  'from-bottom': {
    absolutePostion: 'bottom-0 left-0 right-0',
    translateFadeOut: 'translate-y-full'
  },
  'from-right': {
    absolutePostion: 'right-0 top-0 bottom-0',
    translateFadeOut: 'translate-x-full'
  },
  'from-top': {
    absolutePostion: 'top-0 left-0 right-0',
    translateFadeOut: '-translate-y-full'
  }
}

export interface DrawerProps extends Omit<DivProps, 'children'> {
  children?: MayFunction<ReactNode, [{ close(): void }]>
  open: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
  transitionSpeed?: 'fast' | 'normal'
  // if content is scrollable, PLEASE open it!!!, for blur will make scroll super fuzzy
  maskNoBlur?: boolean
  canClosedByMask?: boolean
  onOpen?: () => void
  /** fired before close transform effect is end */
  onCloseImmediately?: () => void
  onClose?(): void
}
const DrawerStackPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    return () => setMounted(false)
  }, [])

  return mounted && inClient && document.querySelector(`#${DRAWER_STACK_ID}`)
    ? createPortal(children, document.querySelector(`#${DRAWER_STACK_ID}`)!)
    : null
}

export default function Drawer({
  className,
  style,
  children,
  open,
  placement = 'from-left',
  transitionSpeed = 'normal',
  maskNoBlur,
  canClosedByMask = true,
  onOpen,
  onCloseImmediately,
  onClose,
  ...divProps
}: DrawerProps) {
  const transitionDuration = transitionSpeed === 'fast' ? 200 : 300

  // for onCloseTransitionEnd
  // during leave transition, open is still true, but innerOpen is false, so transaction will happen without props:open has change (if open is false, React may destory this component immediately)
  const [innerOpen, setInnerOpen] = useState(open)

  useEffect(() => {
    if (open) onOpen?.()
  }, [open])

  const openDrawer = () => setInnerOpen(true)
  const closeDrawer = () => setInnerOpen(false)

  useTwoStateSyncer({
    state1: open,
    state2: innerOpen,
    onState1Changed: (open) => {
      open ? openDrawer() : closeDrawer()
    }
  })

  return (
    <Portal
      id={DRAWER_STACK_ID}
      zIndex={1010}
      icss={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        '*': {
          pointerEvents: 'initial'
        }
      }}
      onClick={({ ev }) => ev.stopPropagation()}
    >
      <Transition
        show={innerOpen}
        fromProps={{ icss: { opacity: 0 } }}
        toProps={{ icss: { opacity: 1 } }}
        cssTransitionDurationMs={75}
        onBeforeLeave={onCloseImmediately}
        onAfterLeave={onClose}
        icss={{ transitionDelay: innerOpen ? `${transitionDuration}ms` : '', position: 'fixed', inset: 0 }}
      >
        <Div
          className={'Drawer-mask'}
          icss={{
            background: '#0000005c',
            backdropFilter: maskNoBlur ? undefined : 'blur(10px)',
            pointerEvents: canClosedByMask ? undefined : 'none'
          }}
          onClick={closeDrawer}
        />
      </Transition>

      <Transition
        className={'Drawer-content'}
        show={innerOpen}
        fromProps={{ className: placementClasses[placement].translateFadeOut }}
        toProps={{ className: '' }}
        cssTransitionDurationMs={transitionDuration}
      >
        <Div
          {...divProps}
          icss={[
            {
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              '*': { pointerEvents: 'initial' }
            },
            divProps.icss
          ]}
        >
          {shrinkToValue(children, [{ close: closeDrawer, open: openDrawer }])}
        </Div>
      </Transition>
    </Portal>
  )
}
