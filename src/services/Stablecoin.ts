import { getChain } from './CurrentChain'

export function getStablecoins () {
  return getChain().contracts.filter(item => item.isStable)
}

export function getStablecoinAddresses () {
  return getStablecoins().map(item => item.address)
}

export function getStablecoinSymbols () {
  return getStablecoins().map(item => item.symbol)
}

export function getStablecoinSymbol (address: string) {
  return getStablecoins()
    .find(item => item.address === address)
    ?.symbol
}

export function isStablecoinAddress (address: string) {
  return getStablecoinAddresses().includes(address)
}
