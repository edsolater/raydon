import { cssCol, cssRow, Div } from '@edsolater/uikit'
import useAppSettings from '@/application/appSettings/useAppSettings'
import { MessageBoardItem } from '@/application/messageBoard/type'
import useMessageBoard from '@/application/messageBoard/useMessageBoard'
import { isExist } from '@/functions/judgers/nil'
import Button from '../../tempUikits/Button'
import Card from '../../tempUikits/Card'
import ResponsiveDialogDrawer from '../../tempUikits/ResponsiveDialogDrawer'
import Icon from '../Icon'
import { Markdown } from '../Markdown'
import PageLayoutPopoverDrawer from '../PageLayoutPopoverDrawer'

/**
 * pure appearance component
 */
function MessageItem({
  messageBoardItem: item,
  haveReaded,
  onClick
}: {
  messageBoardItem: MessageBoardItem
  haveReaded?: boolean
  onClick?: () => void
}) {
  return (
    <Div
      icss={cssCol()}
      className="py-4 border-[rgba(171,196,255,0.2)] cursor-pointer clickable clickable-filter-effect"
      onClick={onClick}
    >
      <Div icss={cssRow()} className="gap-4 items-center">
        <Div className={`text-primary ${haveReaded ? 'opacity-40' : 'opacity-80'} font-semibold`}>{item.title}</Div>
        <Icon
          size="sm"
          className={`text-primary ${haveReaded ? 'opacity-40' : 'hidden'}`}
          heroIconName="check-circle"
        />
      </Div>
      <Div className={`text-[rgb(171,196,255)] ${haveReaded ? 'opacity-40' : 'opacity-80'} text-xs`}>
        {item.summary}
      </Div>
    </Div>
  )
}

/** this should be used in ./Navbar.tsx */
export default function MessageBoardWidget() {
  const readedIds = useMessageBoard((s) => s.readedIds)
  const messageBoardItems = useMessageBoard((s) => s.messageBoardItems)
  const currentMessageBoardItem = useMessageBoard((s) => s.currentMessageBoardItem)
  const isMobile = useAppSettings((s) => s.isMobile)

  return (
    <>
      <PageLayoutPopoverDrawer
        alwaysPopper
        popupPlacement="bottom-right"
        renderPopoverContent={({ close: closePanel }) => (
          <Div>
            <Div className="pt-3 -mb-1 mobile:mb-2 px-6 text-[rgba(171,196,255,0.5)] text-xs mobile:text-sm">
              Raydium Message Board
            </Div>
            <Div className="gap-3 divide-y-1.5 p-4">
              {messageBoardItems.map((item) => (
                <MessageItem
                  key={item.title + item.updatedAt}
                  haveReaded={readedIds.has(item.id)}
                  messageBoardItem={item}
                  onClick={() => {
                    closePanel()
                    useMessageBoard.setState({ currentMessageBoardItem: item })
                  }}
                />
              ))}
            </Div>
          </Div>
        )}
      >
        <Icon
          clickable
          size={isMobile ? 'smi' : 'md'}
          iconSrc="/icons/notification.svg"
          forceColor="var(--text-tertiary)"
        />
      </PageLayoutPopoverDrawer>
      <ResponsiveDialogDrawer
        open={isExist(currentMessageBoardItem)}
        onClose={() => {
          if (currentMessageBoardItem?.id) {
            useMessageBoard.setState((s) => ({
              readedIds: new Set(s.readedIds.add(currentMessageBoardItem.id))
            }))
          }
          useMessageBoard.setState({ currentMessageBoardItem: null })
        }}
      >
        {({ close }) => (
          <Card
            className="flex flex-col backdrop-filter backdrop-blur-xl p-8 mobile:py-4 w-[min(750px,100vw)] mobile:w-screen max-h-[min(850px,100vh)] mobile:h-screen border-1.5 border-[rgba(171,196,255,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card"
            size="lg"
          >
            <Div icss={cssRow()} className="justify-between items-center mb-6">
              <Div className="text-3xl font-semibold text-white">{currentMessageBoardItem?.title}</Div>
              <Icon className="text-primary cursor-pointer" heroIconName="x" onClick={close} />
            </Div>
            <Div className="overflow-y-auto my-4">
              <Markdown className="my-6 whitespace-pre-line mobile:text-sm">
                {currentMessageBoardItem?.details ?? ''}
              </Markdown>
            </Div>

            <Button className="frosted-glass-teal" onClick={close}>
              Mark as Read
            </Button>
          </Card>
        )}
      </ResponsiveDialogDrawer>
    </>
  )
}
