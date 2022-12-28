import { gql, GraphQLClient } from 'graphql-request'
import { getStablecoinAddresses } from '../../services/Stablecoin'

export interface AddressSale {
  id: string;
  offerId: string;
  taker: string;
  offerToken: string;
  buyerToken: string;
  price: number;
  quantity: number;
  createdAtTimestamp: number;
  offerCreatedAtTimestamp: number;
}

interface SaleEntity {
  id: string;
  price: string;
  quantity: string;
  taker: { address: string };
  createdAtTimestamp: number;
  offer: {
    id: string;
    offerToken: { address: string; decimals: string };
    buyerToken: { address: string; decimals: string };
    createdAtTimestamp: number;
  };
}

interface AccountEntity {
  sales: SaleEntity[];
}

interface GetAddressSales {
  account: AccountEntity;
}

interface GetAddressSalesVariables {
  address: string;
}

function parsePrice (purchase: SaleEntity) {
  const buyerTokenDecimals = +purchase.offer.buyerToken.decimals
  return +purchase.price / Math.pow(10, buyerTokenDecimals)
}

function parseSales (sales: SaleEntity[]): AddressSale[] {
  return sales
    .map(sale => ({
      id: sale.id,
      offerId: sale.offer.id,
      taker: sale.taker.address,
      offerToken: sale.offer.offerToken.address,
      buyerToken: sale.offer.buyerToken.address,
      price: parsePrice(sale),
      quantity: +sale.quantity / Math.pow(10, +sale.offer.offerToken.decimals),
      createdAtTimestamp: sale.createdAtTimestamp,
      offerCreatedAtTimestamp: sale.offer.createdAtTimestamp,
    }))
    .filter(item => getStablecoinAddresses().includes(item.buyerToken))
}

export function getAddressSales (client: GraphQLClient) {
  return async (variables: GetAddressSalesVariables) => {
    const response = await client.request<GetAddressSales>(gql`
      query GetAddressSales ($address: String) {
        account(id: $address) {
          sales (orderBy: createdAtTimestamp, orderDirection: desc) {
            id
            price
            quantity
            taker { address }
            createdAtTimestamp
            offer {
              id
              offerToken { address decimals }
              buyerToken { address decimals }
              createdAtTimestamp
            }
          }
        }
      }
    `, { address: variables.address.toLowerCase() })

    return parseSales(response.account.sales)
  }
}
