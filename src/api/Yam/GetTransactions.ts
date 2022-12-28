import { gql, GraphQLClient } from 'graphql-request'
import { TransactionType } from './TransactionType'

export interface Transaction {
  id: string;
  type: TransactionType;
  offerId: string;
  taker: string;
  maker: string;
  offerToken: { address: string; name: string; decimals: string };
  buyerToken: { address: string; name: string; decimals: string };
  price: number;
  quantity: number;
  createdAtTimestamp: number;
  offerCreatedAtTimestamp: number;
}

interface TransactionEntity {
  id: string;
  type: TransactionType;
  price: string;
  quantity: string;
  taker: { address: string };
  createdAtTimestamp: number;
  offer: {
    id: string;
    offerToken: { address: string; name: string; decimals: string };
    buyerToken: { address: string; name: string; decimals: string };
    maker: { address: string };
    createdAtTimestamp: number;
  };
}

interface GetTransactions {
  transactions: TransactionEntity[];
}

function parsePrice (transaction: TransactionEntity) {
  const buyerTokenDecimals = +transaction.offer.buyerToken.decimals
  return +transaction.price / Math.pow(10, buyerTokenDecimals)
}

function parseTransactions (transactions: TransactionEntity[]): Transaction[] {
  return transactions
    .map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      offerId: transaction.offer.id,
      maker: transaction.offer.maker.address,
      taker: transaction.taker.address,
      offerToken: transaction.offer.offerToken,
      buyerToken: transaction.offer.buyerToken,
      price: parsePrice(transaction),
      quantity: +transaction.quantity / Math.pow(10, +transaction.offer.offerToken.decimals),
      createdAtTimestamp: transaction.createdAtTimestamp,
      offerCreatedAtTimestamp: transaction.offer.createdAtTimestamp,
    }))
}

export function getTransactions (client: GraphQLClient) {
  return async () => {
    const response = await client.request<GetTransactions>(gql`
      query GetTransactions {
        transactions (orderBy: createdAtTimestamp, orderDirection: desc, first: 1000) {
          id
          type
          price
          quantity
          taker { address }
          createdAtTimestamp
          offer {
            id
            offerToken { address name decimals }
            buyerToken { address name decimals }
            maker { address }
            createdAtTimestamp
          }
        }
      }
    `)

    return parseTransactions(response.transactions)
  }
}
