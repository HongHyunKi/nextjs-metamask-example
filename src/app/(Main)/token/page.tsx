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
import { ethers } from 'ethers';

export default function TokenPage() {
  const { account, provider, isConnected } = useMetamask();
  const [tokenAddress, setTokenAddress] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  /** 토큰 전송 */
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  const erc20Token = useERC20Token(searchAddress, provider, account, true);

  const handleSearch = () => {
    setSearchAddress(tokenAddress);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTransfer = async () => {
    if (!provider || !account || !searchAddress || !recipientAddress || !transferAmount) {
      return;
    }

    setIsTransferring(true);
    setTransferError('');
    setTransferSuccess('');

    try {
      // ERC20 ABI - transfer 메서드만 필요
      const erc20Abi = [
        'function transfer(address to, uint256 amount) returns (bool)',
      ];

      // Signer 가져오기
      const signer = await provider.getSigner();

      // 컨트랙트 인스턴스 생성
      const tokenContract = new ethers.Contract(searchAddress, erc20Abi, signer);

      // 금액을 토큰의 decimals에 맞게 변환
      const decimals = erc20Token.decimals || 18;
      const amount = ethers.parseUnits(transferAmount, decimals);

      // transfer 메서드 호출
      const tx = await tokenContract.transfer(recipientAddress, amount);

      // 트랜잭션 대기
      await tx.wait();

      setTransferSuccess(`${transferAmount} ${erc20Token.symbol || 'tokens'} 전송 완료!`);
      setRecipientAddress('');
      setTransferAmount('');

      // 잔액 새로고침
      erc20Token.refreshBalance();
    } catch (error: any) {
      console.error('Transfer error:', error);
      setTransferError(error.message || '전송 중 오류가 발생했습니다.');
    } finally {
      setIsTransferring(false);
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

              {/* 토큰 전송 섹션 */}
              {searchAddress && !erc20Token.error && !erc20Token.isLoading && (
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-medium text-muted-foreground">
                    토큰 전송
                  </div>

                  {transferSuccess && (
                    <div className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {transferSuccess}
                    </div>
                  )}

                  {transferError && (
                    <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      {transferError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="recipient-address">받는 주소</Label>
                      <Input
                        id="recipient-address"
                        placeholder="0x..."
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="font-mono text-sm"
                        disabled={isTransferring}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transfer-amount">전송 금액</Label>
                      <Input
                        id="transfer-amount"
                        type="number"
                        placeholder="0.0"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="text-sm"
                        disabled={isTransferring}
                      />
                    </div>

                    <Button
                      onClick={handleTransfer}
                      disabled={
                        !recipientAddress.trim() ||
                        !transferAmount ||
                        isTransferring ||
                        parseFloat(transferAmount) <= 0
                      }
                      className="w-full"
                    >
                      {isTransferring ? '전송 중...' : '전송'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
