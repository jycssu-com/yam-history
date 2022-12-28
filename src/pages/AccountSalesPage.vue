<template>
  <q-page>
    <div class="text-center q-ma-sm text-h6">
      All sales of an account, from RealToken to Stablecoin
    </div>

    <q-form class="row q-my-md items-center" @submit="onSubmit">
      <div class="col">
        <q-input
          v-model="addressField"
          label="Wallet Address"
          class="q-mx-sm"
          filled
          dense
        />
      </div>
      <div class="col-auto">
        <q-btn
          :loading="loading"
          class="q-mx-sm"
          size="sm"
          label="Submit"
          type="submit"
          color="primary"
        />
      </div>
    </q-form>

    <div class="row justify-center q-col-gutter-sm q-mb-md">
      <div class="col-auto">
        Sales count : {{ sales.length }}
      </div>
      <span>|</span>
      <div class="col-auto">
        Sales value : {{ displayValueSold }}
      </div>
      <span>|</span>
      <div class="col-auto">
        Realt value : {{ displayValueRealt }}
      </div>
      <span>|</span>
      <div class="col-auto">
        Difference : {{ displayValueProfit }} ({{ displayValueProfitPercent }})
      </div>
    </div>
    <q-table
      :loading="loading"
      :rows="sales"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="id"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs, watch } from 'vue'
import { YamRepository } from 'src/api/yam.repository'
import { AddressSale } from 'src/api/Yam/GetAddressSales'
import { useRealTokenStore } from '../stores/useRealTokenStore'
import formatDistance from 'date-fns/formatDistance'
import _sumBy from 'lodash/sumBy'
import { RealToken } from 'src/api/realt.repository'
import { useRouter } from 'vue-router'
import { TableColumn } from 'src/utils/TableColumn'

type Row = AddressSale & RealToken

export default defineComponent({
  name: 'AccountSalesPage',
  props: {
    accountAddress: {
      type: String,
      default: '',
    },
  },
  setup (props) {
    const { accountAddress } = toRefs(props)
    const store = useRealTokenStore()
    const router = useRouter()
    const addressField = ref<string>('')

    const sales = ref<Row[]>([])
    const loading = ref(false)

    async function fetch () {
      loading.value = true
      try {
        await store.waitInitialized
        const data = await YamRepository.getAddressSales({ address: accountAddress.value })

        sales.value = data
          .filter(sale => store.hasToken(sale.offerToken))
          .map(sale => ({ ...sale, ...store.getToken(sale.offerToken) }))
      } finally {
        loading.value = false
      }
    }

    watch(accountAddress, () => {
      if (accountAddress.value) {
        addressField.value = accountAddress.value
        fetch()
      }
    }, { immediate: true })

    const sumValueSold = computed(() => _sumBy(sales.value, item => item.price * item.quantity))
    const sumValueRealt = computed(() => _sumBy(sales.value, item => item.token.value * item.quantity))
    const sumValueProfit = computed(() => sumValueSold.value - sumValueRealt.value)
    const sumValueProfitPercent = computed(() => (sumValueProfit.value / (sumValueSold.value || 1) * 100))

    const displayValueSold = computed(() => sumValueSold.value.toFixed(2) + ' $')
    const displayValueRealt = computed(() => sumValueRealt.value.toFixed(2) + ' $')
    const displayValueProfit = computed(() => sumValueProfit.value.toFixed(2) + ' $')
    const displayValueProfitPercent = computed(() => sumValueProfitPercent.value.toFixed(2) + ' %')

    const columns: TableColumn<Row>[] = [
      {
        name: 'date',
        label: 'Date',
        align: 'left',
        sortable: true,
        field: item => item.createdAtTimestamp * 1000,
        format: value => new Date(value).toLocaleString(),
      },
      {
        name: 'shortName',
        label: 'Short Name',
        sortable: true,
        align: 'left',
        field: item => item.property.shortName,
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
        name: 'realtPrice',
        label: 'Realt Price',
        align: 'right',
        sortable: true,
        field: item => item.token.value,
        format: value => value.toFixed(2) + ' $',
      },
      {
        name: 'difference',
        label: 'Difference Realt',
        align: 'right',
        sortable: true,
        field: item => item.price / (item.token.value ?? 1),
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
        field: item => (item.return.perYear ?? 0) / item.price,
        format: value => value > 10
          ? '> 1000 %'
          : (value * 100).toFixed(2) + ' %',
      },
      {
        name: 'delay',
        label: 'Sales delay',
        align: 'right',
        sortable: true,
        field: item => item.createdAtTimestamp - item.offerCreatedAtTimestamp,
        format: (value, item) => formatDistance(new Date(item.createdAtTimestamp * 1000), new Date(item.offerCreatedAtTimestamp * 1000), { includeSeconds: true }),
      },
      {
        name: 'buyer',
        label: 'Buyer',
        align: 'left',
        sortable: true,
        // TODO: Depends on the offer type
        field: item => item.taker,
      },
    ]

    function onSubmit () {
      void router.push({
        name: 'AccountSalesPage',
        params: { accountAddress: addressField.value },
      })
    }

    return {
      addressField,
      onSubmit,
      loading,
      sales,
      columns,
      displayValueSold,
      displayValueRealt,
      displayValueProfit,
      displayValueProfitPercent,
    }
  },
})
</script>
