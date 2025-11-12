'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BrowserProvider,
  JsonRpcSigner,
  Eip1193Provider,
  formatEther,
} from 'ethers';
import { getSymbolByChainId } from '@/utils/networks';

interface MetamaskState {
  account: string | null;
  chainId: string | null;
  balance: string | null;
  symbol: string | null;
  signature: string | null;
  signedMessage: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

interface UseMetamaskReturn extends MetamaskState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  signMessage: (message?: string) => Promise<void>;
  clearError: () => void;
}

const createSignMessage = (account: string, timestamp: string) => `Welcome to MetaMask!

이 서명 요청은 블록체인 트랜잭션을 발생시키지 않으며,
가스비가 들지 않습니다.

Wallet address:
${account}

Timestamp:
${timestamp}`;

export const useMetamask = (): UseMetamaskReturn => {
  const [state, setState] = useState<MetamaskState>({
    account: null,
    chainId: null,
    balance: null,
    symbol: null,
    signature: null,
    signedMessage: null,
    isConnected: false,
    isLoading: false,
    error: null,
    provider: null,
    signer: null,
  });

  // 메타마스크 설치 여부 확인
  const checkMetamaskInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.ethereum?.isMetaMask);
  }, []);

  // 잔액 조회
  const refreshBalance = useCallback(async () => {
    if (!state.provider || !state.account) return;

    try {
      const balance = await state.provider.getBalance(state.account);
      const formattedBalance = formatEther(balance);
      setState((prev) => ({ ...prev, balance: formattedBalance }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [state.provider, state.account]);

  // 체인 변경 핸들러
  const handleChainChanged = useCallback(
    async (chainId: string) => {
      try {
        // 네트워크가 변경되면 provider를 다시 생성해야 함 (ethers.js v6 요구사항)
        const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
        const accounts = await provider.send('eth_accounts', []);

        if (accounts.length > 0) {
          const balance = await provider.getBalance(accounts[0]);
          const formattedBalance = formatEther(balance);
          const signer = await provider.getSigner();
          const symbol = getSymbolByChainId(chainId);

          setState((prev) => ({
            ...prev,
            chainId,
            balance: formattedBalance,
            symbol,
            provider,
            signer,
          }));
        } else {
          const symbol = getSymbolByChainId(chainId);
          setState((prev) => ({ ...prev, chainId, symbol }));
        }
      } catch (error) {
        console.error('Failed to update chain:', error);
        setState((prev) => ({ ...prev, chainId }));
      }
    },
    []
  );

  // 에러 메시지 포맷팅
  const formatError = (error: any): string => {
    // 사용자가 거부한 경우
    if (
      error?.code === 'ACTION_REJECTED' ||
      error?.code === 4001 ||
      error?.message?.includes('User rejected') ||
      error?.message?.includes('user rejected')
    ) {
      return '사용자가 요청을 취소했습니다.';
    }

    // 메타마스크 미설치
    if (error?.message?.includes('window.ethereum')) {
      return '메타마스크가 설치되어 있지 않습니다.';
    }

    // 기타 에러
    if (error instanceof Error) {
      // 에러 메시지가 너무 길면 요약
      const msg = error.message;
      if (msg.length > 100) {
        return msg.substring(0, 100) + '...';
      }
      return msg;
    }

    return '알 수 없는 오류가 발생했습니다.';
  };

  // 메시지 서명
  const signMessage = useCallback(
    async (customMessage?: string) => {
      if (!state.signer || !state.account) {
        setState((prev) => ({
          ...prev,
          error: '먼저 메타마스크를 연결해주세요.',
        }));
        return;
      }

      try {
        const timestamp = new Date().toISOString();
        const message = customMessage || createSignMessage(state.account, timestamp);

        const signature = await state.signer.signMessage(message);

        setState((prev) => ({
          ...prev,
          signature,
          signedMessage: message,
          error: null, // 성공 시 에러 초기화
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: formatError(error),
        }));
      }
    },
    [state.signer, state.account]
  );

  // 계정 변경 핸들러
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      // 연결 해제
      setState({
        account: null,
        chainId: null,
        balance: null,
        symbol: null,
        signature: null,
        signedMessage: null,
        isConnected: false,
        isLoading: false,
        error: null,
        provider: null,
        signer: null,
      });
    } else {
      // 계정 변경
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const signer = await provider.getSigner();
      const balance = await provider.getBalance(accounts[0]);
      const formattedBalance = formatEther(balance);
      setState((prev) => ({
        ...prev,
        account: accounts[0],
        balance: formattedBalance,
        signature: null,
        signedMessage: null,
        signer,
      }));
    }
  }, []);

  // 메타마스크 연결
  const connect = useCallback(async () => {
    if (!checkMetamaskInstalled()) {
      setState((prev) => ({
        ...prev,
        error: '메타마스크가 설치되어 있지 않습니다.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      const balance = await provider.getBalance(accounts[0]);
      const formattedBalance = formatEther(balance);
      const chainIdHex = `0x${network.chainId.toString(16)}`;
      const symbol = getSymbolByChainId(chainIdHex);

      // 상태 먼저 설정
      setState({
        account: accounts[0],
        chainId: chainIdHex,
        balance: formattedBalance,
        symbol,
        signature: null,
        signedMessage: null,
        isConnected: true,
        isLoading: false,
        error: null,
        provider,
        signer,
      });

      // 연결 후 자동으로 서명 요청
      const timestamp = new Date().toISOString();
      const message = createSignMessage(accounts[0], timestamp);

      const signature = await signer.signMessage(message);

      setState((prev) => ({
        ...prev,
        signature,
        signedMessage: message,
      }));
    } catch (error) {
      // 서명을 거부한 경우는 연결 상태는 유지
      const errorMessage = formatError(error);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [checkMetamaskInstalled]);

  // 메타마스크 연결 해제
  const disconnect = useCallback(() => {
    setState({
      account: null,
      chainId: null,
      balance: null,
      symbol: null,
      signature: null,
      signedMessage: null,
      isConnected: false,
      isLoading: false,
      error: null,
      provider: null,
      signer: null,
    });
  }, []);

  // 체인 전환
  const switchChain = useCallback(
    async (chainId: string) => {
      if (!checkMetamaskInstalled()) {
        setState((prev) => ({
          ...prev,
          error: '메타마스크가 설치되어 있지 않습니다.',
        }));
        return;
      }

      try {
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      } catch (error: any) {
        // 체인이 메타마스크에 추가되지 않은 경우
        if (error.code === 4902) {
          setState((prev) => ({
            ...prev,
            error: '해당 네트워크를 메타마스크에 추가해주세요.',
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : '체인 전환에 실패했습니다.',
          }));
        }
      }
    },
    [checkMetamaskInstalled]
  );

  // 에러 초기화
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const ethereum = window.ethereum;

    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [handleChainChanged, handleAccountsChanged]);

  // 초기 연결 상태 확인
  useEffect(() => {
    const checkConnection = async () => {
      if (!checkMetamaskInstalled()) return;

      try {
        const provider = new BrowserProvider(
          window.ethereum as Eip1193Provider
        );
        const accounts = await provider.send('eth_accounts', []);

        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const signer = await provider.getSigner();
          const balance = await provider.getBalance(accounts[0]);
          const formattedBalance = formatEther(balance);
          const chainIdHex = `0x${network.chainId.toString(16)}`;
          const symbol = getSymbolByChainId(chainIdHex);

          setState({
            account: accounts[0],
            chainId: chainIdHex,
            balance: formattedBalance,
            symbol,
            signature: null,
            signedMessage: null,
            isConnected: true,
            isLoading: false,
            error: null,
            provider,
            signer,
          });
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    };

    checkConnection();
  }, [checkMetamaskInstalled]);

  return {
    ...state,
    connect,
    disconnect,
    switchChain,
    refreshBalance,
    signMessage,
    clearError,
  };
};
