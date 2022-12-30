<template>
  <q-page>
    <div class="text-center q-ma-sm text-h6">
      All transactions on a token, with Stablecoin
    </div>

    <q-table
      :loading="loading"
      :title="title"
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="id"
    >
      <template v-slot:body-cell-seller="props">
        <q-td :props="props">
          <router-link
            :to="{ name: 'AccountTransactionsPage', params: { accountAddress: props.value } }"
          >
            {{ props.value }}
          </router-link>
        </q-td>
      </template>

      <template v-slot:body-cell-buyer="props">
        <q-td :props="props">
          <router-link
            :to="{ name: 'AccountTransactionsPage', params: { accountAddress: props.value } }"
          >
            {{ props.value }}
          </router-link>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref, watch, computed } from 'vue'
import { YamRepository } from 'src/api/yam.repository'
import { TokenTransaction } from 'src/api/Yam/GetTokenTransactions'
import { useRealTokenStore } from '../stores/useRealTokenStore'
import formatDistance from 'date-fns/formatDistance'
import { TableColumn } from 'src/utils/TableColumn'
import { RealToken } from 'src/api/realt.repository'
import { TransactionType } from 'src/api/Yam/TransactionType'

export default defineComponent({
  name: 'TokenPage',
  props: {
    tokenAddress: {
      type: String,
      required: true,
    },
  },
  setup (props) {
    const { tokenAddress } = toRefs(props)
    const store = useRealTokenStore()

    const transactions = ref<TokenTransaction[]>([])
    const token = ref<RealToken | undefined>(undefined)
    const loading = ref(false)

    async function fetch () {
      loading.value = true
      try {
        await store.waitInitialized()
        token.value = store.getToken(tokenAddress.value)
        transactions.value = await YamRepository.getTokenTransactions({ address: tokenAddress.value })
      } finally {
        loading.value = false
      }
    }

    const rows = computed(() => transactions.value.map(item => {
      const quantity = item.type === TransactionType.REALTOKENTOERC20
        ? item.quantity
        : (item.quantity * item.price)

      const price = item.type === TransactionType.REALTOKENTOERC20
        ? item.price
        : item.quantity / (item.price * item.quantity)

      return { ...item, quantity, price }
    }))

    watch(tokenAddress, fetch, { immediate: true })

    const columns: TableColumn<TokenTransaction>[] = [
      {
        name: 'date',
        label: 'Date',
        align: 'left',
        sortable: true,
        field: item => item.createdAtTimestamp * 1000,
        format: value => new Date(value).toLocaleString(),
      },
      {
        name: 'quantity',
        label: 'Quantity',
        align: 'right',
        sortable: true,
        field: item => item.quantity,
        format: value => value.toFixed(2),
      },
      {
        name: 'price',
        label: 'Price',
        align: 'right',
        sortable: true,
        field: item => item.price,
        format: value => value.toFixed(2) + ' $',
      },
      {
        name: 'difference',
        label: 'Difference Realt',
        align: 'right',
        sortable: true,
        field: item => item.price / (token.value?.token.value ?? 1),
        format: value => ((value - 1) * 100).toFixed(2) + ' %',
      },
      {
        name: 'total',
        label: 'Total',
        align: 'right',
        sortable: true,
        field: item => item.price * item.quantity,
        format: value => value.toFixed(2) + ' $',
      },
      {
        name: 'apr',
        label: 'APR',
        align: 'right',
        sortable: true,
        field: item => (token.value?.return.perYear ?? 0) / item.price,
        format: value => (value * 100).toFixed(2) + ' %',
      },
      {
        name: 'delay',
        label: 'Purchase delay',
        align: 'right',
        sortable: true,
        field: item => item.createdAtTimestamp - item.offerCreatedAtTimestamp,
        format: (value, item) => formatDistance(new Date(item.createdAtTimestamp * 1000), new Date(item.offerCreatedAtTimestamp * 1000), { includeSeconds: true }),
      },
      {
        name: 'seller',
        label: 'Seller',
        align: 'left',
        sortable: true,
        field: item => item.type === TransactionType.REALTOKENTOERC20
          ? item.maker
          : item.taker,
      },
      {
        name: 'buyer',
        label: 'Buyer',
        align: 'left',
        sortable: true,
        field: item => item.type === TransactionType.REALTOKENTOERC20
          ? item.taker
          : item.maker,
      },
    ]

    const title = computed(() => {
      if (!token.value) return 'Loading...'
      const name = token.value.property.name
      const value = token.value.token.value
      const apr = token.value.return.perYear / value * 100
      return `${name} - ${value.toFixed(2)} $ - ${apr.toFixed(2)} %`
    })

    return {
      loading,
      token,
      rows,
      columns,
      title,
    }
  },
})

</script>
