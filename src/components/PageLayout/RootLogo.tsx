import { DivProps, Image } from '@edsolater/uikit'
import Link from '@/tempUikits/Link'

export function RootLogo({ ...restProps }: DivProps) {
  return (
    <Link {...restProps} href="/">
      <Image className="cursor-pointer" src="/logo/logo-with-text.svg" />
    </Link>
  )
}
