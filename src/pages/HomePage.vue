<template>
  <q-page class="q-ma-md">
    <template v-if="globalStats">
      <div class="row q-col-gutter-md items-stretch">
        <div class="col-12 col-md-6">
          <top-token-volumes :model-value="globalStats" class="full-height" />
        </div>
        <div class="col-12 col-md-6">
          <top-accounts :model-value="globalStats" class="full-height" />
        </div>
        <div class="col-12 col-md-6">
          <top-seller-accounts :model-value="globalStats" class="full-height" />
        </div>
        <div class="col-12 col-md-6">
          <top-buyer-accounts :model-value="globalStats" class="full-height" />
        </div>
      </div>

      <transaction-statistic-chart :model-value="globalStats" />
    </template>

    <div style="white-space: pre;">
      {{ globalStatsJSON }}
    </div>

    <div>
      Subgraph used: <a :href="subgraphLink" target="_blank" v-text="subgraphLink" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { YamRepository } from 'src/api/yam.repository'
import { GlobalStats } from 'src/api/Yam/GetGlobalStats'
import { getChain } from 'src/services/CurrentChain'
import TopTokenVolumes from 'src/components/TopTokenVolumes.vue'
import TopSellerAccounts from 'src/components/TopSellerAccounts.vue'
import TopBuyerAccounts from 'src/components/TopBuyerAccounts.vue'
import TopAccounts from 'src/components/TopAccounts.vue'
import TransactionStatisticChart from 'src/components/statistics/TransactionStatisticChart.vue'

export default defineComponent({
  name: 'HomePage',
  components: {
    TopTokenVolumes,
    TopSellerAccounts,
    TopBuyerAccounts,
    TopAccounts,
    TransactionStatisticChart,
  },
  setup () {
    const globalStats = ref<GlobalStats | undefined>(undefined)
    const loading = ref(false)

    async function fetch () {
      loading.value = true
      const currentMonthDate = new Date()
      const lastMonthDate = new Date()
      lastMonthDate.setMonth(currentMonthDate.getMonth() - 1)

      try {
        globalStats.value = await YamRepository.getGlobalStats({
          currentMonthYear: currentMonthDate.getFullYear().toString(),
          currentMonth: (currentMonthDate.getMonth() + 1).toString().padStart(2, '0'),
          lastMonthYear: lastMonthDate.getFullYear().toString(),
          lastMonth: (lastMonthDate.getMonth() + 1).toString().padStart(2, '0'),
        })
      } finally {
        loading.value = false
      }
    }

    const topBuyerCurrentMonth = computed(() => globalStats.value?.topBuyerCurrentMonth ?? [])
    const topBuyerLastMonth = computed(() => globalStats.value?.topBuyerLastMonth ?? [])

    const topSellerCurrentMonth = computed(() => globalStats.value?.topSellerCurrentMonth ?? [])
    const topSellerLastMonth = computed(() => globalStats.value?.topSellerLastMonth ?? [])

    const topAccountCurrentMonth = computed(() => globalStats.value?.topAccountCurrentMonth ?? [])
    const topAccountLastMonth = computed(() => globalStats.value?.topAccountLastMonth ?? [])

    const subgraphLink = computed(() => getChain().subgraph.url)

    void fetch()

    return {
      globalStats,
      globalStatsJSON: computed(() => JSON.stringify(globalStats.value?.statistic, null, 4)),
      loading,
      topBuyerCurrentMonth,
      topBuyerLastMonth,
      topSellerCurrentMonth,
      topSellerLastMonth,
      topAccountCurrentMonth,
      topAccountLastMonth,
      subgraphLink,
    }
  },
})
</script>

<style lang="sass" scoped>
table, th, td
  border: 1px solid black
  border-collapse: collapse
</style>
