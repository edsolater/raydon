import isClientSide from '@/functions/judgers/isSSR'

export function inWebworkerScope() {
  try {
    return globalThis instanceof DedicatedWorkerGlobalScope
  } catch {
    return false
  }
}
export function inMainThreadScope() {
  try {
    return globalThis instanceof Window
  } catch {
    return false
  }
}
