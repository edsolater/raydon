import { useEffect } from 'react'
import { eq, gt, lt, lte } from '@/functions/numberish/compare'
import useDevice from '@/hooks/useDevice'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect '
import { inClient, inServer, isInBonsaiTest, isInLocalhost } from '@/functions/judgers/isSSR'
import { toString } from '@/functions/numberish/toString'
import useLocalStorageItem from '@/hooks/useLocalStorage'
import { useRecordedEffect } from '@/hooks/useRecordedEffect'
import Link from '@/tempUikits/Link'
import { useKeyboardShortcut } from '@edsolater/hookit'
import { Div } from '@edsolater/uikit'
import { useRouter } from 'next/router'
import useNotification from '../notification/useNotification'
import useAppSettings from './useAppSettings'

export function useThemeModeSync() {
  const themeMode = useAppSettings((s) => s.themeMode)
  useEffect(() => {
    globalThis.document?.documentElement.classList.remove('dark', 'light')
    globalThis.document?.documentElement.classList.add(themeMode)
  }, [themeMode])
}

export function useDeviceInfoSyc() {
  // device
  const { isMobile, isPc, isTablet } = useDevice()
  useIsomorphicLayoutEffect(() => {
    useAppSettings.setState({ isMobile, isTablet, isPc })
  }, [isMobile, isPc, isTablet])

  useIsomorphicLayoutEffect(() => {
    useAppSettings.setState({
      inClient: inClient,
      inServer: inServer,
      isInBonsaiTest: isInBonsaiTest,
      isInLocalhost: isInLocalhost
    })
  }, [])
}

export function useKeyboardShortcutInitialization() {
  const document = globalThis.document
  if (!inClient) return
  useKeyboardShortcut(document as any, {
    'ctrl + \\': () => useAppSettings.setState((s) => ({ isSideBarMenuShown: !s.isSideBarMenuShown }))
  })
}

export function useSlippageTolerenceValidator() {
  const slippageTolerance = useAppSettings((s) => s.slippageTolerance)

  useEffect(() => {
    if (lte(slippageTolerance, 0) || gt(slippageTolerance, 0.5)) {
      useAppSettings.setState({ slippageToleranceState: 'invalid' })
    } else if (lt(slippageTolerance, 0.01)) {
      useAppSettings.setState({ slippageToleranceState: 'too small' })
    } else {
      useAppSettings.setState({ slippageToleranceState: 'valid' })
    }
  }, [slippageTolerance])
}

export function useSlippageTolerenceSyncer() {
  const slippageTolerance = useAppSettings((s) => s.slippageTolerance)

  const [localStoredSlippage, setLocalStoredSlippage] = useLocalStorageItem<string>('SLIPPAGE')
  useRecordedEffect(
    ([prevSlippageTolerance, prevLocalStoredSlippaged]) => {
      const slippageHasLoaded = prevSlippageTolerance == null && slippageTolerance !== null
      if (slippageHasLoaded && !eq(slippageTolerance, localStoredSlippage)) {
        useAppSettings.setState({
          slippageTolerance: localStoredSlippage ?? 0.01
        })
      } else if (slippageTolerance) {
        setLocalStoredSlippage(toString(slippageTolerance))
      }
    },
    [slippageTolerance, localStoredSlippage]
  )
}

export function useWelcomeDialog(options?: { force?: boolean }) {
  const [haveReadWelcomDialog, setHaveReadWelcomDialog] = useLocalStorageItem<boolean>('HAVE_READ_WELCOME_DIALOG')
  const { pathname } = useRouter()
  useRecordedEffect(
    ([prevPathname]) => {
      if (haveReadWelcomDialog) return
      if (!haveReadWelcomDialog && (prevPathname === '/' || !prevPathname) && pathname !== '/') {
        setTimeout(() => {
          popWelcomeDialogFn({ onConfirm: () => setHaveReadWelcomDialog(true) })
        }, 600) // TODO: when done callback delay invoke, don't need setTimeout any more
      }
    },
    [pathname]
  )
}

export function popWelcomeDialogFn(cb?: { onConfirm: () => void }) {
  useNotification.getState().popWelcomeDialog(
    <Div>
      <Div className="text-2xl text-white text-center m-4 mb-8">Welcome to Raydium V2</Div>

      <Div className="text-[#C4D6FF] mb-4 ">
        Raydium V2 is built for a faster, more streamlined experience. However, it is{' '}
        <span className="text-[#39D0D8] font-bold">still under development</span>.
      </Div>
      <Div className="text-[#C4D6FF] mb-4 ">
        You can still use <Link href="https://v1.raydium.io/swap">V1</Link> for Raydium’s full features.
      </Div>
      <Div className="text-[#C4D6FF] mb-4 ">
        Help Raydium improve by reporting bugs <Link href="https://forms.gle/DvUS4YknduBgu2D7A">here</Link>, or in{' '}
        <Link href="https://discord.gg/raydium">Discord.</Link>
      </Div>
    </Div>,
    {
      onConfirm: () => {
        cb?.onConfirm?.()
      }
    }
  )
}
