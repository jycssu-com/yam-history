import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'HomePage',
        component: () => import('src/pages/HomePage.vue'),
      },
      {
        path: 'token',
        name: 'TokenListPage',
        component: () => import('src/pages/TokenListPage.vue'),
      },
      {
        path: 'token/:tokenAddress',
        name: 'TokenPage',
        props: true,
        component: () => import('../pages/TokenPage.vue'),
      },
      {
        path: 'transactions',
        name: 'TransactionListPage',
        props: true,
        component: () => import('src/pages/TransactionListPage.vue'),
      },
      {
        path: 'account/transactions/:accountAddress?',
        name: 'AccountTransactionsPage',
        props: true,
        component: () => import('src/pages/AccountTransactionsPage.vue'),
      },
      {
        path: 'account/purchases/:accountAddress?',
        name: 'AccountPurchasesPage',
        props: true,
        component: () => import('src/pages/AccountPurchasesPage.vue'),
      },
      {
        path: 'account/sales/:accountAddress?',
        name: 'AccountSalesPage',
        props: true,
        component: () => import('src/pages/AccountSalesPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
