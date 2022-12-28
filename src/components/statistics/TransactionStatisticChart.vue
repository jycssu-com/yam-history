<template>
  <div style="height: 300px">
    <canvas ref="chartRef" height="300px" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, toRefs, ref, watch, computed } from 'vue'
import { getCssVar } from 'quasar'
import { Chart, ChartDataset, registerables } from 'chart.js'
import { GlobalStats } from 'src/api/Yam/GetGlobalStats'
Chart.register(...registerables)

export default defineComponent({
  name: 'TransactionStatisticChart',
  props: {
    modelValue: {
      type: Object as PropType<GlobalStats>,
      required: true,
    },
  },
  setup (props) {
    const { modelValue } = toRefs(props)
    const chartRef = ref<HTMLCanvasElement | null>(null)

    const data = computed(() => modelValue.value.statisticDays.slice().reverse())

    const labels = computed(() => data.value.map(item => item.id))

    const datasets = computed<ChartDataset[]>(() => ([
      {
        label: 'Volume',
        data: data.value.map(item => Math.round(item.realTokenTradeVolume)),
        borderColor: getCssVar('secondary') ?? '',
        backgroundColor: getCssVar('secondary') ?? '',
        order: 1,
        yAxisID: 'yVolume',
      },
      {
        label: 'Transactions',
        data: data.value.map(item => item.transactionsCount),
        borderColor: getCssVar('primary') ?? '',
        backgroundColor: getCssVar('primary') ?? '',
        type: 'line',
        order: 0,
        yAxisID: 'yTransactions',
      },
    ]))

    onMounted(() => {
      if (!chartRef.value) return
      const chart = new Chart(chartRef.value, {
        type: 'bar',
        data: {
          labels: labels.value,
          datasets: datasets.value,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yTransactions: {
              type: 'linear',
              display: true,
              position: 'left',
              grid: {
                drawOnChartArea: false,
              },
            },
            yVolume: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
            },
          },
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
                  if (context.dataset?.label === 'Volume') {
                    return `${context.dataset?.label}: ${context.parsed.y} tokens`
                  }
                  return `${context.dataset?.label}: ${context.parsed.y}`
                },
              },
            },
            title: {
              display: true,
              text: 'Transactions and Volume on the last 30 days',
            },
          },
        },
      })

      console.log(chart)

      watch(modelValue, () => chart.update())
    })

    return {
      chartRef,
    }
  },
})
</script>
