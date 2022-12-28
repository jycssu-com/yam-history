<template>
  <top-card :model-value="topModelValue" title="Top Sellers" />
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, computed } from 'vue'
import { GlobalStats } from 'src/api/Yam/GetGlobalStats'
import TopCard from './TopCard.vue'

export default defineComponent({
  name: 'TopSellerAccounts',
  components: {
    TopCard,
  },
  props: {
    modelValue: {
      type: Object as PropType<GlobalStats>,
      required: true,
    },
  },
  setup (props) {
    const { modelValue } = toRefs(props)

    function formatTopToken (itemList: GlobalStats['topSellerCurrentMonth'][number][]) {
      return itemList.map(item => ({
        id: item.account,
        name: item.account.slice(0, 12) + '...' + item.account.slice(-10),
        value: `${item.salesCount} sales`,
        route: {
          name: 'AccountSalesPage',
          params: { accountAddress: item.account },
        },
      }))
    }

    const topModelValue = computed(() => ({
      currentMonth: formatTopToken(modelValue.value?.topSellerCurrentMonth),
      lastMonth: formatTopToken(modelValue.value?.topSellerLastMonth),
    }))

    return {
      topModelValue,
    }
  },
})
</script>
