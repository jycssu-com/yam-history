type ChainName = 'ethereum' | 'xDai' | 'goerli'

const DEFAULT_CHAIN_ID = 5
const CURRENT_CHAIN_ID = process.env.APP_CHAIN_ID
  ? Number(process.env.APP_CHAIN_ID)
  : DEFAULT_CHAIN_ID

interface ChainContractInfo {
  symbol: string;
  address: string;
  isStable?: boolean;
}

interface ChainInfo {
  id: number;
  name: ChainName;
  subgraph: {
    endpoint: string;
    url: string;
  };
  contracts: ChainContractInfo[];
}

const CHAINS: ChainInfo[] = [
  {
    id: 1,
    name: 'ethereum',
    subgraph: {
      endpoint: 'https://api.thegraph.com/subgraphs/name/jycssu-com/yam-history-ethereum',
      url: 'https://thegraph.com/hosted-service/subgraph/jycssu-com/yam-history-ethereum',
    },
    contracts: [
      {
        symbol: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        isStable: true,
      },
    ],
  },
  {
    id: 100,
    name: 'xDai',
    subgraph: {
      endpoint: 'https://api.thegraph.com/subgraphs/name/jycssu-com/yam-history-gnosis',
      url: 'https://thegraph.com/hosted-service/subgraph/jycssu-com/yam-history-gnosis',
    },
    contracts: [
      {
        symbol: 'WXDAI',
        address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
        isStable: true,
      },
      {
        symbol: 'USDC',
        address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
        isStable: true,
      },
    ],
  },
  {
    id: 5,
    name: 'goerli',
    subgraph: {
      endpoint: 'https://api.thegraph.com/subgraphs/name/jycssu-com/yam-history-goerli',
      url: 'https://thegraph.com/hosted-service/subgraph/jycssu-com/yam-history-goerli',
    },
    contracts: [
      {
        symbol: 'USDC',
        address: '0x3e7493506bc350ed7f5344196b1842185753bde1',
        isStable: true,
      },
      {
        symbol: 'WXDAI',
        address: '0x803029db36f37d130d8a005a62c55d17383f6f15',
        isStable: true,
      },
    ],
  },
]

export function getChainId (): number {
  return CURRENT_CHAIN_ID
}

export function getChain () {
  const chain = CHAINS.find(item => item.id === CURRENT_CHAIN_ID)
  if (!chain) {
    throw new Error(`Chain with id ${CURRENT_CHAIN_ID} not found`)
  }
  return chain
}

export function getChainName (): ChainName {
  return getChain().name
}

export function getSubgraphEndpoint (): string {
  return getChain().subgraph.endpoint
}
