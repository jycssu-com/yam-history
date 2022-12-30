<template>
  <div>
    <div class="row items-center justify-center q-col-gutter-x-md">
      <div class="col-12 col-sm-6">
        <q-select
          v-model="displayedFields"
          :options="fieldOptions"
          multiple
          label="Values to display"
          filled
          dense
          use-chips
          class="q-mb-sm"
        />
      </div>
      <div class="col-auto">
        <q-btn-toggle
          v-model="displayedPeriod"
          no-caps
          rounded
          unelevated
          size="sm"
          :options="[
            {label: 'By days', value: 'days'},
            {label: 'By months', value: 'months'}
          ]"
        />
      </div>
      <div class="col-auto">
        <q-toggle
          v-model="isCumulative"
          label="Cumulative"
        />
      </div>
    </div>
    <div style="height: 300px">
      <canvas ref="chartRef" height="300px" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, toRefs, ref, watch, computed } from 'vue'
import { Chart, ChartDataset, registerables } from 'chart.js'
import { GlobalStats, Statistics } from 'src/api/Yam/GetGlobalStats'
Chart.register(...registerables)

const COLORS = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#000000']

interface FieldOption {
  label: string;
  value: keyof Statistics;
  color: string;
}

export default defineComponent({
  name: 'GlobalStatsChart',
  props: {
    modelValue: {
      type: Object as PropType<GlobalStats>,
      required: true,
    },
  },
  setup (props) {
    const { modelValue } = toRefs(props)

    const fieldOptions = computed<FieldOption[]>(() => ([
      { label: 'Offers created', value: 'offersCreatedCount', color: COLORS[0] },
      { label: 'Offers with price change', value: 'offersWithPriceChangesCount', color: COLORS[1] },
      { label: 'Offers deleted', value: 'offersDeletedCount', color: COLORS[2] },
      { label: 'Offers accepted', value: 'offersAcceptedCount', color: COLORS[3] },
      { label: 'Offers private', value: 'offersPrivateCount', color: COLORS[4] },
      { label: 'Offers active', value: 'offersActiveCount', color: COLORS[5] },
      { label: 'Offers empty', value: 'offersEmptyCount', color: COLORS[6] },
      { label: 'Accounts', value: 'accountsCount', color: COLORS[7] },
      { label: 'Accounts with offers', value: 'accountsWithOffersCount', color: COLORS[8] },
      { label: 'Accouts with sales', value: 'accountsWithSalesCount', color: COLORS[9] },
      { label: 'Accounts with purchases', value: 'accountsWithPurchasesCount', color: COLORS[10] },
      { label: 'Accounts with swaps', value: 'accountsWithSwapsCount', color: COLORS[11] },
      { label: 'Transactions', value: 'transactionsCount', color: COLORS[12] },
      { label: 'Trade volume', value: 'realTokenTradeVolume', color: COLORS[13] },
    ]))

    const displayedFields = ref<FieldOption[]>([
      fieldOptions.value[0],
      fieldOptions.value[12],
      fieldOptions.value[13],
    ])
    const displayedPeriod = ref('days')
    const isCumulative = ref(true)

    const chartRef = ref<HTMLCanvasElement | null>(null)

    const data = computed(() => {
      if (displayedPeriod.value === 'days') {
        return isCumulative.value
          ? modelValue.value.cumulativeStatisticsDays.slice().reverse()
          : modelValue.value.statisticsDays.slice().reverse()
      }
      return isCumulative.value
        ? modelValue.value.cumulativeStatisticsMonths.slice().reverse()
        : modelValue.value.statisticsMonths.slice().reverse()
    })

    const labels = computed(() => data.value.map(item => item.id))

    const datasets = computed(() => {
      return fieldOptions.value.map<{ id: keyof Statistics } & ChartDataset>(option => ({
        id: option.value,
        label: option.label,
        data: data.value.map(item => Math.round(item[option.value])),
        borderColor: option.color,
        backgroundColor: option.color,
      }))
    })

    const displayedDataset = computed(() => datasets.value.filter(dataset =>
      displayedFields.value.some(item => item.value === dataset.id)))

    onMounted(() => {
      if (!chartRef.value) return
      const chart = new Chart(chartRef.value, {
        type: 'line',
        data: {
          labels: labels.value,
          datasets: displayedDataset.value,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  const dataset = context.dataset as ({ id: keyof Statistics } & ChartDataset) | undefined
                  if (dataset?.id === 'realTokenTradeVolume') {
                    return `${dataset?.label}: ${context.parsed.y} tokens`
                  }
                  return `${dataset?.label}: ${context.parsed.y}`
                },
              },
            },
          },
        },
      })

      watch(displayedDataset, () => {
        chart.data.labels = labels.value
        chart.data.datasets = displayedDataset.value
        chart.update()
      })
    })

    return {
      chartRef,
      displayedFields,
      displayedPeriod,
      isCumulative,
      fieldOptions,
    }
  },
})
</script>
