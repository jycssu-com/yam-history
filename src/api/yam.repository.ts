import { GraphQLClient } from 'graphql-request'
import { getTokenTransactions } from './Yam/GetTokenTransactions'
import { getAddressPurchases } from './Yam/GetAddressPurchases'
import { getTokens } from './Yam/GetTokens'
import { getGlobalStats } from './Yam/GetGlobalStats'
import { getAddressSales } from './Yam/GetAddressSales'
import { getSubgraphEndpoint } from 'src/services/CurrentChain'
import { getAddressTransactions } from './Yam/GetAddressTransactions'
import { getTransactions } from './Yam/GetTransactions'

const client = new GraphQLClient(getSubgraphEndpoint())

export const YamRepository = {
  getGlobalStats: getGlobalStats(client),
  getTokenTransactions: getTokenTransactions(client),
  getAddressTransactions: getAddressTransactions(client),
  getAddressPurchases: getAddressPurchases(client),
  getAddressSales: getAddressSales(client),
  getTokens: getTokens(client),
  getTransactions: getTransactions(client),
}
