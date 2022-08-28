import { Dialog as _Dialog, DialogProps as _DialogProps } from '@edsolater/uikit'

export interface DialogProps extends _DialogProps {}

export default function Dialog(dialogProps: DialogProps) {
  return <_Dialog {...dialogProps} />
}
