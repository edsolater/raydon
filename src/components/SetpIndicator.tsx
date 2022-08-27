import { cssCol, cssRow, Div } from '@edsolater/uikit'
import { shrinkToValue } from '@/functions/shrinkToValue'
import { ReactNode } from 'react'

/** must set either totalSteps or stepInfos */
export default function SetpIndicator<T extends { /** start from 1  */ stepNumber: number; stepContent: ReactNode }>({
  currentStep = 1,
  stepInfos,
  onSetCurrentSetp,
  renderStepContent,
  renderStepLine,
  renderStepNumber
}: {
  defaultStep?: number
  currentStep?: number
  stepInfos: T[]
  onSetCurrentSetp?: (info: T) => void
  renderStepNumber?: ((info: T) => ReactNode) | ReactNode // just data container shouldn't render data body here, please use `stepInfos`
  renderStepLine?: ((info: T & { isLast?: boolean }) => ReactNode) | ReactNode // just data container shouldn't render data body here, please use `stepInfos`
  renderStepContent?: ((info: T) => ReactNode) | ReactNode // just data container shouldn't render data body here, please use `stepInfos`
}) {
  return (
    <Div>
      {stepInfos.map((info, index, arrs) => (
        <Div icss={cssRow()} key={index}>
          {/* bubble */}
          <Div icss={cssCol()} className="items-center">
            {shrinkToValue(renderStepNumber, [info]) || (
              <Div
                className={`grid place-items-center h-8 w-8 mobile:h-6 mobile:w-6 text-sm font-medium bg-[#141041] rounded-full ${
                  currentStep === info.stepNumber ? 'text-[#F1F1F2]' : 'text-[rgba(171,196,255,.5)]'
                } ${currentStep > info.stepNumber ? 'clickable' : ''}`}
                onClick={() => {
                  currentStep > info.stepNumber && onSetCurrentSetp?.(info)
                }}
              >
                {info.stepNumber}
              </Div>
            )}
            {shrinkToValue(renderStepLine, [Object.assign(info, { isLast: index === arrs.length - 1 })]) ||
              (index !== arrs.length - 1 && (
                <Div className="my-2 min-h-[16px] mobile:h-2 border-r-1.5 border-[rgba(171,196,255,.5)] flex-1"></Div>
              ))}
          </Div>
          <Div className="ml-2">
            {shrinkToValue(renderStepContent, [info]) || (
              <Div
                className={`text-sm font-medium ${
                  currentStep === info.stepNumber ? 'text-[#F1F1F2]' : 'text-[rgba(171,196,255,.5)]'
                } pt-1.5`}
              >
                {info.stepContent}
              </Div>
            )}
          </Div>
        </Div>
      ))}
    </Div>
  )
}
