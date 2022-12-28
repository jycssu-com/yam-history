import { defineStore } from 'pinia'
import { RealToken, RealtRepository } from 'src/api/realt.repository'
import { WaitingQueue } from 'src/utils/WaitingQueue'
import { computed, ref } from 'vue'
import _keyBy from 'lodash/keyBy'

export const useRealTokenStore = defineStore('realTokenStore', () => {
  const waitInitializedQueue = new WaitingQueue()
  const isInitialized = ref(false)

  const tokenList = ref<RealToken[]>([])
  const loading = ref(false)

  async function initialize () {
    loading.value = true
    try {
      tokenList.value = await RealtRepository.getTokens()
      isInitialized.value = true
      waitInitializedQueue.resolve()
    } catch (error) {
      waitInitializedQueue.reject(error)
    } finally {
      loading.value = false
    }
  }

  void initialize()

  const tokenAddressList = computed(() => tokenList.value
    .map(token => token.blockchainAddress.contract))

  const tokenMap = computed(() => _keyBy(tokenList.value, item => item.blockchainAddress.contract))

  function waitInitialized () {
    return isInitialized.value
      ? Promise.resolve()
      : waitInitializedQueue.wait()
  }

  function hasToken (address: string) {
    return !!tokenMap.value[address.toLowerCase()]
  }

  function getToken (address: string): RealToken | undefined {
    return tokenMap.value[address.toLowerCase()]
  }

  function getTokenAsync (address: string) {
    return waitInitialized().then(() => getToken(address))
  }

  return {
    loading,
    tokenList,
    tokenAddressList,
    waitInitialized,
    hasToken,
    getToken,
    getTokenAsync,
  }
})
