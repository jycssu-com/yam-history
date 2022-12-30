import { gql, GraphQLClient } from 'graphql-request'
import { TransactionType } from './TransactionType'

export interface TokenTransaction {
  id: string;
  type: TransactionType;
  offerId: string;
  maker: string;
  taker: string;
  buyerToken: string;
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
    maker: { address: string };
    createdAtTimestamp: number;
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

interface TokenEntity {
  decimals: string;
  transactions: TransactionEntity[];
}

interface GetTokenTransactions {
  token: TokenEntity;
}

interface GetTokenTransactionsVariables {
  address: string;
}

function parsePrice (transaction: TransactionEntity) {
  const buyerTokenDecimals = +transaction.offer.buyerToken.decimals
  return +transaction.price / Math.pow(10, buyerTokenDecimals)
}

function parseTransaction (transactions: TransactionEntity[]): TokenTransaction[] {
  return transactions.map(transaction => ({
    id: transaction.id,
    type: transaction.type,
    offerId: transaction.offer.id,
    maker: transaction.offer.maker.address,
    taker: transaction.taker.address,
    buyerToken: transaction.offer.buyerToken.address,
    price: parsePrice(transaction),
    quantity: +transaction.quantity / Math.pow(10, +transaction.offer.offerToken.decimals),
    createdAtTimestamp: transaction.createdAtTimestamp,
    offerCreatedAtTimestamp: transaction.offer.createdAtTimestamp,
  }))
}

export function getTokenTransactions (client: GraphQLClient) {
  return async (variables: GetTokenTransactionsVariables) => {
    const response = await client.request<GetTokenTransactions>(gql`
      query GetTokenTransactions ($address: String) {
        token (id: $address) {
          transactions (
            orderBy: createdAtTimestamp,
            orderDirection: desc,
            where: { type_in: [REALTOKENTOERC20, ERC20TOREALTOKEN] }
          ) {
            id
            type
            price
            quantity
            taker { address }
            createdAtTimestamp
            offer {
              id
              maker { address }
              createdAtTimestamp
              offerToken { address, decimals }
              buyerToken { address, decimals }
            }
          }
        }
      }
    `, { address: variables.address.toLowerCase() })

    return parseTransaction(response.token.transactions)
  }
}
