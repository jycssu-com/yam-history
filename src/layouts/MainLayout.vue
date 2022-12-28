<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Yam History
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Menu
        </q-item-label>

        <q-item :to="{ name: 'HomePage' }" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
            <q-item-label caption>
              Home page with global stats
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item :to="{ name: 'TokenListPage' }" exact>
          <q-item-section avatar>
            <q-icon name="apartment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>List of RealTokens</q-item-label>
            <q-item-label caption>
              List of realToken with recent price
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item :to="{ name: 'TransactionListPage' }" exact>
          <q-item-section avatar>
            <q-icon name="swap_horiz" />
          </q-item-section>
          <q-item-section>
            <q-item-label>List of transactions</q-item-label>
            <q-item-label caption>
              List of all transactions
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item :to="{ name: 'AccountPurchasesPage' }" exact>
          <q-item-section avatar>
            <q-icon name="shopping_cart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Purchases from Address</q-item-label>
            <q-item-label caption>
              List of purchases from a wallet
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item :to="{ name: 'AccountSalesPage' }" exact>
          <q-item-section avatar>
            <q-icon name="sell" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sales from Address</q-item-label>
            <q-item-label caption>
              List of sales from a wallet
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item :to="{ name: 'AccountTransactionsPage' }" exact>
          <q-item-section avatar>
            <q-icon name="swap_horiz" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Transactions from Address</q-item-label>
            <q-item-label caption>
              List all transactions from a wallet
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MainLayout',
  setup () {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },
})
</script>
