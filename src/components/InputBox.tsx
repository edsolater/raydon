import { cssCol, Div } from '@edsolater/uikit'
import mergeRef from '@/functions/react/mergeRef'
import { shrinkToValue } from '@/functions/shrinkToValue'
import { ReactNode, RefObject, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import DecimalInput, { DecimalInputProps } from '../tempUikits/DecimalInput'
import Input, { InputProps } from '../tempUikits/Input'

export type InputBoxProps = {
  className?: string

  // validator
  disabled?: boolean
  noDisableStyle?: boolean

  label?: string
  labelClassName?: string

  onEnter?: InputProps['onEnter']
  /** should  attach domref want focus input by click */
  renderInput?: ((inputRef: RefObject<any>) => ReactNode) | ReactNode
} & (
  | ({ decimalMode: true } & DecimalInputProps & { inputProps?: DecimalInputProps })
  | ({ decimalMode?: false } & InputProps & { inputProps?: InputProps })
)

export default function InputBox({
  decimalMode,
  className,

  disabled,
  noDisableStyle,

  label,
  labelClassName,

  inputProps,
  renderInput,
  ...restProps // input Props
}: InputBoxProps) {
  const inputRef = useRef<HTMLElement>(null)
  function focusInput() {
    inputRef.current?.focus?.()
    inputRef.current?.click?.()
  }
  return (
    <Div
      icss={cssCol()}
      onClick={focusInput}
      className={twMerge(
        `bg-[#141041] rounded-xl py-3 px-6 cursor-text ${
          disabled && !noDisableStyle ? 'pointer-events-none-entirely cursor-default opacity-50' : ''
        }`,
        className
      )}
    >
      {label && (
        <Div
          className={twMerge(`text-xs mobile:text-2xs text-[#abc4ff80] font-medium mb-2 mobile:mb-1`, labelClassName)}
        >
          {label}
        </Div>
      )}
      {shrinkToValue(renderInput, [inputRef]) ??
        (decimalMode ? (
          <DecimalInput
            noCSSInputDefaultWidth
            {...(restProps as DecimalInputProps)}
            {...(inputProps as DecimalInputProps)}
            className={twMerge('w-full py-2 font-medium', inputProps?.className)}
            componentRef={mergeRef(inputRef, inputProps?.componentRef)}
          />
        ) : (
          <Input
            noCSSInputDefaultWidth
            {...(restProps as InputProps)}
            {...(inputProps as InputProps)}
            className={twMerge('w-full py-2 font-medium', inputProps?.className)}
            componentRef={mergeRef(inputRef, inputProps?.componentRef)}
          />
        ))}
    </Div>
  )
}
