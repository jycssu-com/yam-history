<template>
  <q-page>
    <div class="text-center q-ma-sm text-h6">
      All purchases of an account, from Stablecoin to RealToken
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
        Purchases count : {{ purchases.length }}
      </div>
      <span>|</span>
      <div class="col-auto">
        Purchases value : {{ displayValueBuyed }}
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
      :rows="purchases"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="id"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs, watch } from 'vue'
import { YamRepository } from 'src/api/yam.repository'
import { AddressPurchase } from 'src/api/Yam/GetAddressPurchases'
import { useRealTokenStore } from '../stores/useRealTokenStore'
import formatDistance from 'date-fns/formatDistance'
import _sumBy from 'lodash/sumBy'
import { RealToken } from 'src/api/realt.repository'
import { useRouter } from 'vue-router'
import { TableColumn } from 'src/utils/TableColumn'

type Row = AddressPurchase & RealToken

export default defineComponent({
  name: 'AccountPurchasesPage',
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

    const purchases = ref<Row[]>([])
    const loading = ref(false)

    async function fetch () {
      loading.value = true
      try {
        await store.waitInitialized
        const data = await YamRepository.getAddressPurchases({ address: accountAddress.value })

        purchases.value = data
          .filter(purchase => store.hasToken(purchase.offerToken))
          .map(purchase => ({ ...purchase, ...store.getToken(purchase.offerToken)! }))
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

    const sumValueBuyed = computed(() => _sumBy(purchases.value, item => item.price * item.quantity))
    const sumValueRealt = computed(() => _sumBy(purchases.value, item => item.token.value * item.quantity))
    const sumValueProfit = computed(() => sumValueRealt.value - sumValueBuyed.value)
    const sumValueProfitPercent = computed(() => (sumValueProfit.value / (sumValueBuyed.value || 1) * 100))

    const displayValueBuyed = computed(() => sumValueBuyed.value.toFixed(2) + ' $')
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
        // TODO: Depends on the offer type
        field: item => item.maker,
      },
    ]

    function onSubmit () {
      void router.push({
        name: 'AccountPurchasesPage',
        params: { accountAddress: addressField.value },
      })
    }

    return {
      addressField,
      onSubmit,
      loading,
      purchases,
      columns,
      displayValueBuyed,
      displayValueRealt,
      displayValueProfit,
      displayValueProfitPercent,
    }
  },
})
</script>
