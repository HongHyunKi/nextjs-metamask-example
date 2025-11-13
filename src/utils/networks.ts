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

/**
 * chainId로 블록 탐색기 URL 가져오기
 */
export const getBlockExplorerUrl = (chainId: string | null): string | null => {
  if (!chainId) return null;
  const network = getNetworkByChainId(chainId);
  return network?.blockExplorerUrl || null;
};

/**
 * 트랜잭션 해시를 블록 탐색기 URL로 변환
 */
export const getTransactionUrl = (
  txHash: string,
  chainId: string | null
): string | null => {
  const baseUrl = getBlockExplorerUrl(chainId);
  return baseUrl ? `${baseUrl}/tx/${txHash}` : null;
};