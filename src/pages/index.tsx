import { Div, cssCol, cssRow } from '@edsolater/uikit'
import useAppSettings from '@/application/appSettings/useAppSettings'
import { useHomeInfo } from '@/application/homeInfo'
import Icon from '@/components/Icon'
import linkTo from '@/functions/dom/linkTo'
import useDocumentMetaTitle from '@/hooks/useDocumentMetaTitle'
import { useDocumentScrollActionDetector } from '@/hooks/useScrollActionDetector'
import Button from '@/tempUikits/Button'
import Card from '@/tempUikits/Card'

import Grid from '@/tempUikits/Grid'
import Image from '@/tempUikits/Image'
import Link from '@/tempUikits/Link'
import NumberJelly from '@/tempUikits/NumberJelly'
import Tooltip from '@/tempUikits/Tooltip'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

function HomePageContainer({ children }: { children?: ReactNode }) {
  useDocumentScrollActionDetector()
  useDocumentMetaTitle('Raydium')
  return (
    <Div
      className="flow-root overflow-x-hidden"
      style={{
        backgroundColor: '#141041',
        backgroundImage: "url('/backgroundImages/home-page-bg-lights.webp')",
        backgroundSize: '100% 95%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {children}
    </Div>
  )
}

function HomePageNavbar() {
  const isMobile = useAppSettings((s) => s.isMobile)
  const { push } = useRouter()
  return (
    <Div icss={cssRow()} className="justify-between mobile:justify-center py-12 px-[min(160px,8vw)]">
      <Image src="/logo/logo-with-text.svg" />
      {!isMobile && (
        <Button
          className="frosted-glass-teal"
          onClick={() => {
            push('/swap')
          }}
        >
          Launch app
        </Button>
      )}
    </Div>
  )
}

function HomePageSection0() {
  const isMobile = useAppSettings((s) => s.isMobile)
  const { push } = useRouter()
  const { tvl, totalvolume } = useHomeInfo()
  return (
    <section className="grid-child-center grid-cover-container mb-16 relative">
      <Image src="/backgroundImages/home-bg-element-1.png" className="w-[744px] mobile:w-[394px]" />
      <Div className="grid-cover-content children-center">
        <Div className="font-light text-[64px] mobile:text-[30px] text-white mb-4 mt-14 mobile:mt-9 leading-[60px] mobile:leading-[32px]">
          An avenue for <br />
          the evolution of{' '}
          <span
            className="font-bold text-transparent bg-clip-text"
            style={{
              background: 'radial-gradient(circle at top right,#39d0d8,#2b6aff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text'
            }}
          >
            DeFi
          </span>
        </Div>
        <Div className="font-normal text-xl mobile:text-base text-[#adc6ff] mb-6">
          Light-speed <b>swaps</b>. Next-level <b>liquidity</b>. {isMobile ? <br /> : ''} Friction-less <b>yield</b>.
        </Div>
        {/* two button */}
        <Div icss={cssRow()} className="gap-8 mobile:gap-4 mb-16 mobile:mb-6 grid grid-cols-2-fr">
          <Button
            className="home-rainbow-button-bg text-white mobile:text-xs px-5 mobile:px-4"
            onClick={() => {
              push('/swap')
            }}
          >
            <Div icss={cssRow()} className="items-center gap-2">
              <Div>Launch app</Div>
              <Icon heroIconName="chevron-right" size="xs" />
            </Div>
          </Button>

          <Button
            className="frosted-glass-teal text-white mobile:text-xs px-5 mobile:px-4 forsted-blur"
            onClick={() => {
              linkTo('https://raydium.gitbook.io/raydium/')
            }}
          >
            <Div icss={cssRow()} className="items-center gap-2">
              <Div>Read docs</Div>
              <Icon iconSrc="/icons/gitbook.svg" size="sm" />
            </Div>
          </Button>
        </Div>
        {/* two panels */}
        <Div icss={cssRow()} className="gap-6 mobile:gap-3 mb-9 grid grid-cols-2-fr">
          <Card className="frosted-glass-smoke forsted-blur-sm rounded-3xl mobile:rounded-2xl p-6 mobile:py-3 mobile:px-6 mobile:min-w-[156px] min-w-[250px] tablet:min-w-[250px]">
            <Div className="text-sm text-[#adc6ff] mb-1 mobile:text-[8px]">TOTAL VALUE LOCKED</Div>
            {/* value */}
            <Div
              icss={cssRow()}
              className="justify-center text-xl mobile:text-xs font-normal text-white tracking-widest mobile:tracking-wider"
            >
              <Div className="mr-1">$</Div>
              {tvl && (
                <NumberJelly
                  fractionLength={0}
                  eachLoopDuration={400}
                  totalDuration={8 * 60 * 1000}
                  maxDeltaPercent={0.05}
                  currentValue={tvl}
                  initValue={tvl ? 0.999 * tvl : undefined}
                />
              )}
            </Div>
          </Card>

          <Card className="frosted-glass-smoke forsted-blur-sm rounded-3xl mobile:rounded-2xl p-6 mobile:py-3 mobile:px-6 mobile:min-w-[156px] min-w-[250px] tablet:min-w-[250px]">
            <Div className="text-sm text-[#adc6ff] mb-1 mobile:text-[8px]">TOTAL TRADING VOLUME</Div>
            {/* value */}
            <Div
              icss={cssRow()}
              className="justify-center text-xl mobile:text-xs font-normal text-white tracking-widest mobile:tracking-wider"
            >
              <Div className="mr-1">$</Div>
              {totalvolume && (
                <NumberJelly
                  fractionLength={0}
                  eachLoopDuration={200}
                  totalDuration={8 * 60 * 1000}
                  maxDeltaPercent={0.05}
                  currentValue={totalvolume}
                  initValue={totalvolume ? 0.999 * totalvolume : undefined}
                />
              )}
            </Div>
          </Card>
        </Div>
        <Image src="/logo/build-on-slogan.svg" className="transform mobile:scale-75" />
      </Div>
    </section>
  )
}

function HomePageSection1() {
  const { push } = useRouter()
  return (
    <section
      className="grid-child-center overflow-hidden relative mx-auto tablet:mx-5 px-24 tablet:p-8 max-w-[1320px] min-h-[506px] hidden rounded-[100px] mobile:rounded-[40px]"
      style={{
        background:
          "radial-gradient(at center top, transparent 20%, hsl(245, 60%, 16%, 0.2)), url('/backgroundImages/home-page-section1-light.webp'), #1b1659",
        boxShadow:
          '8px 8px 10px rgba(20, 16, 65, 0.05), -8px -8px 10px rgba(197, 191, 255, 0.05), inset 0 6px 20px rgba(197, 191, 255, 0.2), inset 0 -1px 25px rgba(197, 191, 255, 0.1)',
        backgroundSize: '100% 100%'
      }}
    >
      <Div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(245.22deg, #da2eef 7.97%, #2b6aff 49.17%, #39d0d8 92.1%)',
          maskImage: "url('/backgroundImages/home-bg-element-2.png')",
          WebkitMaskImage: "url('/backgroundImages/home-bg-element-2.png')",
          maskSize: 'cover',
          WebkitMaskSize: 'cover'
        }}
      />
      <Div>
        <Div className="mb-8">
          <Div
            className="w-10 h-px my-2 mx-auto rounded-full"
            style={{ background: 'radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%)' }}
          />
          <Div className="text-lg">A suite of features powering the evolution of DeFi on Solana</Div>
        </Div>

        <Grid className="gap-5 grid-cols-4 tablet:grid-cols-2 mobile:grid-cols-1">
          <Card className="flex-1 children-center frosted-glass-lightsmoke forsted-blur-sm py-6 px-12 rounded-3xl">
            <Div className="frosted-glass-teal p-3 mb-3 rounded-xl">
              <Icon iconSrc="/icons/home-trade.svg" />
            </Div>
            <Div className="font-semibold text-lg text-white mb-2">Trade</Div>
            <Div className="font-light text-sm text-[#c4d6ff] mb-5">Swap or Trade quickly and cheaply.</Div>
            <Button
              className="frosted-glass-teal"
              onClick={() => {
                push('/swap')
              }}
            >
              Enter Exchange
            </Button>
          </Card>

          <Card className="flex-1 children-center frosted-glass-lightsmoke forsted-blur-sm py-6 px-12 rounded-3xl">
            <Div className="frosted-glass-teal p-3 mb-3 rounded-xl">
              <Icon iconSrc="/icons/home-yield.svg" />
            </Div>
            <Div className="font-semibold text-lg text-white mb-2">Yield</Div>
            <Div className="font-light text-sm text-[#c4d6ff] mb-5">Earn yield through fees and yield farms.</Div>
            <Button
              className="frosted-glass-teal"
              onClick={() => {
                push('/farms')
              }}
            >
              Enter Farms
            </Button>
          </Card>

          <Card className="flex-1 children-center frosted-glass-lightsmoke forsted-blur-sm py-6 px-12 rounded-3xl">
            <Div className="frosted-glass-teal p-3 mb-3 rounded-xl">
              <Icon iconSrc="/icons/home-pool.svg" />
            </Div>
            <Div className="font-semibold text-lg text-white mb-2">Pool</Div>
            <Div className="font-light text-sm text-[#c4d6ff] mb-5">Provide liquidity for any SPL token.</Div>
            <Button
              className="frosted-glass-teal"
              onClick={() => {
                push('/liquidity/add')
              }}
            >
              Add Liquidity
            </Button>
          </Card>

          <Card className="flex-1 children-center frosted-glass-lightsmoke forsted-blur-sm py-6 px-12 rounded-3xl">
            <Div className="frosted-glass-teal p-3 mb-3 rounded-xl">
              <Icon iconSrc="/icons/home-acceleraytor.svg" />
            </Div>
            <Div className="font-semibold text-lg text-white mb-2">AcceleRaytor</Div>
            <Div className="font-light text-sm text-[#c4d6ff] mb-5">Launchpad for new Solana projects.</Div>
            <Button
              className="frosted-glass-teal"
              onClick={() => {
                push('https://v1.raydium.io/acceleRaytor')
              }}
            >
              View Projects
            </Button>
          </Card>
        </Grid>
      </Div>
    </section>
  )
}

function HomePageSection2() {
  const isMobile = useAppSettings((s) => s.isMobile)
  const isTablet = useAppSettings((s) => s.isTablet)

  return (
    <section className="grid-child-center grid-cover-container">
      <Div
        className="w-screen h-full"
        style={{
          background:
            isMobile || isTablet
              ? "url('/backgroundImages/home-bg-element-4.png') 0% 0% / 100% 100%"
              : "url('/backgroundImages/home-bg-element-3.png') 0% 0% / 100% 100%"
        }}
      />
      <Div className="max-w-[1220px] px-14 tablet:px-4 mt-28 mx-16 tablet:mx-4 mb-44">
        <Div className="mb-8">
          <Div
            className="w-10 h-px my-2 mx-auto rounded-full"
            style={{ background: 'radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%)' }}
          />
          <Div className="text-lg">Raydium provides Ecosystem-Wide Liquidity for users and projects</Div>
        </Div>

        <Grid className="gap-6 grid-cols-3 tablet:grid-cols-1 mobile:grid-cols-1 justify-items-center">
          <Card
            className="max-w-[356px] grid children-center frosted-glass-smoke  forsted-blur-sm py-6 px-10 rounded-3xl"
            style={{
              gridTemplateRows: 'auto auto 1fr',
              alignItems: 'normal'
            }}
          >
            <Div className="frosted-glass-teal p-3 mb-3 rounded-xl">
              <Icon iconSrc="/icons/home-order-book-AMM.svg" />
            </Div>
            <Div className="font-semibold text-lg text-white mb-2">Order Book AMM</Div>
            <Div className="font-light text-[#c4d6ff] mb-5">
              Raydium{"'"}s AMM interacts with Serum{"'"}s central limit order book, meaning that pools have access to
              all order flow and liquidity on Serum, and vice versa.
            </Div>
          </Card>

          <Card
            className="max-w-[356px] grid children-center frosted-glass-smoke  forsted-blur-sm py-6 px-10 rounded-3xl"
            style={{
              gridTemplateRows: 'auto auto 1fr',
              alignItems: 'normal'
            }}
          >
            <Div className="frosted-glass-teal p-3 mb-3 rounded-xl">
              <Icon iconSrc="/icons/home-yield.svg" />
            </Div>
            <Div className="font-semibold text-lg text-white mb-2">Best Price Swaps</Div>
            <Div className="font-light text-[#c4d6ff] mb-5">
              Raydium determines whether swapping within a liquidity pool or through the Serum order book will provide
              the best price for the user, and executes accordingly.
            </Div>
          </Card>

          <Card
            className="max-w-[356px] grid children-center frosted-glass-smoke  forsted-blur-sm py-6 px-10 rounded-3xl"
            style={{
              gridTemplateRows: 'auto auto 1fr',
              alignItems: 'normal'
            }}
          >
            <Div className="frosted-glass-teal p-3 mb-3 rounded-xl">
              <Icon iconSrc="/icons/home-pool.svg" />
            </Div>
            <Div className="font-semibold text-lg text-white mb-2">High-Liquidity Launches</Div>
            <Div className="font-light text-[#c4d6ff] mb-5">
              AcceleRaytor offers projects a straightforward 3 step process to raise funds and bootstrap liquidity on
              Raydium and Serum.
            </Div>
          </Card>
        </Grid>
      </Div>
    </section>
  )
}

function HomePageSection3() {
  return (
    <section className="children-center mb-24">
      <Div className="mb-8">
        <Div className="text-lg">Partners</Div>
        <Div
          className="w-10 h-px my-2 mx-auto rounded-full"
          style={{ background: 'radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%)' }}
        />
      </Div>
      <Div
        icss={cssRow()}
        className="w-full justify-around px-56 tablet:px-0 mobile:px-0 tablet:grid mobile:grid gap-16"
      >
        <Image src="/logo/solana-text-logo.svg" />
        <Image src="/logo/serum-text-logo.svg" />
      </Div>
    </section>
  )
}

function HomePageFooter() {
  const isMobile = useAppSettings((s) => s.isMobile)
  const isTablet = useAppSettings((s) => s.isTablet)
  return (
    <footer
      className="pt-56 overflow-hidden"
      style={{
        background:
          isTablet || isMobile
            ? "url('/backgroundImages/home-footer-bg.webp') 0 0 / auto 100%"
            : "url('/backgroundImages/home-footer-bg.webp') 0 0 / 100% 100%"
      }}
    >
      <Grid className="mobile:gap-14 justify-around px-[10%] grid-cols-4 tablet:grid-cols-3 mobile:grid-cols-1 gap-16">
        <Div>
          <Div className="mb-8">
            <Div className="text-sm mb-3 tablet:text-center">ABOUT</Div>
            <Div
              className="w-6 h-px my-2 rounded-full tablet:mx-auto"
              style={{ background: 'radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%)' }}
            />
          </Div>
          <Div icss={cssCol()} className="gap-6">
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://raydium.gitbook.io/raydium/"
            >
              Documentation
            </Link>
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://coinmarketcap.com/currencies/raydium/"
            >
              CoinMarketCap
            </Link>
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://www.coingecko.com/en/coins/raydium"
            >
              CoinGecko
            </Link>
            <Link openInNewTab className="text-[#c4d6ff] hover:text-white tablet:text-center" href="/docs/disclaimer">
              Disclaimer
            </Link>
          </Div>
        </Div>

        <Div>
          <Div className="mb-8">
            <Div className="text-sm mb-3 tablet:text-center">PROTOCOL</Div>
            <Div
              className="w-6 h-px my-2 rounded-full tablet:mx-auto"
              style={{ background: 'radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%)' }}
            />
          </Div>
          <Div icss={cssCol()} className="gap-6">
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://forms.gle/Fjq4MiRA2qWbPyt29"
            >
              Apply for DropZone
            </Link>
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://docs.google.com/forms/d/1Mk-x0OcI1tCZzL0Lj_WY8d02dMXsc-Z2AG3AaO6W_Rc/edit#responses"
            >
              Apply for Fusion Pool
            </Link>
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://docs.google.com/forms/d/1Mk-x0OcI1tCZzL0Lj_WY8d02dMXsc-Z2AG3AaO6W_Rc/edit#responses"
            >
              Apply for AcceleRaytor
            </Link>
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://raydium.gitbook.io/raydium/permissionless/creating-a-pool"
            >
              Permissionless Pool
            </Link>
          </Div>
        </Div>

        <Div>
          <Div className="mb-8">
            <Div className="text-sm mb-3 tablet:text-center">SUPPORT</Div>
            <Div
              className="w-6 h-px my-2 rounded-full tablet:mx-auto"
              style={{ background: 'radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%)' }}
            />
          </Div>
          <Div icss={cssCol()} className="gap-6">
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://raydium.gitbook.io/raydium/trading-on-serum/spl-wallets"
            >
              Getting Started on Raydium
            </Link>
            <Link
              className="text-[#c4d6ff] hover:text-white tablet:text-center"
              href="https://raydium.gitbook.io/raydium/trading-on-serum/faq"
            >
              FAQ
            </Link>
          </Div>
        </Div>

        <Div className="tablet:col-span-full tablet:justify-self-center">
          <Div className="mb-8 tablet:hidden">
            <Div className="text-sm mb-3">COMMUNITY</Div>
            <Div
              className="w-6 h-px my-2 rounded-full"
              style={{ background: 'radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%)' }}
            />
          </Div>
          <Grid className="flex flex-col tablet:flex-row gap-6 tablet:gap-10">
            <Link className="text-[#c4d6ff] hover:text-white" href="https://twitter.com/RaydiumProtocol">
              <Div icss={cssRow()} className="items-center gap-2">
                <Icon
                  className="frosted-glass-teal p-1.5 rounded-lg text"
                  iconClassName="w-5 h-5 tablet:w-6 tablet:h-6"
                  iconSrc="icons/media-twitter.svg"
                />
                <Div className="tablet:hidden">Twitter</Div>
              </Div>
            </Link>
            <Link className="text-[#c4d6ff] hover:text-white" href="https://raydium.medium.com/">
              <Div icss={cssRow()} className="items-center gap-2">
                <Icon
                  className="frosted-glass-teal p-1.5 rounded-lg text"
                  iconClassName="w-5 h-5 tablet:w-6 tablet:h-6"
                  iconSrc="icons/media-medium.svg"
                />
                <Div className="tablet:hidden">Medium</Div>
              </Div>
            </Link>
            <Link className="text-[#c4d6ff] hover:text-white" href="https://discord.gg/raydium">
              <Div icss={cssRow()} className="items-center gap-2">
                <Icon
                  className="frosted-glass-teal p-1.5 rounded-lg text"
                  iconClassName="w-5 h-5 tablet:w-6 tablet:h-6"
                  iconSrc="icons/media-discord.svg"
                />
                <Div className="tablet:hidden">Discord</Div>
              </Div>
            </Link>
            <Div icss={cssRow()} className="items-center gap-2">
              <Tooltip triggerBy="click" placement={isTablet || isMobile ? 'left' : 'right'}>
                <Div icss={cssRow()} className="text-[#c4d6ff] hover:text-white items-center gap-1 cursor-pointer">
                  <Icon
                    className="frosted-glass-teal p-1.5 rounded-lg text"
                    iconClassName="w-5 h-5 tablet:w-6 tablet:h-6"
                    iconSrc="/icons/media-telegram.svg"
                  />
                  <Div className="tablet:hidden">Telegram</Div>
                  <Icon size="sm" heroIconName="chevron-down" />
                </Div>
                <Tooltip.Panel>
                  <Div icss={cssCol()} className="divide-y-1.5">
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/raydiumprotocol"
                    >
                      Telegram (EN)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/RaydiumChina"
                    >
                      Telegram (CN)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/raydiumkorea"
                    >
                      Telegram (KR)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/raydiumjapan"
                    >
                      Telegram (JP)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/RaydiumSpanish"
                    >
                      Telegram (ES)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/RaydiumTurkey"
                    >
                      Telegram (TR)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/RaydiumVietnam"
                    >
                      Telegram (VN)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/RaydiumRussian"
                    >
                      Telegram (RU)
                    </Link>
                    <Link
                      className="border-[rgba(196,214,255,0.1)] text-[#c4d6ff] hover:text-white p-2 whitespace-nowrap text-sm"
                      href="https://t.me/raydiumthailand"
                    >
                      Telegram (TH)
                    </Link>
                  </Div>
                </Tooltip.Panel>
              </Tooltip>
            </Div>
          </Grid>
        </Div>
      </Grid>

      <Image className="mx-auto p-20 transform scale-125 pointer-events-none" src="/logo/logo-with-text.svg" />
    </footer>
  )
}

export default function HomePage() {
  return (
    <HomePageContainer>
      <HomePageNavbar />
      <HomePageSection0 />
      <HomePageSection1 />
      <HomePageSection2 />
      <HomePageSection3 />
      <HomePageFooter />
    </HomePageContainer>
  )
}
