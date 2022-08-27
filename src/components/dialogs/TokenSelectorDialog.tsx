import useAppSettings from '@/application/appSettings/useAppSettings'
import { getOnlineTokenInfo } from '@/application/token/getOnlineTokenInfo'
import {
  isQuantumSOL,
  isQuantumSOLVersionSOL,
  isQuantumSOLVersionWSOL,
  QuantumSOLVersionSOL
} from '@/application/token/quantumSOL'
import { SplToken } from '@/application/token/type'
import useToken, { SupportedTokenListSettingName } from '@/application/token/useToken'
import { createSplToken } from '@/application/token/useTokenListsLoader'
import { RAYMint, USDCMint, USDTMint } from '@/application/token/wellknownToken.config'
import useWallet from '@/application/wallet/useWallet'
import Button from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'
import CoinAvatar from '@/components/CoinAvatar'
import Icon from '@/components/Icon'
import Image from '@/tempUikits/Image'
import InputBox from '@/components/InputBox'
import ResponsiveDialogDrawer from '@/tempUikits/ResponsiveDialogDrawer'
import Switcher from '@/tempUikits/Switcher'
import toPubString from '@/functions/format/toMintString'
import { isMintEqual, isStringInsensitivelyEqual } from '@/functions/judgers/areEqual'
import useAsyncValue from '@/hooks/useAsyncValue'
import useToggle from '@/hooks/useToggle'

import Input from '@/tempUikits/Input'
import List from '@/tempUikits/List'
import ListFast from '@/tempUikits/ListFast'
import { PublicKeyish } from '@raydium-io/raydium-sdk'
import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'
import { Div, cssCol, cssRow } from '@edsolater/uikit'

export type TokenSelectorProps = {
  open: boolean
  close: () => void
  onSelectCoin?: (token: SplToken) => unknown
  disableTokens?: (SplToken | PublicKeyish)[]
  /**
   * if it select WSOL it can also select SOL, if it select SOL, can also select WSOL\
   * usually used with `disableTokens`
   */
  canSelectQuantumSOL?: boolean
}

export default function TokenSelectorDialog(props: TokenSelectorProps) {
  return (
    <ResponsiveDialogDrawer
      maskNoBlur
      transitionSpeed="fast"
      placement="from-top"
      open={props.open}
      onClose={props.close}
    >
      {({ close: closePanel }) => <TokenSelectorDialogContent {...props} close={closePanel} />}
    </ResponsiveDialogDrawer>
  )
}

