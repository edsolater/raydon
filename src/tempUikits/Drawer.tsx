import { ReactNode, useEffect, useState } from 'react'

import { shrinkToValue } from '@/functions/shrinkToValue'
import useTwoStateSyncer from '@/hooks/use2StateSyncer'
import { MayFunction } from '@/types/constants'
import { Div, DivProps, Portal, Transition, DrawerProps as _DrawerProps, Drawer as _Drawer } from '@edsolater/uikit'

export interface DrawerProps extends _DrawerProps {}

export default function Drawer(drawerProps: _DrawerProps) {
  return <_Drawer {...drawerProps} />
}
