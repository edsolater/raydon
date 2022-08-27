import { Div } from '@edsolater/uikit'
import './loading-circle-small.css'
export default function LoadingCircleSmall({ className }: { className?: string }) {
  return (
    <Div className={`lds-roller-sm ${className ?? ''}`}>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
    </Div>
  )
}
