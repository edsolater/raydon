import { cssCol, Div } from '@/../../uikit/dist'
import { refreshWindow } from '@/application/appVersion/forceWindowRefresh'
import { useAppVersion } from '@/application/appVersion/useAppVersion'
import { twMerge } from 'tailwind-merge'
import Button from '../../tempUikits/Button'
import Card from '../../tempUikits/Card'
import Dialog from '../../tempUikits/Dialog'

export function VersionTooOldDialog() {
  const versionRefreshData = useAppVersion((s) => s.versionFresh)
  return (
    <Dialog open={versionRefreshData === 'too-old'} canClosedByMask={false}>
      {({ close }) => (
        <Card
          className={twMerge(`p-8 rounded-3xl w-[min(480px,95vw)] mx-8 border-1.5 border-[rgba(171,196,255,0.2)]`)}
          size="lg"
          style={{
            background:
              'linear-gradient(140.14deg, rgba(0, 182, 191, 0.15) 0%, rgba(27, 22, 89, 0.1) 86.61%), linear-gradient(321.82deg, #18134D 0%, #1B1659 100%)',
            boxShadow: '0px 8px 48px rgba(171, 196, 255, 0.12)'
          }}
        >
          <Div icss={cssCol()} className="items-center">
            <div className="font-semibold text-xl text-[#D8CB39] mb-3 text-center">New version available</div>
            <div className="text-center mt-2  mb-6 text-primary">Refresh the page to update and use the app.</div>

            <div className="self-stretch">
              <Div icss={cssCol()}>
                <Button className={`text-primary  frosted-glass-teal`} onClick={() => refreshWindow({ noCache: true })}>
                  Refresh
                </Button>
                <Button className="text-primary" type="text" onClick={close}>
                  Update later
                </Button>
              </Div>
            </div>
          </Div>
        </Card>
      )}
    </Dialog>
  )
}
