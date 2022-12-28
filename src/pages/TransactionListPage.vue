<template>
  <q-page>
    <div class="text-center q-ma-sm text-h6">
      List of all transactions, including purchases, sales and swaps
    </div>

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

      <template v-slot:body-cell-from="props">
        <q-td :props="props">
          <router-link
            :to="{ name: 'AccountTransactionsPage', params: { accountAddress: props.value } }"
          >
            {{ props.value }}
          </router-link>
        </q-td>
      </template>

      <template v-slot:body-cell-to="props">
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
import { defineComponent, ref } from 'vue'
import { YamRepository } from 'src/api/yam.repository'
import { Transaction } from 'src/api/Yam/GetTransactions'
import { useRealTokenStore } from '../stores/useRealTokenStore'
import formatDistance from 'date-fns/formatDistance'
import { TableColumn } from 'src/utils/TableColumn'
import { TransactionType } from 'src/api/Yam/TransactionType'
import { getStablecoinSymbol } from 'src/services/Stablecoin'

type TokenType = 'REALTOKEN' | 'ERC20'

interface Row extends Omit<Transaction, 'offerToken' | 'buyerToken'> {
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
  name: 'TransactionListPage',
  setup () {
    const store = useRealTokenStore()
    const addressField = ref<string>('')

    const transactions = ref<Row[]>([])
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
        const data = await YamRepository.getTransactions()

        const promises = data.map(async (item) => {
          return {
            ...item,
            sendToken: {
              ...(await getTokenInfo(item.offerToken)),
              quantity: item.quantity,
            },
            receiveToken: {
              ...(await getTokenInfo(item.buyerToken)),
              quantity: item.quantity * item.price,
            },
          }
        })

        transactions.value = await Promise.all(promises)
      } finally {
        loading.value = false
      }
    }

    void fetch()

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
        name: 'type',
        label: 'Type',
        align: 'left',
        sortable: true,
        field: item => {
          switch (item.type) {
            case TransactionType.REALTOKENTOREALTOKEN:
            case TransactionType.ERC20TOERC20:
              return 'Swap'
            case TransactionType.REALTOKENTOERC20:
              return 'Sell'
            case TransactionType.ERC20TOREALTOKEN:
              return 'Buy'
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
        name: 'from',
        label: 'From',
        align: 'left',
        sortable: true,
        field: item => item.maker,
      },
      {
        name: 'to',
        label: 'To',
        align: 'left',
        sortable: true,
        field: item => item.taker,
      },
    ]

    return {
      addressField,
      loading,
      transactions,
      columns,
    }
  },
})
</script>
