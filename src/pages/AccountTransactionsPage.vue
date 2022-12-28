<template>
  <q-page>
    <div class="text-center q-ma-sm text-h6">
      All transactions of an account, including purchases, sales and swaps
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

    <q-table
      :loading="loading"
      :rows="transactions"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="id"
    >
      <template v-slot:body-cell-tokenSent="props">
        <q-td :props="props">
          <router-link
            v-if="props.row.sendToken.type === 'REALTOKEN'"
            :to="{ name: 'TokenPage', params: { tokenAddress: props.row.sendToken.address } }"
          >
            {{ props.row.sendToken.name }}
          </router-link>
          <span v-else>{{ props.row.sendToken.name }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-tokenReceived="props">
        <q-td :props="props">
          <router-link
            v-if="props.row.receiveToken.type === 'REALTOKEN'"
            :to="{ name: 'TokenPage', params: { tokenAddress: props.row.receiveToken.address } }"
          >
            {{ props.value }}
          </router-link>
          <span v-else>{{ props.value }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-destination="props">
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
import { defineComponent, ref, toRefs, watch } from 'vue'
import { YamRepository } from 'src/api/yam.repository'
import { AddressTransaction } from 'src/api/Yam/GetAddressTransactions'
import { useRealTokenStore } from '../stores/useRealTokenStore'
import formatDistance from 'date-fns/formatDistance'
import { useRouter } from 'vue-router'
import { TableColumn } from 'src/utils/TableColumn'
import { TransactionType } from 'src/api/Yam/TransactionType'
import { getStablecoinSymbol } from 'src/services/Stablecoin'

type TokenType = 'REALTOKEN' | 'ERC20'

interface Transaction extends Omit<AddressTransaction, 'offerToken' | 'buyerToken'> {
  sendToken: {
    address: string;
    type: TokenType;
    name: string;
    quantity: number;
  };
  receiveToken: {
    address: string;
    type: TokenType;
    name: string;
    quantity: number;
  };
}

export default defineComponent({
  name: 'AccountPage',
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

    const transactions = ref<Transaction[]>([])
    const loading = ref(false)

    function getTokenInfo (token: { address: string; name: string; decimals: string }) {
      const realToken = store.getToken(token.address)

      if (realToken) {
        return {
          address: token.address,
          type: 'REALTOKEN' as TokenType,
          name: realToken.property.shortName,
        }
      }

      const stableTokenName = getStablecoinSymbol(token.address)

      return {
        address: token.address,
        type: 'ERC20' as TokenType,
        name: stableTokenName ?? token.name,
      }
    }

    async function fetch () {
      loading.value = true
      try {
        await store.waitInitialized
        const data = await YamRepository.getAddressTransactions({ address: accountAddress.value })

        const promises = data.map(async (item) => {
          const isTaker = item.taker.toLowerCase() === accountAddress.value.toLowerCase()
          return {
            ...item,
            sendToken: {
              ...(await getTokenInfo(isTaker ? item.buyerToken : item.offerToken)),
              quantity: isTaker ? (item.quantity * item.price) : item.quantity,
            },
            receiveToken: {
              ...(await getTokenInfo(isTaker ? item.offerToken : item.buyerToken)),
              quantity: isTaker ? item.quantity : (item.quantity * item.price),
            },
          }
        })

        transactions.value = await Promise.all(promises)
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

    function onSubmit () {
      void router.push({
        name: 'AccountTransactionsPage',
        params: { accountAddress: addressField.value },
      })
    }

    const columns: TableColumn<Transaction>[] = [
      {
        name: 'date',
        label: 'Date',
        align: 'left',
        sortable: true,
        field: item => item.createdAtTimestamp * 1000,
        format: value => new Date(value).toLocaleString(),
      },
      {
        name: 'type',
        label: 'Type',
        align: 'left',
        sortable: true,
        field: item => {
          const isTaker = item.taker.toLowerCase() === accountAddress.value.toLowerCase()
          switch (item.type) {
            case TransactionType.REALTOKENTOREALTOKEN:
            case TransactionType.ERC20TOERC20:
              return 'Swap'
            case TransactionType.REALTOKENTOERC20:
              return isTaker ? 'Buy' : 'Sell'
            case TransactionType.ERC20TOREALTOKEN:
              return isTaker ? 'Sell' : 'Buy'
          }
        },
      },
      {
        name: 'quantitySent',
        label: 'Quantity sent',
        align: 'right',
        sortable: true,
        field: item => item.sendToken.quantity,
        format: value => value.toFixed(2),
      },
      {
        name: 'tokenSent',
        label: 'Token sent',
        sortable: true,
        align: 'left',
        field: item => item.sendToken.name,
      },
      {
        name: 'quantityReceived',
        label: 'Quantity received',
        align: 'right',
        sortable: true,
        field: item => item.receiveToken.quantity,
        format: value => value.toFixed(2),
      },
      {
        name: 'tokenReceived',
        label: 'Token received',
        sortable: true,
        align: 'left',
        field: item => item.receiveToken.name,
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
        name: 'destination',
        label: 'From/To',
        align: 'left',
        sortable: true,
        field: item => item.taker === accountAddress.value
          ? item.maker
          : item.taker,
      },
    ]

    return {
      addressField,
      onSubmit,
      loading,
      transactions,
      columns,
    }
  },
})
</script>
