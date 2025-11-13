'use client';

import { useState } from 'react';
import { useMetamask } from '@/hooks';
import { useERC20Token } from '@/hooks/useERC20Token';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function TokenPage() {
  const { account, provider, isConnected } = useMetamask();
  const [tokenAddress, setTokenAddress] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  const erc20Token = useERC20Token(searchAddress, provider, account, true);

  const handleSearch = () => {
    setSearchAddress(tokenAddress);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ERC20 토큰 조회</CardTitle>
          <CardDescription>
            토큰 컨트랙트 주소를 입력하여 잔액을 확인하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[448px] space-y-4">
          {!isConnected ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                먼저 MetaMask를 연결해주세요
              </p>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
              >
                메인 페이지로 이동
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="token-address">토큰 컨트랙트 주소</Label>
                <div className="flex gap-2">
                  <Input
                    id="token-address"
                    placeholder="0x..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={!tokenAddress.trim() || erc20Token.isLoading}
                  >
                    조회
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  예시: 0x4b34dd1d58B2915eE0414b1870C027095893F7dB
                </p>
              </div>

              <div className="min-h-[300px] rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm font-medium">
                    토큰 정보
                  </div>
                </div>

                {!searchAddress ? (
                  <div className="flex min-h-[250px] items-center justify-center py-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      토큰 주소를 입력하고 조회 버튼을 클릭하세요
                    </p>
                  </div>
                ) : erc20Token.isLoading ? (
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="mb-2 h-3 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div>
                      <Skeleton className="mb-2 h-3 w-12" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div>
                      <Skeleton className="mb-2 h-3 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="border-t pt-3">
                      <Skeleton className="mb-2 h-3 w-20" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  </div>
                ) : erc20Token.error ? (
                  <div className="py-4 text-center">
                    <p className="text-destructive text-sm">
                      {erc20Token.error}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {erc20Token.name && (
                      <div>
                        <div className="text-muted-foreground text-xs">
                          토큰 이름
                        </div>
                        <div className="text-sm font-medium">
                          {erc20Token.name}
                        </div>
                      </div>
                    )}

                    {erc20Token.symbol && (
                      <div>
                        <div className="text-muted-foreground text-xs">
                          심볼
                        </div>
                        <div className="text-sm font-medium">
                          {erc20Token.symbol}
                        </div>
                      </div>
                    )}

                    {erc20Token.decimals !== null && (
                      <div>
                        <div className="text-muted-foreground text-xs">
                          소수점 자리수
                        </div>
                        <div className="text-sm font-medium">
                          {erc20Token.decimals}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="text-muted-foreground mb-1 text-xs">
                        보유 잔액
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {erc20Token.balance
                            ? `${parseFloat(erc20Token.balance).toFixed(4)} ${erc20Token.symbol || ''}`
                            : '0.0000'}
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
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
