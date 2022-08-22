import { Button as _Button, ButtonHandle as _ButtonHandle, ButtonProps as _ButtonProps } from '@edsolater/uikit'
import LoadingCircleSmall from './LoadingCircleSmall'

export interface ButtonHandle extends _ButtonHandle {}
export interface ButtonProps extends Omit<_ButtonProps, 'variant'> {
  type?: 'solid' | 'outline' | 'text'
  /** unused tailwind style class string will be tree-shaked  */
  isLoading?: boolean
}

/** has loaded **twMerge** */
export default function Button({ type, isLoading, ...restButtonProps }: ButtonProps) {
  return (
    <_Button
      {...restButtonProps}
      variant={type}
      suffix={
        isLoading ? (
          <>
            <LoadingCircleSmall className="w-4 h-4" />
            {restButtonProps.suffix}
          </>
        ) : (
          restButtonProps.suffix
        )
      }
    />
  )
}

/** base inner <Button> style  */
function solidButtonTailwind({
  size = 'default',
  disable,
  haveFallbackClick
}: { size?: 'xs' | 'md' | 'sm' | 'lg' | 'default'; disable?: boolean; haveFallbackClick?: boolean } = {}) {
  return `${
    size === 'lg'
      ? 'px-6 py-3.5 rounded-xl font-bold'
      : size === 'sm'
      ? 'px-4 py-2 text-sm rounded-xl font-medium'
      : size === 'xs'
      ? 'px-4 py-2 text-xs rounded-xl font-medium'
      : 'px-4 py-2.5  rounded-xl font-medium'
  } whitespace-nowrap appearance-none inline-block ${
    disable
      ? `bg-formkit-thumb-disable text-formkit-thumb-text-disabled opacity-40 ${
          haveFallbackClick ? '' : 'cursor-not-allowed'
        }`
      : 'bg-formkit-thumb text-formkit-thumb-text-normal clickable clickable-filter-effect'
  }`
}

/** extra inner <Button> style */
function outlineButtonTailwind({
  size = 'default',
  disable,
  haveFallbackClick
}: { size?: 'xs' | 'md' | 'sm' | 'lg' | 'default'; disable?: boolean; haveFallbackClick?: boolean } = {}) {
  return `${
    size === 'lg'
      ? 'py-4 px-4 rounded-xl'
      : size === 'sm'
      ? 'px-2.5 py-1.5 text-sm rounded-xl'
      : size === 'xs'
      ? 'px-4 py-2 text-xs rounded-xl'
      : 'px-4 py-2.5  rounded-xl'
  } whitespace-nowrap appearance-none inline-block ring-1.5 ring-inset ring-current ${
    disable ? `opacity-40 ${haveFallbackClick ? '' : 'cursor-not-allowed'}` : 'clickable clickable-filter-effect'
  }`
}

/** extra inner <Button> style */
function textButtonTailwind({
  size = 'default',
  disable,
  haveFallbackClick
}: { size?: 'xs' | 'md' | 'sm' | 'lg' | 'default'; disable?: boolean; haveFallbackClick?: boolean } = {}) {
  return `${
    size === 'lg'
      ? 'py-4 px-4 rounded-xl'
      : size === 'sm'
      ? 'px-2.5 py-1.5 text-sm rounded-xl'
      : size === 'xs'
      ? 'px-4 py-2 text-xs rounded-xl'
      : 'px-4 py-2.5  rounded-xl'
  } whitespace-nowrap appearance-none inline-block text-white ${
    disable ? `opacity-40 ${haveFallbackClick ? '' : 'cursor-not-allowed'}` : 'clickable clickable-filter-effect'
  }`
}
