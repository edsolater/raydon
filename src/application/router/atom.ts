import { createXAtom } from '@edsolater/xstore'
import { Router } from 'next/router'

export const routerAtom = createXAtom<Router>({
  name: 'appRouter'
})