function TokenSelectorDialogContent({
  open,
  close: closePanel,
  onSelectCoin,
  disableTokens,
  canSelectQuantumSOL
}: TokenSelectorProps) {
  const tokenListSettings = useToken((s) => s.tokenListSettings)
  const getToken = useToken((s) => s.getToken)

  const isMobile = useAppSettings((s) => s.isMobile)
  const balances = useWallet((s) => s.balances)

  const [searchText, setSearchText] = useState('')

  // used for if panel is not tokenList but tokenlistList
  const [currentTabIsTokenList, { off, on }] = useToggle()

  const closeAndClean = useCallback(() => {
    setSearchText('')
    closePanel?.()
  }, [])

  function isTokenDisabled(candidateToken: SplToken): boolean {
    return disableTokens
      ? disableTokens.some((disableToken) => {
          if (canSelectQuantumSOL && isQuantumSOL(disableToken)) {
            if (isQuantumSOLVersionSOL(disableToken) && isQuantumSOLVersionSOL(candidateToken)) return true
            if (isQuantumSOLVersionWSOL(disableToken) && isQuantumSOLVersionWSOL(candidateToken)) return true
            return false
          }
          return isMintEqual(disableToken, candidateToken)
        })
      : false
  }

  const sourceTokens = useToken((s) => s.allSelectableTokens)
  const sortedTokens = disableTokens?.length ? sourceTokens.filter((token) => !isTokenDisabled(token)) : sourceTokens

  // by user's search text
  const originalSearchedTokens = useMemo(
    () =>
      searchText
        ? firstFullMatched(
            sortedTokens.filter((token) =>
              searchText
                .split(' ')
                .every(
                  (keyWord) =>
                    toPubString(token.id).startsWith(keyWord) ||
                    new RegExp(`^.*${keyWord.toLowerCase()}.*$`).test(token.symbol?.toLowerCase() ?? '')
                )
            ),
            searchText
          )
        : sortedTokens,
    [searchText, sortedTokens, balances]
  )
  const searchedTokens = useDeferredValue(originalSearchedTokens)

  function firstFullMatched(tokens: SplToken[], searchText: string): SplToken[] {
    const fullMatched = tokens.filter((token) => token.symbol?.toLowerCase() === searchText.toLowerCase())
    return [
      ...fullMatched,
      ...tokens.filter(
        (t) =>
          !fullMatched.some(
            (f) =>
              isMintEqual(f.mint, t.mint) &&
              isStringInsensitivelyEqual(
                f.symbol,
                t.symbol
              ) /* check mint and symbol to avoid QuantumSOL(sol and wsol has same mint) */
          )
      )
    ]
  }

  // flag for can start user add mode
  const haveSearchResult = searchedTokens.length > 0
  const onlineTokenMintInfo = useAsyncValue(
    !haveSearchResult && searchText ? getOnlineTokenInfo(searchText) : undefined,
    undefined,
    [searchText, haveSearchResult]
  )

  // some keyboard (arrow up/down / mouse hover) will change the selected index
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0)

  const userCustomizedTokenSymbol = useRef('')

  const cachedTokenList = useMemo(
    // cache for react useDeferredValue
    // "If you want to prevent a child component from re-rendering during an urgent update, you must also memoize that component with React.memo or React.useMemo:" ---- React official doc
    () => (
      <ListFast
        className="flex-grow flex flex-col px-4 mobile:px-2 mx-2 gap-2 overflow-auto my-2"
        icss={{ contentVisibility: 'auto' }}
        sourceData={searchedTokens}
        getKey={(token) => (isQuantumSOL(token) ? token.symbol : toPubString(token?.mint)) ?? 'unkey'}
        renderItem={(token, idx) => (
          <Div
            icss={cssRow()}
            className={`${
              selectedTokenIdx === idx // FIXME not re-render
                ? 'hover:clickable hover:no-clicable-transform-effect hover:clickable-mask-offset-2 hover:before:bg-[rgba(0,0,0,0.2)]'
                : ''
            }`}
            onHover={({ is: hoverStatus }) => {
              if (hoverStatus === 'start') {
                setSelectedTokenIdx(idx)
              }
            }}
          >
            <TokenSelectorDialogTokenItem
              onClick={() => {
                closeAndClean()
                onSelectCoin?.(token)
              }}
              token={token}
            />
          </Div>
        )}
      />
    ),
    [searchedTokens, selectedTokenIdx, onSelectCoin, closeAndClean, setSelectedTokenIdx]
  )

  return (
    <Card
      className="flex flex-col rounded-3xl mobile:rounded-none w-[min(468px,100vw)] mobile:w-full h-[min(680px,100vh)] mobile:h-screen border-1.5 border-[rgba(99,130,202,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card"
      size="lg"
      htmlProps={{
        onKeyDown: (e) => {
          if (e.key === 'ArrowUp') {
            setSelectedTokenIdx((s) => Math.max(s - 1, 0))
          } else if (e.key === 'ArrowDown') {
            setSelectedTokenIdx((s) => Math.min(s + 1, searchedTokens.length - 1))
          } else if (e.key === 'Enter') {
            onSelectCoin?.(searchedTokens[selectedTokenIdx])
            setTimeout(() => {
              closeAndClean()
            }, 200) // delay: give user some time to reflect the change
          }
        }
      }}
    >
      {currentTabIsTokenList ? (
        <Div className="px-8 mobile:px-6 pt-6 pb-5">
          <Div icss={cssRow()} className="justify-between items-center mb-6">
            <Icon
              className="text-primary cursor-pointer clickable clickable-mask-offset-2"
              heroIconName="chevron-left"
              onClick={off}
            />
            <Div className="text-xl font-semibold text-white">Token List Settings</Div>
            <Icon
              className="text-primary cursor-pointer clickable clickable-mask-offset-2"
              heroIconName="x"
              onClick={closeAndClean}
            />
          </Div>
          <List className="p-2 grid mt-2 overflow-auto max-h-[70vh]">
            {Object.entries(tokenListSettings)
              .map(([name]) => name as SupportedTokenListSettingName)
              .map((availableTokenListName) => (
                <List.Item key={availableTokenListName}>
                  <TokenSelectorDialogTokenListItem tokenListName={availableTokenListName} />
                </List.Item>
              ))}
          </List>
        </Div>
      ) : (
        <>
          <Div className="px-8 mobile:px-6 pt-6 pb-5">
            <Div icss={cssRow()} className="justify-between items-center mb-6">
              <Div className="text-xl font-semibold text-white">Select a token</Div>
              <Icon
                className="text-primary cursor-pointer clickable clickable-mask-offset-2"
                heroIconName="x"
                onClick={closeAndClean}
              />
            </Div>

            <Input
              value={searchText}
              placeholder="Search name or mint address"
              onUserInput={(text) => {
                setSearchText(text)
                setSelectedTokenIdx(0)
              }}
              className="py-3 px-4 rounded-xl bg-[#141041]"
              inputClassName="placeholder-[rgba(196,214,255,0.5)] text-sm text-primary"
              labelText="input for searching coins"
              suffix={<Icon heroIconName="search" size="sm" className="text-[#C4D6FF]" />}
            />

            <Div className="text-xs font-medium text-[rgba(171,196,255,.5)] my-3">Popular tokens</Div>

            <Div icss={cssRow()} className="justify-between">
              {([RAYMint, QuantumSOLVersionSOL, USDTMint, USDCMint] as const).map((mintish, idx) => {
                const token = isQuantumSOL(mintish) ? QuantumSOLVersionSOL : getToken(mintish)
                return (
                  <Div
                    icss={cssRow()}
                    key={toPubString(isQuantumSOL(mintish) ? mintish.mint : mintish)}
                    className={`gap-1 py-1 px-2 mobile:py-1.5 mobile:px-2.5 rounded ring-1 ring-inset ring-[rgba(171,196,255,.3)] items-center flex-wrap ${
                      token?.mint && isTokenDisabled(token) ? 'not-clickable' : 'clickable clickable-filter-effect'
                    }`}
                    onClick={() => {
                      if (token && isTokenDisabled(token)) return
                      closeAndClean()
                      if (token && onSelectCoin) onSelectCoin(token)
                    }}
                  >
                    <CoinAvatar size={isMobile ? 'xs' : 'sm'} token={token} />
                    <Div className="text-base mobile:text-sm font-normal text-primary">{token?.symbol ?? '--'}</Div>
                  </Div>
                )
              })}
            </Div>
          </Div>

          <Div className="mobile:mx-6 border-t-1.5 border-[rgba(171,196,255,0.2)]"></Div>

          <Div icss={cssCol()} className="flex-1 overflow-hidden border-b-1.5 py-3 border-[rgba(171,196,255,0.2)]">
            <Div icss={cssRow()} className="px-8 mobile:px-6 justify-between">
              <Div className="text-xs font-medium text-[rgba(171,196,255,.5)]">Token</Div>
              <Div icss={cssRow()} className="text-xs font-medium text-[rgba(171,196,255,.5)] items-center gap-1">
                Balance
              </Div>
            </Div>
            {haveSearchResult ? (
              cachedTokenList
            ) : onlineTokenMintInfo ? (
              <Div icss={cssCol()} className="p-8  gap-4">
                <InputBox
                  label="input a name for this token"
                  onUserInput={(text) => {
                    userCustomizedTokenSymbol.current = text
                  }}
                  onEnter={(text) => {
                    const { addUserAddedToken } = useToken.getState()
                    const newToken = createSplToken({
                      mint: searchText,
                      symbol: text,
                      decimals: onlineTokenMintInfo.decimals,
                      icon: '',
                      extensions: {},
                      name: text,
                      userAdded: true
                    })
                    addUserAddedToken(newToken)
                  }}
                />
                <Button
                  className="frosted-glass-teal"
                  onClick={() => {
                    const { addUserAddedToken } = useToken.getState()
                    const newToken = createSplToken({
                      mint: searchText,
                      symbol: userCustomizedTokenSymbol.current,
                      decimals: onlineTokenMintInfo.decimals,
                      icon: '',
                      extensions: {},
                      name: userCustomizedTokenSymbol.current,
                      userAdded: true
                    })
                    addUserAddedToken(newToken)
                  }}
                >
                  Add User Token
                </Button>
              </Div>
            ) : null}
          </Div>

          <Button type="text" className="w-full py-4 rounded-none font-bold text-xs text-primary" onClick={on}>
            View Token List
          </Button>
        </>
      )}
    </Card>
  )
}

