import { Trans } from '@lingui/macro'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import AnimatedDropdown from 'components/AnimatedDropdown'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { darken } from 'polished'
import { ReactNode, useState } from 'react'
import { ChevronDown, Info } from 'react-feather'
import { InterfaceTrade } from 'state/routing/types'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { TYPE } from 'theme'

import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import GasEstimateBadge from './GasEstimateBadge'
import { ResponsiveTooltipContainer } from './styleds'
import SwapRoute from './SwapRoute'
import TradePrice from './TradePrice'

const Wrapper = styled(Row)`
  width: 100%;
  justify-content: center;
  width: 100%;
`

const StyledInfoIcon = styled(Info)`
  height: 16px;
  width: 16px;
  margin-right: 4px;
  color: ${({ theme }) => theme.text3};
`

const StyledHeaderRow = styled(RowBetween)`
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  align-items: center;
  cursor: pointer;
  min-height: 40px;

  :hover {
    background-color: ${({ theme }) => darken(0.015, theme.bg1)};
  }
`

const RotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`

const StyledPolling = styled.div`
  display: flex;
  margin-left: 4px;
  height: 16px;
  width: 16px;
  align-items: center;
  color: ${({ theme }) => theme.text1};
  transition: 250ms ease color;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const StyledPollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.bg2};
  transition: 250ms ease background-color;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.text1};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  transition: 250ms ease border-color;
  left: -3px;
  top: -3px;
`

interface SwapDetailsInlineProps {
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
  syncing: boolean
  loading: boolean
  showInverted: boolean
  setShowInverted: React.Dispatch<React.SetStateAction<boolean>>
  allowedSlippage: Percent
  swapInputError: ReactNode
}

export default function SwapDetailsDropdown({
  trade,
  syncing,
  loading,
  showInverted,
  setShowInverted,
  allowedSlippage,
  swapInputError,
}: SwapDetailsInlineProps) {
  const theme = useTheme()

  // show default gas cost if no trade is loaded yet
  // const { cost: defaultGasCost, syncing: defaultSyncing, loading: defaultLoading } = useDefaultGasCostEstimate()

  const [showDetails, setShowDetails] = useState(false)

  return (
    <Wrapper>
      <AutoColumn gap="8px" style={{ width: '100%' }}>
        <StyledHeaderRow onClick={() => setShowDetails(!showDetails)}>
          <RowFixed style={{ position: 'relative' }}>
            {(loading || syncing) && !(swapInputError && !trade) ? (
              <StyledPolling>
                <StyledPollingDot>
                  <Spinner />
                </StyledPollingDot>
              </StyledPolling>
            ) : (
              <MouseoverTooltipContent
                wrap={false}
                content={
                  <ResponsiveTooltipContainer origin="top right" style={{ padding: '0' }}>
                    <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} syncing={syncing} />
                  </ResponsiveTooltipContainer>
                }
                placement="bottom"
                disableHover={showDetails}
              >
                <StyledInfoIcon />
              </MouseoverTooltipContent>
            )}
            {trade ? (
              <LoadingOpacityContainer $loading={syncing}>
                <TradePrice
                  price={trade.executionPrice}
                  showInverted={showInverted}
                  setShowInverted={setShowInverted}
                />
              </LoadingOpacityContainer>
            ) : (loading || syncing) && !swapInputError ? (
              <TYPE.main fontSize={14}>
                <Trans>Fetching best price...</Trans>
              </TYPE.main>
            ) : swapInputError ? (
              <TYPE.main color="bg3" fontSize={14}>
                {swapInputError}
              </TYPE.main>
            ) : null}
          </RowFixed>
          <RowFixed>
            {!trade ? null : !trade.gasUseEstimateUSD ? null : (
              <GasEstimateBadge gasUseEstimateUSD={trade.gasUseEstimateUSD} loading={syncing || loading} />
            )}
            <RotatingArrow stroke={theme.text3} open={showDetails} />
          </RowFixed>
        </StyledHeaderRow>
        <AnimatedDropdown open={showDetails}>
          <AutoColumn gap={showDetails ? '8px' : '0'}>
            {trade ? <SwapRoute trade={trade} syncing={syncing} /> : null}
            <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} syncing={syncing} />
          </AutoColumn>
        </AnimatedDropdown>
      </AutoColumn>
    </Wrapper>
  )
}