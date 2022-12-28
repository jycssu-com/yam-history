<template>
  <top-card :model-value="topModelValue" title="Top Tokens Volumes" />
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, computed } from 'vue'
import { GlobalStats } from 'src/api/Yam/GetGlobalStats'
import { useRealTokenStore } from 'src/stores/useRealTokenStore'
import TopCard from './TopCard.vue'

export default defineComponent({
  name: 'TopTokenVolumes',
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
    const store = useRealTokenStore()

    function formatTopToken (itemList: { token: string; volume: number }[] = []) {
      return itemList
        .map(item => ({
          ...store.getToken(item.token),
          volume: item.volume,
        }))
        .filter(item => item.token !== undefined)
        .map(item => ({
          id: item.blockchainAddress?.contract ?? '',
          name: `${item.property?.shortName}, ${item.property?.location.city}`,
          value: `${item.volume.toFixed(2)} tokens`,
          route: {
            name: 'TokenPage',
            params: { tokenAddress: item.blockchainAddress?.contract ?? '' },
          },
        }))
        .slice(0, 5)
    }

    const topModelValue = computed(() => ({
      currentMonth: formatTopToken(modelValue.value?.topTokenCurrentMonth),
      lastMonth: formatTopToken(modelValue.value?.topTokenLastMonth),
    }))

    return {
      topModelValue,
    }
  },
})
</script>
