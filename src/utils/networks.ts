import { NETWORK_CONFIGS, NetworkConfig } from '@/constants/networks';

/**
 * chainId로 네트워크 정보 찾기
 */
export const getNetworkByChainId = (
  chainId: string
): NetworkConfig | undefined => {
  return NETWORK_CONFIGS.find((network) => network.chainId === chainId);
};

/**
 * chainId로 심볼 가져오기
 */
export const getSymbolByChainId = (chainId: string): string => {
  const network = getNetworkByChainId(chainId);
  return network?.symbol || 'ETH';
};

/**
 * chainId로 네트워크 이름 가져오기
 */
export const getNetworkNameByChainId = (chainId: string): string => {
  const network = getNetworkByChainId(chainId);
  return network?.name || `Unknown (${chainId})`;
};