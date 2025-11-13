'use client';

import { useMetamask } from '@/hooks';
import { useERC20Token } from '@/hooks/useERC20Token';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NETWORK_CONFIGS } from '@/constants/networks';
import { formatAddress, getNetworkNameByChainId } from '@/utils';

// 배포된 스마트 컨트랙트 주소
const ERC20_TOKEN_ADDRESS = '';

export default function MainPage() {
  const {
    account,
    balance,
    symbol,
    chainId,
    signature,
    signedMessage,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    refreshBalance,
    signMessage,
    clearError,
    switchChain,
    provider,
  } = useMetamask();

  const erc20Token = useERC20Token(
    ERC20_TOKEN_ADDRESS,
    provider,
    account,
    true // 자동 새로고침
  );

  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>MetaMask 지갑 연결</CardTitle>
          <CardDescription>
            MetaMask를 연결하여 지갑 정보를 확인하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                MetaMask가 설치되어 있어야 합니다
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground mb-2 text-sm font-medium">
                  연결된 주소
                </div>
                <div className="font-mono text-sm">
                  {formatAddress(account!)}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground mb-2 text-sm font-medium">
                  잔액
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {balance
                      ? `${parseFloat(balance).toFixed(4)} ${symbol || 'ETH'}`
                      : 'Loading...'}
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshBalance}>
                    새로고침
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground mb-2 text-sm font-medium">
                  네트워크
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {getNetworkNameByChainId(chainId || '')}
                    </div>
                    {chainId && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
                        {chainId}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="network-select"
                      className="text-muted-foreground text-xs"
                    >
                      네트워크 변경
                    </label>
                    <div className="relative">
                      <select
                        id="network-select"
                        value={chainId || ''}
                        onChange={(e) => switchChain(e.target.value)}
                        className="border-input bg-background ring-offset-background focus:ring-ring w-full appearance-none rounded-md border px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      >
                        <option value="" disabled>
                          네트워크를 선택하세요
                        </option>
                        {NETWORK_CONFIGS.map((network) => (
                          <option key={network.chainId} value={network.chainId}>
                            {network.name} ({network.symbol})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg
                          className="text-muted-foreground h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/** ERC-20 토큰 */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm font-medium">
                    ERC-20 토큰 잔액
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {erc20Token.isLoading ? (
                      'Loading...'
                    ) : erc20Token.error ? (
                      <span className="text-destructive text-sm">
                        {erc20Token.error}
                      </span>
                    ) : (
                      `${erc20Token.balance ? parseFloat(erc20Token.balance).toFixed(4) : '0.0000'} ${erc20Token.symbol || ''}`
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={erc20Token.refreshBalance}
                    disabled={erc20Token.isLoading}
                  >
                    새로고침
                  </Button>
                </div>
                {erc20Token.name && (
                  <div className="text-muted-foreground mt-2 text-xs">
                    {erc20Token.name}
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm font-medium">
                    서명 상태
                  </div>
                  {signature && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ✓ 서명 완료
                    </span>
                  )}
                </div>
                {signature ? (
                  <div className="space-y-2">
                    <div className="bg-muted max-h-32 overflow-y-auto rounded p-2">
                      <p className="text-xs whitespace-pre-wrap">
                        {signedMessage}
                      </p>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      <span className="font-semibold">Signature:</span>
                      <p className="mt-1 font-mono break-all">
                        {signature.slice(0, 50)}...
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signMessage()}
                      className="w-full"
                    >
                      다시 서명하기
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2 text-sm">
                      서명이 없습니다
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signMessage()}
                      className="w-full"
                    >
                      서명하기
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="border-destructive bg-destructive/10 text-destructive relative rounded-lg border p-3 pr-10 text-sm">
              <div className="break-words">{error}</div>
              <button
                onClick={clearError}
                className="absolute top-2 right-2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                aria-label="에러 닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {!isConnected ? (
            <Button className="w-full" onClick={connect} disabled={isLoading}>
              {isLoading ? '연결 중...' : 'MetaMask 연결'}
            </Button>
          ) : (
            <Button className="w-full" variant="outline" onClick={disconnect}>
              연결 해제
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
