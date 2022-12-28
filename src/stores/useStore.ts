import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { RealToken, RealtRepository } from 'src/api/realt.repository'
import { YamRepository } from 'src/api/yam.repository'
import _keyBy from 'lodash/keyBy'
import { YamToken } from 'src/api/Yam/GetTokens'

export interface Token extends RealToken {
  yam: YamToken;
}

export const useStore = defineStore('store', () => {
  let resolveInitialized: (value?: unknown) => void = () => undefined
  let rejectInitialized: (reason?: unknown) => void = () => undefined
  const waitInitialized = new Promise((resolve, reject) => {
    resolveInitialized = resolve
    rejectInitialized = reject
  })

  const realTokenList = ref<RealToken[]>([])
  const tokenList = ref<Token[]>([])
  const loading = ref(false)

  const tokenAddressList = computed(() => tokenList.value
    .map(token => token.blockchainAddress.contract))

  async function fetchRealToken () {
    const fullRealTokenList = await RealtRepository.getTokens()

    realTokenList.value = fullRealTokenList
      .filter(token => token.blockchainAddress.contract)
  }

  async function fetchYamDataForTokens () {
    const addresses = realTokenList.value
      .map(token => token.blockchainAddress.contract)

    const yamDataForTokens = await YamRepository.getTokens({ addresses })
    const dataMapByAddress = _keyBy(yamDataForTokens, 'address')

    tokenList.value = realTokenList.value.map(item => ({
      ...item,
      yam: dataMapByAddress[item.blockchainAddress.contract],
    }))
  }

  async function fetch () {
    loading.value = true
    try {
      await fetchRealToken()
      await fetchYamDataForTokens()
      resolveInitialized()
    } catch (error) {
      rejectInitialized(error)
    } finally {
      loading.value = false
    }
  }

  function getToken (address: string) {
    return tokenList.value.find(item =>
      address.toLowerCase() === item.blockchainAddress.contract)
  }

  async function getTokenAsync (address: string) {
    await waitInitialized
    return getToken(address)
  }

  // Initial fetch
  void fetch()

  return {
    loading,
    fetch,
    getToken,
    getTokenAsync,
    tokenList,
    tokenAddressList,
    // realTokenList,
    waitInitialized,
  }
})
