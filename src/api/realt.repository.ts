import axios from 'axios'
import { getChainName } from 'src/services/CurrentChain'

const repository = axios.create({ baseURL: 'https://portfolio.realt-dashboard.co' })

interface Token {
  id: string;
  from: string;
  uniswap: string;
  name: string;
  supply: number;
  value: number;
}

export interface BlockchainAddress {
  chainName: string;
  chainId: number;
  contract: string;
  distributor: string;
  maintenance: string;
  rmmPoolAddress?: string;
  chainlinkPriceContract?: string;
}

interface SecondaryMarketplace {
  chainId: number;
  chainName: string;
  dexName: string;
  contractPool: string;
  pair?: {
    contract: string;
    symbol: string;
    name: string;
  };
}

interface Return {
  apr: string;
  perYear: number;
  perMonth: number;
  perDay: number;
}

interface Property {
  name: string;
  shortName: string;
  url: string;
  location: {
    lat: string;
    lng: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
}

interface RealTokenAPI {
  token: Token;
  blockchainAddresses: {
    ethereum: BlockchainAddress;
    xDai: BlockchainAddress;
    goerli: BlockchainAddress;
  };
  secondaryMarketplaces: SecondaryMarketplace[];
  return: Return;
  property: Property;
}

export interface RealToken {
  token: Token;
  blockchainAddress: BlockchainAddress;
  secondaryMarketplaces: SecondaryMarketplace[];
  return: Return;
  property: Property;
}

export const RealtRepository = {
  async getTokens () {
    const response = await repository.get<RealTokenAPI[]>('/realt.min.json')
    return response.data
      .map(({ blockchainAddresses, ...rest }) => {
        const blockchainAddress = blockchainAddresses[getChainName()]

        return {
          ...rest,
          blockchainAddress: {
            ...blockchainAddress,
            contract: blockchainAddress.contract && blockchainAddress.contract.toLowerCase(),
          },
        }
      })
      .filter(token => token.blockchainAddress.contract)
  },
}
