import { gql, GraphQLClient } from 'graphql-request'
import _chunk from 'lodash/chunk'
import _sumBy from 'lodash/sumBy'
import { isStablecoinAddress } from 'src/services/Stablecoin'
import { TransactionType } from './TransactionType'

const BATCH_SIZE = 500

interface Transaction {
  type: TransactionType;
  price: number;
  quantity: number;
  buyerToken: string;
}

export interface YamToken {
  address: string;
  unitPrice: number;
  quantity: number;
  transactionsCount: number;
  transactions: Transaction[];
  currentHistoryMonths?: {
    year: number;
    month: number;
    transactionsCount: number;
    createdOffersCount: number;
    updatedOffersCount: number;
    deletedOffersCount: number;
    volume: number;
  };
  lastHistoryMonths?: {
    year: number;
    month: number;
    transactionsCount: number;
    createdOffersCount: number;
    updatedOffersCount: number;
    deletedOffersCount: number;
    volume: number;
  };
}

interface TransactionEntity {
  id: string;
  type: TransactionType;
  price: string;
  quantity: string;
  offer: {
    offerToken: {
      address: string;
      decimals: string;
    };
    buyerToken: {
      address: string;
      decimals: string;
    };
  };
}

interface HistoryMonthEntity {
  year: string;
  month: string;
  transactionsCount: string;
  createdOffersCount: string;
  updatedOffersCount: string;
  deletedOffersCount: string;
  volume: string;
}

interface TokenEntity {
  address: string;
  decimals: string;
  transactionsCount: number;
  transactions: TransactionEntity[];
  historyMonths: HistoryMonthEntity[];
}

interface GetTokens {
  tokens: TokenEntity[];
}

interface GetTokensVariables {
  addresses: string[];
}

function parsePrice (transaction: TransactionEntity) {
  const buyerTokenDecimals = +transaction.offer.buyerToken.decimals
  return +transaction.price / Math.pow(10, buyerTokenDecimals)
}

function parseTransactions (transactions: TransactionEntity[]) {
  return transactions
    .filter(({ offer }) => isStablecoinAddress(offer.buyerToken.address) ||
      isStablecoinAddress(offer.offerToken.address))
    .map(transaction => ({
      type: transaction.type,
      price: parsePrice(transaction),
      quantity: +transaction.quantity / Math.pow(10, +transaction.offer.offerToken.decimals),
      buyerToken: transaction.offer.buyerToken.address,
    }))
}

function parseHistoryMonth (historyMonth?: HistoryMonthEntity, decimals = 18) {
  return historyMonth && {
    year: +historyMonth.year,
    month: +historyMonth.month,
    transactionsCount: +historyMonth.transactionsCount,
    createdOffersCount: +historyMonth.createdOffersCount,
    updatedOffersCount: +historyMonth.updatedOffersCount,
    deletedOffersCount: +historyMonth.deletedOffersCount,
    volume: +historyMonth.volume / Math.pow(10, decimals),
  }
}

function getVolume (transactions: Transaction[]) {
  return _sumBy(transactions, item => item.type === TransactionType.REALTOKENTOERC20
    ? item.price * item.quantity
    : item.quantity)
}

export function parseTokens (tokens: GetTokens['tokens'][0][]): YamToken[] {
  return tokens.map(token => {
    const transactions = parseTransactions(token.transactions)
    const quantity = _sumBy(transactions, item => item.type === TransactionType.REALTOKENTOERC20
      ? item.quantity
      : (item.quantity * item.price))

    return {
      address: token.address,
      transactionsCount: token.transactionsCount,
      unitPrice: getVolume(transactions) / quantity,
      quantity,
      transactions,
      currentHistoryMonths: parseHistoryMonth(token.historyMonths[0], +token.decimals),
      lastHistoryMonths: parseHistoryMonth(token.historyMonths[1], +token.decimals),
    }
  })
}

export function getTokens (client: GraphQLClient) {
  return async (variables: GetTokensVariables) => {
    const batchAddresses = _chunk(variables.addresses.map(address => address.toLowerCase()), BATCH_SIZE)

    const responses = await Promise.all(batchAddresses.map(async addresses => {
      const response = await client.request<GetTokens>(gql`
        query GetTokens ($addresses: [String]) {
          tokens (where: { address_in: $addresses }, first: 500) {
            address
            decimals
            transactionsCount
            volume
            transactions (
              orderBy: createdAtTimestamp,
              orderDirection: desc,
              first: 5,
              where: { type_in: [REALTOKENTOERC20, ERC20TOREALTOKEN] }
            ) {
              type
              offer {
                offerToken { address decimals }
                buyerToken { address decimals }
              }
              price
              quantity
            }
            historyMonths (orderBy: id, orderDirection: desc, first: 2) {
              year
              month
              transactionsCount
              createdOffersCount
              updatedOffersCount
              deletedOffersCount
              volume
            }
          }
        }
      `, { addresses })

      return response.tokens
    }))

    return parseTokens(responses.flat())
  }
}
