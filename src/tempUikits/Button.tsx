import { Button as _Button, ButtonHandle as _ButtonHandle, ButtonProps as _ButtonProps } from '@edsolater/uikit'
import LoadingCircleSmall from './LoadingCircleSmall'

/**********************************************************
 * DONE have extends uikit's <Button>     *
 **********************************************************/
export interface ButtonProps extends Omit<_ButtonProps, 'variant'> {
  type?: 'solid' | 'outline' | 'text'
  /** unused tailwind style class string will be tree-shaked  */
  isLoading?: boolean
}

export type ButtonHandle = _ButtonHandle

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
