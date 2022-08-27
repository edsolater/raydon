import React from 'react'
import useAppSettings from '@/application/appSettings/useAppSettings'
import { eq } from '@/functions/numberish/compare'
import { div, mul } from '@/functions/numberish/operations'
import { toString } from '@/functions/numberish/toString'
import Icon from '../Icon'
import Input from '../../tempUikits/Input'
import Tooltip from '../../tempUikits/Tooltip'
import { Div, cssRow } from '@edsolater/uikit'

export function SlippageTolerancePopover() {
  const slippageTolerance = useAppSettings((s) => s.slippageTolerance)
  const slippageToleranceState = useAppSettings((s) => s.slippageToleranceState)
  return (
    <Div className="py-5 px-6">
      <Div icss={cssRow()} className="items-center mb-3 mobile:mb-6 gap-2">
        <Div className="text-[rgba(171,196,255,0.5)] text-xs mobile:text-sm">SLIPPAGE TOLERANCE</Div>
        <Tooltip placement="bottom-right">
          <Icon size="sm" heroIconName="question-mark-circle" className="cursor-help text-[rgba(171,196,255,0.5)]" />
          <Tooltip.Panel>The maximum difference between your estimated price and execution price</Tooltip.Panel>
        </Tooltip>
      </Div>
      <Div icss={cssRow()} className="gap-3 justify-between">
        <Div
          className={`py-1 px-3 bg-[#141041] rounded-full text-[#F1F1F2] font-medium text-sm ${
            eq(slippageTolerance, 0.001) ? 'ring-1 ring-inset ring-[#39D0D8]' : ''
          } cursor-pointer`}
          onClick={() => {
            useAppSettings.setState({ slippageTolerance: '0.001' })
          }}
        >
          0.1%
        </Div>
        <Div
          className={`py-1 px-3 bg-[#141041] rounded-full text-[#F1F1F2] font-medium text-sm ${
            eq(slippageTolerance, 0.005) ? 'ring-1 ring-inset ring-[#39D0D8]' : ''
          } cursor-pointer`}
          onClick={() => {
            useAppSettings.setState({ slippageTolerance: '0.005' })
          }}
        >
          0.5%
        </Div>
        <Div
          className={`py-1 px-3 bg-[#141041] rounded-full text-[#F1F1F2] font-medium text-sm ${
            eq(slippageTolerance, 0.01) ? 'ring-1 ring-inset ring-[#39D0D8]' : ''
          } cursor-pointer`}
          onClick={() => {
            useAppSettings.setState({ slippageTolerance: '0.01' })
          }}
        >
          1%
        </Div>
        <Div
          className={`py-1 px-3 bg-[#141041] rounded-full text-[#F1F1F2] font-medium text-sm ${
            !(eq(slippageTolerance, 0.001) || eq(slippageTolerance, 0.005) || eq(slippageTolerance, 0.01))
              ? 'ring-1 ring-inset ring-[#39D0D8]'
              : ''
          }`}
        >
          <Div icss={cssRow()}>
            <Input
              className="w-[32px]"
              value={toString(mul(slippageTolerance, 100), { decimalLength: 'auto 2' })}
              onUserInput={(value) => {
                const n = div(parseFloat(value || '0'), 100)
                if (n) {
                  useAppSettings.setState({ slippageTolerance: n })
                }
              }}
              pattern={/^\d*\.?\d*$/}
            />
            <Div>%</Div>
          </Div>
        </Div>
      </Div>
      {(slippageToleranceState === 'invalid' || slippageToleranceState === 'too small') && (
        <Div
          className={`mt-4 mobile:mt-6 ${
            slippageToleranceState === 'invalid' ? 'text-[#DA2EEF]' : 'text-[#D8CB39]'
          } text-xs mobile:text-sm`}
        >
          {slippageToleranceState === 'invalid'
            ? 'Please enter a valid slippage percentage'
            : 'Your transaction may fail'}
        </Div>
      )}
    </Div>
  )
}
