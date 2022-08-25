import { cssCol, Div } from '@/../../uikit/dist'
import linkTo from '@/functions/dom/linkTo'
import { LinkAddress } from '@/types/constants'
import Link from '../../tempUikits/Link'
import Row from '../../tempUikits/Row'
import Icon from '../Icon'
import PageLayoutPopoverDrawer from '../PageLayoutPopoverDrawer'

export function CommunityPopover() {
  function Item({
    text,
    iconSrc,
    href,
    onClick
  }: {
    text: string
    iconSrc: string
    href?: LinkAddress
    onClick?: (payload: { text: string; iconSrc: string; href?: LinkAddress }) => void
  }) {
    return (
      <Row
        className="gap-3 py-4 pl-4 pr-12 cursor-pointer"
        onClick={() => {
          if (href) linkTo(href)
          onClick?.({ text, iconSrc, href })
        }}
      >
        <Icon iconSrc={iconSrc} />
        <Link href={href} className="text-white">
          {text}
        </Link>
      </Row>
    )
  }

  return (
    <>
      <div className="pt-3 -mb-1 mobile:mb-2 px-6 text-[rgba(171,196,255,0.5)] text-xs mobile:text-sm">COMMUNITY</div>
      <div className="gap-3 divide-y-1.5 divide-[rgba(171,196,255,0.2)] ">
        <Item href="https://twitter.com/RaydiumProtocol" iconSrc="/icons/media-twitter.svg" text="Twitter" />
        <Item href="https://discord.gg/raydium" iconSrc="/icons/media-discord.svg" text="Discord" />
        <PageLayoutPopoverDrawer
          renderPopoverContent={({ close }) => (
            <Div icss={cssCol()} className="divide-y-1.5 max-h-[60vh] overflow-auto divide-[rgba(171,196,255,0.2)]">
              <Item
                href="https://t.me/raydiumprotocol"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (EN)"
                onClick={close}
              />
              <Item
                href="https://t.me/RaydiumChina"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (CN)"
                onClick={close}
              />
              <Item
                href="https://t.me/raydiumkorea"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (KR)"
                onClick={close}
              />
              <Item
                href="https://t.me/raydiumjapan"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (JP)"
                onClick={close}
              />
              <Item
                href="https://t.me/RaydiumSpanish"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (ES)"
                onClick={close}
              />
              <Item
                href="https://t.me/RaydiumTurkey"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (TR)"
                onClick={close}
              />
              <Item
                href="https://t.me/RaydiumVietnam"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (VN)"
                onClick={close}
              />
              <Item
                href="https://t.me/RaydiumRussian"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (RU)"
                onClick={close}
              />
              <Item
                href="https://t.me/raydiumthailand"
                iconSrc="/icons/media-telegram.svg"
                text="Telegram (TH)"
                onClick={close}
              />
            </Div>
          )}
        >
          <Row className="flex items-center justify-between">
            <Item iconSrc="/icons/media-telegram.svg" text="Telegram" />
            <Icon
              heroIconName="chevron-right"
              size="sm"
              className="justify-self-end m-2 text-[rgba(171,196,255,0.5)]"
            />
          </Row>
        </PageLayoutPopoverDrawer>

        <Item href="https://raydium.medium.com/" iconSrc="/icons/media-medium.svg" text="Medium" />
      </div>
    </>
  )
}
