import { inClient } from '@/functions/judgers/isSSR'

type PlatformInfo = {
  isAndroid: boolean
  isIOS: boolean
  isWechat: boolean
  isMobile: boolean
  isPc: boolean
  isMacOS: boolean
}
let platformInfo: PlatformInfo = {
  isAndroid: false,
  isIOS: false,
  isWechat: false,
  isMacOS: false,
  isMobile: false,
  isPc: false
}

if (inClient) {
  const result = getPlatformInfo()
  if (result) {
    platformInfo = result
  }
}

export function getPlatformInfo(): PlatformInfo | undefined {
  if (!inClient) return
  const ua = navigator.userAgent
  const isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1
  const isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  const isWechat = ua.indexOf('MicroMessenger') > -1
  const isMacOS = /Mac OS/i.test(ua)
  const isMobile = /(iPhone|iPad|iPod|iOS|Android)/i.test(ua)
  const isPc = !isMobile

  return {
    isAndroid,
    isIOS,
    isWechat,
    isMobile,
    isPc,
    isMacOS
  }
}

export const isMobile = platformInfo.isMobile
export const isPc = platformInfo.isPc
