import { gql, GraphQLClient } from 'graphql-request'

export interface TokenTransaction {
  id: string;
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
  price: string;
  quantity: string;
  taker: { address: string };
  createdAtTimestamp: number;
  offer: {
    id: string;
    maker: { address: string };
    createdAtTimestamp: number;
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

function parseTransaction (transactions: TransactionEntity[], offerTokenDecimals: number): TokenTransaction[] {
  return transactions.map(transaction => ({
    id: transaction.id,
    offerId: transaction.offer.id,
    maker: transaction.offer.maker.address,
    taker: transaction.taker.address,
    buyerToken: transaction.offer.buyerToken.address,
    price: parsePrice(transaction),
    quantity: +transaction.quantity / Math.pow(10, offerTokenDecimals),
    createdAtTimestamp: transaction.createdAtTimestamp,
    offerCreatedAtTimestamp: transaction.offer.createdAtTimestamp,
  }))
}

export function getTokenTransactions (client: GraphQLClient) {
  return async (variables: GetTokenTransactionsVariables) => {
    const response = await client.request<GetTokenTransactions>(gql`
      query GetTokenTransactions ($address: String) {
        token (id: $address) {
          decimals
          transactions (
            orderBy: createdAtTimestamp,
            orderDirection: desc,
            where: { type_in: [REALTOKENTOERC20, ERC20TOREALTOKEN] }
          ) {
            id
            price
            quantity
            taker { address }
            createdAtTimestamp
            offer {
              id
              maker { address }
              createdAtTimestamp
              buyerToken { address, decimals }
            }
          }
        }
      }
    `, { address: variables.address.toLowerCase() })

    return parseTransaction(response.token.transactions, +response.token.decimals)
  }
}
