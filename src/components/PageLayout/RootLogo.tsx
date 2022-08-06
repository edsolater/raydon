import { Image } from '@edsolater/uikit'
import Link from '@/tempUikits/Link'

/**
 * for easier to code and read
 *
 * TEMP: add haveData to fix scrolling bug
 *
 * depend component:
 * - {@link SideMenu `<SideMenu>`}
 * - {@link TopNavbar `<TopNavbar>`}
 * - {@link VersionTooOldDialog `<VersionTooOldDialog>`}
 */
export function RootLogo() {
  return (
    <Link href="/">
      <Image className="cursor-pointer" src="/logo/logo-with-text.svg" />
    </Link>
  )
}
