<template>
  <q-page>
    <div class="q-mx-md q-my-sm text-subtitle2">
      Yam price based on the average unit cost of the last 5 purchases
    </div>
    <q-table
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :rows-per-page-options="[0]"
      row-key="uuid"
      @row-click="(event, row) => $router.push({
        name: 'TokenPage',
        params: { tokenAddress: row.blockchainAddress.contract },
      })"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { RealTokenYam } from 'src/stores/useRealTokenYamStore'
import { TableColumn } from 'src/utils/TableColumn'
import { useRealTokenYamStore } from '../stores/useRealTokenYamStore'

export default defineComponent({
  name: 'TokenListPage',
  setup () {
    const store = useRealTokenYamStore()

    const rows = computed(() => store.tokenList)
    const loading = computed(() => store.loading)

    const columns: TableColumn<RealTokenYam>[] = [
      {
        name: 'shortName',
        label: 'Short Name',
        sortable: true,
        align: 'left',
        field: item => item.property.shortName,
      },
      {
        name: 'city',
        label: 'City',
        sortable: true,
        align: 'left',
        field: item => item.property.location.city,
      },
      {
        name: 'realtPrice',
        label: 'Realt Price',
        align: 'right',
        sortable: true,
        field: item => item.token.value,
        format: value => value.toFixed(2) + ' $',
      },
      {
        name: 'yamPrice',
        label: 'Yam Price',
        align: 'right',
        sortable: true,
        field: item => item?.yam?.unitPrice ?? NaN,
        format: (value, item) => {
          if (isNaN(value)) return 'Unknown'
          const quantity = `(${item.yam.quantity.toFixed(2)})`
          return `${quantity} @ ${value.toFixed(2)} $`
        },
      },
      {
        name: 'difference',
        label: 'Difference',
        align: 'right',
        sortable: true,
        field: item => (item?.yam?.unitPrice ?? NaN) / item.token.value,
        format: value => isNaN(value) ? 'Unknown' : (((value - 1) * 100).toFixed(2) + ' %'),
      },
      {
        name: 'realtAPR',
        label: 'Realt APR',
        align: 'right',
        sortable: true,
        field: item => +item.return.apr,
        format: value => value.toFixed(2) + ' %',
      },
      {
        name: 'yamAPR',
        label: 'Yam APR',
        align: 'right',
        sortable: true,
        field: item => item?.yam?.unitPrice
          ? item.return.perYear / item.yam.unitPrice
          : NaN,
        format: value => isNaN(value) ? 'Unknown' : ((value * 100).toFixed(2) + ' %'),
      },
      {
        name: 'rmm',
        label: 'RMM',
        align: 'center',
        sortable: true,
        field: item => !!item.blockchainAddress.rmmPoolAddress,
        format: value => value ? 'Yes' : 'No',
      },
      {
        name: 'supply',
        label: 'Supply',
        align: 'right',
        sortable: true,
        field: item => item.token.supply * item.token.value,
        format: value => value.toFixed(2) + ' $',
      },
      {
        name: 'currentMonthVolume',
        label: 'Volume this month',
        align: 'right',
        sortable: true,
        field: item => (item.yam?.currentHistoryMonths?.volume ?? 0) * item.token.value,
        format: value => value.toFixed(2) + ' $',
      },
      {
        name: 'currentMonthTransactions',
        label: 'Tx this month',
        align: 'right',
        sortable: true,
        field: item => item.yam?.currentHistoryMonths?.transactionsCount ?? 0,
      },
      {
        name: 'lastMonthVolume',
        label: 'Volume last month',
        align: 'right',
        sortable: true,
        field: item => (item.yam?.lastHistoryMonths?.volume ?? 0) * item.token.value,
        format: value => value.toFixed(2) + ' $',
      },
      {
        name: 'lastMonthTransactions',
        label: 'Tx last month',
        align: 'right',
        sortable: true,
        field: item => item.yam?.lastHistoryMonths?.transactionsCount ?? 0,
      },
    ]

    return {
      rows,
      loading,
      columns,
    }
  },
})
</script>
