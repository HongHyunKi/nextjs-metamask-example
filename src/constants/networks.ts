export interface NetworkConfig {
  chainId: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const NETWORK_CONFIGS: readonly NetworkConfig[] = [
  {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    decimals: 18,
  },
  {
    chainId: '0xa86a',
    name: 'Avalanche C-Chain',
    symbol: 'AVAX',
    decimals: 18,
  },
  {
    chainId: '0xa869',
    name: 'Avalanche Fuji Testnet',
    symbol: 'AVAX',
    decimals: 18,
  },
  {
    chainId: '0xaa36a7',
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    decimals: 18,
  },
  {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    symbol: 'MATIC',
    decimals: 18,
  },
  {
    chainId: '0x13882',
    name: 'Polygon Amoy Testnet',
    symbol: 'MATIC',
    decimals: 18,
  },
  {
    chainId: '0xa4b1',
    name: 'Arbitrum One',
    symbol: 'ETH',
    decimals: 18,
  },
  {
    chainId: '0xa4ba',
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    decimals: 18,
  },
] as const;