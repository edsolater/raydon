import { Div } from '@edsolater/uikit'

export default function LoadingCircle({ className }: { className?: string }) {
  return (
    <Div className={`lds-roller ${className ?? ''} mobile:scale-75`}>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
      <Div></Div>
    </Div>
  )
}
