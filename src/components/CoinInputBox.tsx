import { ReactNode, RefObject, useEffect, useImperativeHandle, useMemo, useRef } from 'react'

import useAppSettings from '@/application/appSettings/useAppSettings'
import { usePools } from '@/application/pools/usePools'
import {
  isQuantumSOL,
  isQuantumSOLVersionSOL,
  isQuantumSOLVersionWSOL,
  SOL_BASE_BALANCE,
  tokenAtom,
  WSOLMint
} from '@/application/token'
import { Token } from '@/application/token/type'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import toTotalPrice from '@/functions/format/toTotalPrice'
import toUsdVolume from '@/functions/format/toUsdVolume'
import { isTokenAmount } from '@/functions/judgers/dateType'
import { gt, gte, lt } from '@/functions/numberish/compare'
import { mul, sub } from '@/functions/numberish/operations'

import { walletAtom } from '@/application/wallet'
import toPubString from '@/functions/format/toMintString'
import { isMintEqual } from '@/functions/judgers/areEqual'
import { toString } from '@/functions/numberish/toString'
import { useSignalState } from '@/hooks/useSignalState'
import { Numberish } from '@/types/constants'
import { cssRow, Div, DivProps } from '@edsolater/uikit'
import { useXStore } from '@edsolater/xstore'
import Button from '../tempUikits/Button'
import DecimalInput from '../tempUikits/DecimalInput'
import CoinAvatar from './CoinAvatar'
import Icon from './Icon'
import { poolsAtom } from '@/application/pools/atom'

export interface CoinInputBoxHandle {
  focusInput?: () => void
  selectToken?: () => void
}

export interface CoinInputBoxProps extends DivProps {
  // basic
  componentRef?: RefObject<any>
  // data
  value?: string
  token?: Token

  // validator
  disabled?: boolean
  noDisableStyle?: boolean
  disabledTokenSelect?: boolean // if not prop:disabledTokenSelect but prop:disabled, result is disabled
  disabledInput?: boolean // if not prop:disabledInput but prop:disabled, result is disabled

  // -------- callbacks ----------
  //! include press max button
  onUserInput?(input: string): void
  onEnter?(input: string | undefined): void

  onTryToTokenSelect?(): void
  onTryToSwitchSOLWSOL?(): void
  // return valid info
  onInputAmountClampInBalanceChange?(info: { outOfMax: boolean; negative: boolean }): void
  onBlur?(input: string | undefined): void

  // -------- customized ----------
  // customize component appearance
  topLeftLabel?: ReactNode
  /** By default, it will be Balance: xxx,  */
  topRightLabel?: ReactNode
  // sometimes, should show staked deposited lp, instead of wallet balance
  maxValue?: Numberish

  /** show: 0.0 */
  hasPlaceholder?: boolean
  /**
   * in some business
   * for example, farm created in SOL, but should can edited in WSOL
   * corresponding `listener: onTryToSwitchSOLWSOL`
   */
  allowSOLWSOLSwitch?: boolean
  // used in acceleraytor (input tickets)
  hideTokenPart?: boolean
  // sometimes, U don't need price predictor, for it's not a token (may be it's lottery ticket or some pure amount input)
  hidePricePredictor?: boolean
  haveHalfButton?: boolean
  hideMaxButton?: boolean
  haveCoinIcon?: boolean
  showTokenSelectIcon?: boolean
}

// TODO: split into different customized component (to handle different use cases)
/**
 * support to input both token and lpToken
 */
