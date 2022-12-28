import { gql, GraphQLClient } from 'graphql-request'
import { getStablecoinAddresses } from '../../services/Stablecoin'

export interface AddressPurchase {
  id: string;
  offerId: string;
  maker: string;
  offerToken: string;
  buyerToken: string;
  price: number;
  quantity: number;
  createdAtTimestamp: number;
  offerCreatedAtTimestamp: number;
}

interface PurchaseEntity {
  id: string;
  price: string;
  quantity: string;
  createdAtTimestamp: number;
  offer: {
    id: string;
    offerToken: { address: string; decimals: string };
    buyerToken: { address: string; decimals: string };
    maker: { address: string };
    createdAtTimestamp: number;
  };
}

interface AccountEntity {
  purchases: PurchaseEntity[];
}

interface GetAddressPurchases {
  account: AccountEntity;
}

interface GetAddressPurchasesVariables {
  address: string;
}

function parsePrice (purchase: PurchaseEntity) {
  const buyerTokenDecimals = +purchase.offer.buyerToken.decimals
  return +purchase.price / Math.pow(10, buyerTokenDecimals)
}

function parsePurchases (purchases: PurchaseEntity[]): AddressPurchase[] {
  return purchases
    .map(purchase => ({
      id: purchase.id,
      offerId: purchase.offer.id,
      maker: purchase.offer.maker.address,
      offerToken: purchase.offer.offerToken.address,
      buyerToken: purchase.offer.buyerToken.address,
      price: parsePrice(purchase),
      quantity: +purchase.quantity / Math.pow(10, +purchase.offer.offerToken.decimals),
      createdAtTimestamp: purchase.createdAtTimestamp,
      offerCreatedAtTimestamp: purchase.offer.createdAtTimestamp,
    }))
    .filter(item => getStablecoinAddresses().includes(item.buyerToken))
}

export function getAddressPurchases (client: GraphQLClient) {
  return async (variables: GetAddressPurchasesVariables) => {
    const response = await client.request<GetAddressPurchases>(gql`
      query GetAddressPurchases ($address: String) {
        account(id: $address) {
          purchases (orderBy: createdAtTimestamp, orderDirection: desc) {
            id
            price
            quantity
            createdAtTimestamp
            offer {
              id
              offerToken { address decimals }
              buyerToken { address decimals }
              maker { address }
              createdAtTimestamp
            }
          }
        }
      }
    `, { address: variables.address.toLowerCase() })

    return parsePurchases(response.account.purchases)
  }
}
