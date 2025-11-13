'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, ethers, formatUnits } from 'ethers';

interface ERC20TokenState {
  balance: string | null;
  symbol: string | null;
  decimals: number | null;
  name: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UseERC20TokenReturn extends ERC20TokenState {
  refreshBalance: () => Promise<void>;
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

/** useERC20Token
 * 네이티브 토큰(ETH, AVAX)가 아닌 경우
 * 컨트렉트를 통해 토큰 정보를 가져오는 훅
 *
 * (사용 예시)
 * const colsInfo = useERC20Token(
 *   TOKEN_ADDRESS, // 토큰 컨트랙트 주소
 *   provider,
 *   account,
 *   true // 자동 새로고침
 * );
 * */
export const useERC20Token = (
  tokenAddress: string,
  provider: BrowserProvider | null,
  account: string | null,
  autoRefresh = true
): UseERC20TokenReturn => {
  const [state, setState] = useState<ERC20TokenState>({
    balance: null,
    symbol: null,
    decimals: null,
    name: null,
    isLoading: false,
    error: null,
  });

  const refreshBalance = useCallback(async () => {
    // 토큰 주소가 비어있으면 초기 상태로 유지
    if (!tokenAddress || tokenAddress.trim() === '') {
      setState({
        balance: null,
        symbol: null,
        decimals: null,
        name: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    if (!provider || !account) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(account),
        contract.decimals(),
        contract.symbol(),
        contract.name(),
      ]);

      const formattedBalance = formatUnits(balance, decimals);

      setState({
        balance: formattedBalance,
        symbol,
        decimals: Number(decimals),
        name,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Failed to fetch ERC20 token info:', error);

      // 에러 메시지 포맷팅
      let errorMessage = '토큰 정보를 가져오는데 실패했습니다.';

      // BAD_DATA 에러 = 네트워크에 컨트랙트가 없음
      if (error?.code === 'BAD_DATA' || error?.message?.includes('could not decode')) {
        errorMessage = '현재 네트워크에 해당 토큰이 존재하지 않습니다.';
      }
      // INVALID_ARGUMENT = 잘못된 주소
      else if (error?.code === 'INVALID_ARGUMENT') {
        errorMessage = '유효하지 않은 토큰 주소입니다.';
      }
      // 기타 에러
      else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState({
        balance: null,
        symbol: null,
        decimals: null,
        name: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  }, [provider, account, tokenAddress]);

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh && provider && account && tokenAddress) {
      refreshBalance();
    }
  }, [autoRefresh, provider, account, tokenAddress, refreshBalance]);

  return {
    ...state,
    refreshBalance,
  };
};