function TokenSelectorDialogTokenItem({ token, onClick }: { token: SplToken; onClick?(): void }) {
  const userFlaggedTokenMints = useToken((s) => s.userFlaggedTokenMints)
  const canFlaggedTokenMints = useToken((s) => s.canFlaggedTokenMints)
  const userAddedTokens = useToken((s) => s.userAddedTokens)
  const isUserAddedToken = Boolean(userAddedTokens[toPubString(token.mint)])
  const toggleFlaggedToken = useToken((s) => s.toggleFlaggedToken)
  const deleteUserAddedToken = useToken((s) => s.deleteUserAddedToken)
  const getBalance = useWallet((s) => s.getBalance)
  return (
    <Div icss={cssRow()} onClick={onClick} className="group w-full gap-4 justify-between items-center p-2 ">
      <Div icss={cssRow()}>
        <CoinAvatar token={token} className="mr-2" />
        <Div icss={cssCol()} className="mr-2">
          <Div className="text-base  max-w-[7em] overflow-hidden text-ellipsis  font-normal text-primary">
            {token.symbol}
          </Div>
          <Div className="text-xs  max-w-[12em] overflow-hidden text-ellipsis whitespace-nowrap  font-medium text-[rgba(171,196,255,.5)]">
            {token.name}
          </Div>
        </Div>
        {canFlaggedTokenMints.has(toPubString(token.mint)) ? (
          <Div
            onClick={({ev}) => {
              toggleFlaggedToken(token)
              ev.stopPropagation()
            }}
            className="group-hover:visible invisible inline-block text-sm mobile:text-xs text-[rgba(57,208,216,1)]  p-2 "
          >
            {userFlaggedTokenMints.has(toPubString(token.mint)) ? '[Remove Token]' : '[Add Token]'}
          </Div>
        ) : null}
        {isUserAddedToken && !canFlaggedTokenMints.has(toPubString(token.mint)) ? (
          <Div
            onClick={({ev}) => {
              deleteUserAddedToken(token)
              ev.stopPropagation()
            }}
            className="group-hover:visible invisible inline-block text-sm mobile:text-xs text-[rgba(57,208,216,1)]  p-2 "
          >
            [Delete Token]
          </Div>
        ) : null}
      </Div>
      <Div className="text-sm text-primary justify-self-end">{getBalance(token)?.toExact?.()}</Div>
    </Div>
  )
}

