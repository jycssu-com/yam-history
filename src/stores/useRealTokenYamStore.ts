import { defineStore } from 'pinia'
import { RealToken } from 'src/api/realt.repository'
import { YamRepository } from 'src/api/yam.repository'
import { YamToken } from 'src/api/Yam/GetTokens'
import { WaitingQueue } from 'src/utils/WaitingQueue'
import { computed, ref } from 'vue'
import { useRealTokenStore } from './useRealTokenStore'
import _keyBy from 'lodash/keyBy'

export interface RealTokenYam extends RealToken {
  yam: YamToken;
}

export const useRealTokenYamStore = defineStore('realTokenYamStore', () => {
  const waitInitializedQueue = new WaitingQueue()
  const isInitialized = ref(false)

  const realtokenStore = useRealTokenStore()
  const tokenList = ref<RealTokenYam[]>([])
  const loading = ref(false)

  async function initialize () {
    loading.value = true
    try {
      await realtokenStore.waitInitialized()
      const addresses = realtokenStore.tokenAddressList
      const yamTokenList = await YamRepository.getTokens({ addresses })
      const yamTokenMap = _keyBy(yamTokenList, 'address')

      tokenList.value = realtokenStore.tokenList.map(item => ({
        ...item,
        yam: yamTokenMap[item.blockchainAddress.contract],
      }))

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

  function waitInitialized () {
    return isInitialized.value
      ? Promise.resolve()
      : waitInitializedQueue.wait()
  }

  function getToken (address: string) {
    return tokenList.value.find(token =>
      token.blockchainAddress.contract === address.toLowerCase())
  }

  function getTokenAsync (address: string) {
    return waitInitialized().then(() => getToken(address))
  }

  return {
    loading,
    tokenList,
    tokenAddressList,
    waitInitialized,
    getToken,
    getTokenAsync,
  }
})
