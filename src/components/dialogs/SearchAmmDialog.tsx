import React, { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { findTokenMintByAmmId, findTokenMintByMarketId } from '@/application/liquidity/miscToolFns'
import useLiquidity from '@/application/liquidity/useLiquidity'
import useNotification from '@/application/notification/useNotification'
import Icon from '@/components/Icon'
import assert from '@/functions/assert'
import { isValidPublicKey } from '@/functions/judgers/dateType'
import Button, { ButtonHandle } from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'
import Dialog from '@/tempUikits/Dialog'
import { cssRow, Div } from '@edsolater/uikit'
import InputBox from '../InputBox'
import { tokenAtom } from '@/application/token'

export function SearchAmmDialog({
  open,
  onClose,
  className
}: {
  open: boolean
  onClose: () => void
  className?: string
}) {
  const [searchText, setSearchText] = React.useState('')
  const buttonComponentRef = useRef<ButtonHandle>()

  const parseTokensFromSearchInput = async (currentValue: string) => {
    try {
      const { getToken } = tokenAtom.get()
      assert(isValidPublicKey(currentValue), 'Invalid public key')

      const ammFindResult = findTokenMintByAmmId(currentValue.trim())
      if (ammFindResult) {
        useLiquidity.setState({
          coin1: getToken(ammFindResult.base),
          coin2: getToken(ammFindResult.quote),
          ammId: currentValue.trim()
        })
        return
      }

      const marketFindResult = await findTokenMintByMarketId(currentValue.trim())
      if (marketFindResult) {
        useLiquidity.setState({ coin1: getToken(marketFindResult.base), coin2: getToken(marketFindResult.quote) })
        return
      }

      throw new Error(`Fail to extract info throungh this AMMId or MarketId`)
    } catch (err) {
      const { logError } = useNotification.getState()
      logError(String(err))
      throw err
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      {({ close: closeDialog }) => (
        <Card
          className={twMerge(
            'backdrop-filter backdrop-blur-xl p-8 rounded-3xl w-[min(456px,90vw)] border-1.5 border-[rgba(171,196,255,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card',
            className
          )}
          size="lg"
        >
          <Div icss={cssRow()} className="justify-between items-center mb-6">
            <Div className="text-xl font-semibold text-white">Pool Search</Div>
            <Icon className="text-primary cursor-pointer" heroIconName="x" onClick={closeDialog} />
          </Div>

          <InputBox
            className="mb-6"
            label="AMM ID or Serum market ID"
            onUserInput={setSearchText}
            onEnter={(currentValue) => {
              parseTokensFromSearchInput(currentValue)
                .then(() => closeDialog())
                .catch(() => {})
            }}
          />

          <Div icss={cssRow()} className="flex-col gap-1">
            <Button
              className="frosted-glass frosted-glass-teal"
              componentRef={buttonComponentRef}
              onClick={() => {
                parseTokensFromSearchInput(searchText)
                  .then(() => closeDialog())
                  .catch(() => {})
              }}
            >
              Search
            </Button>
          </Div>
        </Card>
      )}
    </Dialog>
  )
}