function TokenSelectorDialogTokenListItem({ tokenListName }: { tokenListName: SupportedTokenListSettingName }) {
  const tokenListSettings = useToken((s) => s.tokenListSettings)
  const tokenList = tokenListSettings[tokenListName]
  const isOn = tokenListSettings[tokenListName].isOn
  const disableUserConfig = tokenListSettings[tokenListName].disableUserConfig
  const toggleTokenListName = () => {
    useToken.setState((s) => ({
      tokenListSettings: {
        ...s.tokenListSettings,
        [tokenListName]: {
          ...s.tokenListSettings[tokenListName],
          isOn: !s.tokenListSettings[tokenListName].isOn
        }
      }
    }))
  }
  if (!tokenList.mints?.size) return null
  if (tokenList.cannotbBeSeen) return null
  return (
    <Div icss={cssRow()} className="my-4 items-center">
      {tokenList?.icon && <Image className="rounded-full h-8 w-8 overflow-hidden" src={tokenList.icon} />}

      <Div icss={cssCol()}>
        <Div className="text-base font-normal text-primary">{tokenListName}</Div>
        {tokenList && (
          <Div className="text-sm font-medium text-[rgba(171,196,255,.5)]">{tokenList.mints?.size ?? '--'} tokens</Div>
        )}
      </Div>

      <Switcher disable={disableUserConfig} className="ml-auto" defaultChecked={isOn} onToggle={toggleTokenListName} />
    </Div>
  )
}
