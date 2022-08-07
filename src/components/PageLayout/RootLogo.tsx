import { Image } from '@edsolater/uikit'
import Link from '@/tempUikits/Link'

export function RootLogo() {
  return (
    <Link href="/">
      <Image className="cursor-pointer" src="/logo/logo-with-text.svg" />
    </Link>
  )
}