export default function CoinInputBox({
  componentRef,

  disabled,
  noDisableStyle,
  disabledInput: innerDisabledInput,
  disabledTokenSelect: innerDisabledTokenSelect,

  value,
  token,
  onUserInput,
  onTryToTokenSelect,
  onTryToSwitchSOLWSOL,
  onInputAmountClampInBalanceChange,
  onEnter,
  onBlur,

  topLeftLabel,
  topRightLabel,
  maxValue: forceMaxValue,

  hasPlaceholder,
  allowSOLWSOLSwitch,
  hideTokenPart,
  hidePricePredictor,
  hideMaxButton,
  haveHalfButton,
  haveCoinIcon,
  showTokenSelectIcon,
  ...restProps
}: CoinInputBoxProps) {
  const disabledInput = disabled || innerDisabledInput
  const disabledTokenSelect = disabled || innerDisabledTokenSelect
  // if user is inputing or just input, no need to update upon out-side value
  const isOutsideValueLocked = useRef(false)
  const { connected, getBalance, tokenAccounts } = useXStore(walletAtom)
  const { tokenPrices } = useXStore(tokenAtom)
  const { lpPrices } = useXStore(poolsAtom)
  const isMobile = useAppSettings((s) => s.isMobile)

  const variousPrices = { ...lpPrices, ...tokenPrices }
  const [inputedAmount, setInputedAmount, inputAmountSignal] = useSignalState<string>() // setInputedAmount use to state , not sync, useSignalState can get sync value

  // sync outter's value and inner's inputedAmount
  useEffect(() => {
    if (isOutsideValueLocked.current) return
    setInputedAmount(value)
  }, [value])

  useEffect(() => {
    if (!isOutsideValueLocked.current) return
    if (inputedAmount !== value) {
      onUserInput?.(inputedAmount ?? '')
    }
  }, [inputedAmount])

  // input over max value in invalid
  const maxValue =
    forceMaxValue ??
    getBalance(token) ??
    (token
      ? (() => {
          const targetTokenAccount = tokenAccounts.find((t) => toPubString(t.mint) === toPubString(token?.mint))
          return targetTokenAccount && toTokenAmount(token, targetTokenAccount?.amount)
        })()
      : undefined)

  useEffect(() => {
    if (inputedAmount && maxValue) {
      onInputAmountClampInBalanceChange?.({
        negative: lt(inputedAmount, '0'),
        outOfMax: gt(inputedAmount, maxValue)
      })
    }
  }, [inputedAmount, maxValue])

  const inputRef = useRef<HTMLInputElement>(null)
  const focusInput = () => inputRef.current?.focus()

  const price = variousPrices[String(token?.mint)] ?? null

  const totalPrice = useMemo(() => {
    if (!price || !inputedAmount) return undefined
    return toTotalPrice(inputedAmount, price)
  }, [inputedAmount, price])

  // input must satisfied validPattern
  const validPattern = useMemo(() => new RegExp(`^(\\d*)(\\.\\d{0,${token?.decimals ?? 6}})?$`), [token])

  // if switch selected token, may doesn't satisfied pattern. just extract satisfied part.
  useEffect(() => {
    const satisfied = validPattern.test(inputAmountSignal() ?? '') // use signal to get sync value
    if (!satisfied) {
      const matched = inputAmountSignal()?.match(`^(\\d*)(\\.\\d{0,${token?.decimals ?? 6}})?(\\d*)$`)
      const [, validInt = '', validDecimal = ''] = matched ?? []
      const sliced = validInt + validDecimal
      setInputedAmount(sliced)
    }
  }, [token, validPattern])

  // press button will also cause user input.
  function fillAmountWithBalance(percent: number) {
    let maxBalance = maxValue
    if (isTokenAmount(maxValue) && isQuantumSOL(maxValue.token) && !isQuantumSOLVersionWSOL(maxValue.token)) {
      // if user select sol max balance is -0.05
      maxBalance = toTokenAmount(
        maxValue.token,
        gte(maxValue, SOL_BASE_BALANCE) ? sub(maxValue, SOL_BASE_BALANCE) : 0,
        {
          alreadyDecimaled: true
        }
      )
    }
    const newAmount = toString(mul(maxBalance, percent), {
      decimalLength: isTokenAmount(maxValue) ? `auto ${maxValue.token.decimals}` : undefined
    })
    onUserInput?.(newAmount) // set both outside and inside
    setInputedAmount(newAmount) // set both outside and inside
    isOutsideValueLocked.current = false
  }

  useImperativeHandle(
    componentRef,
    () =>
      ({
        focusInput: () => {
          focusInput()
        },
        selectToken: () => {
          onTryToTokenSelect?.()
        }
      } as CoinInputBoxHandle)
  )

  const canSwitchSOLWSOL = disabledTokenSelect && allowSOLWSOLSwitch && isMintEqual(token?.mint, WSOLMint)

  return (
    <Div
      {...restProps}
      icss_={{ background: 'var(--card-bg-light)' }}
      className={`flex flex-col bg-[var(--card-bg-light)] cursor-text rounded-xl py-3 px-6 mobile:px-4 ${
        disabled && !noDisableStyle ? 'pointer-events-none-entirely cursor-default opacity-50' : ''
      }`}
    >
      <Div
        icss={cssRow()}
        className={`flex-col`}
        htmlProps={{
          tabIndex: 0
        }}
        onClick={focusInput}
      >
        {/* from & balance */}
        <Div icss={cssRow()} className="justify-between mb-2 mobile:mb-4">
          <Div className="text-xs mobile:text-2xs text-[rgba(171,196,255,.5)]">{topLeftLabel}</Div>
          <Div
            className={`text-xs mobile:text-2xs justify-self-end text-[rgba(171,196,255,.5)] ${
              disabledInput ? '' : 'clickable no-clicable-transform-effect clickable-filter-effect'
            }`}
            onClick={() => {
              if (disabledInput) return
              fillAmountWithBalance(1)
            }}
          >
            {topRightLabel ?? `Balance: ${toString(maxValue) || (connected ? '--' : '(Wallet not connected)')}`}
          </Div>
        </Div>

        {/* input-container */}
        <Div icss={cssRow()} className="col-span-full items-center">
          {!hideTokenPart && (
            <>
              <Div
                icss={cssRow()}
                className={`items-center gap-1.5 ${
                  (showTokenSelectIcon && !disabledTokenSelect) || canSwitchSOLWSOL
                    ? 'clickable clickable-mask-offset-2'
                    : ''
                }`}
                onClick={({ ev }) => {
                  ev.stopPropagation()
                  ev.preventDefault()
                  if (canSwitchSOLWSOL) onTryToSwitchSOLWSOL?.()
                  if (disabledTokenSelect) return
                  onTryToTokenSelect?.()
                }}
                htmlProps={{
                  title: canSwitchSOLWSOL
                    ? isQuantumSOLVersionSOL(token)
                      ? 'switch to WSOL'
                      : 'switch to SOL'
                    : undefined
                }}
              >
                {haveCoinIcon && token && <CoinAvatar token={token} size={isMobile ? 'smi' : 'md'} />}
                <Div
                  className={`text-[rgb(171,196,255)] max-w-[7em] ${
                    token ? 'min-w-[2em]' : ''
                  } overflow-hidden text-ellipsis font-medium text-base flex-grow mobile:text-sm whitespace-nowrap`}
                >
                  {token?.symbol ?? '--'}
                </Div>
                {showTokenSelectIcon && !disabledTokenSelect && (
                  <Icon size="xs" heroIconName="chevron-down" className="text-primary" />
                )}
              </Div>
              {/* divider */}
              <Div className="my-1 mx-4 mobile:my-0 mobile:mx-2 border-r border-[rgba(171,196,255,0.5)] self-stretch" />
            </>
          )}
          <Div icss={cssRow()} className="justify-between flex-grow-2">
            <Div icss={cssRow()} className="gap-px items-center mr-2">
              {!hideMaxButton && (
                <Button
                  disabled={disabledInput}
                  theme={{ mainColor: '#3e4147a3', mainTextColor: 'rgba(171,196,255,.5)' }}
                  size="xs"
                  onClick={() => {
                    fillAmountWithBalance(1)
                  }}
                >
                  Max
                </Button>
              )}
              {haveHalfButton && (
                <Button
                  disabled={disabledInput}
                  theme={{ mainColor: '#3e4147a3', mainTextColor: 'rgba(171,196,255,.5)' }}
                  size="xs"
                  onClick={() => {
                    fillAmountWithBalance(0.5)
                  }}
                >
                  Half
                </Button>
              )}
            </Div>
            <DecimalInput
              className="font-medium text-lg text-white flex-grow w-full"
              disabled={disabledInput}
              decimalCount={token?.decimals}
              componentRef={inputRef}
              placeholder={hasPlaceholder ? '0.0' : undefined}
              value={inputedAmount}
              onUserInput={(t) => {
                setInputedAmount(String(t || ''))
              }}
              onEnter={onEnter}
              inputClassName="text-right mobile:text-sm font-medium text-white"
              onBlur={(input) => {
                isOutsideValueLocked.current = false
                onBlur?.(input || undefined)
              }}
              onFocus={() => {
                isOutsideValueLocked.current = true
              }}
            />
          </Div>
        </Div>

        {/* price-predictor */}
        {!hidePricePredictor && (
          <Div
            className={`text-xs mobile:text-2xs text-[rgba(171,196,255,.5)] ${
              !inputedAmount || inputedAmount === '0' ? 'invisible' : ''
            } text-ellipsis overflow-hidden text-right`}
          >
            {totalPrice ? toUsdVolume(totalPrice) : '--'}
          </Div>
        )}
      </Div>
    </Div>
  )
}
