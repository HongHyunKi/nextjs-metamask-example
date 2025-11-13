# Next.js MetaMask Integration Sample

> Next.js 15 + ethers.js를 활용한 MetaMask 연동 예제

![Project Preview](/public/preview.png)

## ✨ 주요 기능

### 💼 지갑 기능
- 🔗 **MetaMask 연결/연결 해제** - 원클릭으로 간편한 지갑 연결
- 👛 **지갑 주소 표시** - 연결된 지갑 주소 자동 포맷팅
- 💰 **실시간 잔액 조회** - ETH 잔액 확인 및 새로고침
- 🪙 **ERC20 토큰 조회** - 범용 ERC20 토큰 잔액 및 정보 확인
- 🌐 **네트워크 전환** - 다양한 체인 간 쉬운 전환
- ✍️ **메시지 서명** - 자동/수동 서명 기능

### 🎨 UI/UX
- ⚡️ **Next.js 15** - 최신 App Router와 React Server Components
- 🎨 **Tailwind CSS v4** - 최신 CSS 프레임워크
- 🧩 **shadcn/ui** - 아름답고 접근성 높은 컴포넌트
- 🌗 **다크모드** - next-themes를 사용한 완벽한 다크모드 지원
- 📱 **완전 반응형** - 모바일부터 데스크톱까지 완벽 대응
- 🔒 **TypeScript** - 타입 안전성과 개발자 경험 향상

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.17 이상
- [MetaMask 브라우저 확장 프로그램](https://metamask.io/) 설치

### 설치

```bash
# 저장소 클론
git clone https://github.com/HongHyunKi/nextjs-metamask-sample.git

# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev
```

### 빌드

```bash
# 프로덕션 빌드
yarn build

# 프로덕션 서버 실행
yarn start
```

## 📦 기술 스택

### 코어
- **Next.js** ^15.4.7
- **React** ^19.1.0
- **TypeScript** ^5
- **ethers.js** ^6.15.0

### 스타일링
- **Tailwind CSS** ^4.1.4
- **shadcn/ui** - Radix UI primitives 기반
- **next-themes** ^0.4.4
- **lucide-react** ^0.477.0

### 개발 도구
- **ESLint** ^8
- **Prettier** ^3.5.2

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── (Main)/          # 메인 레이아웃 그룹
│   │   └── page.tsx     # MetaMask 연동 UI
│   └── layout.tsx       # 루트 레이아웃
├── components/          # React 컴포넌트
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── layouts/         # 레이아웃 컴포넌트
│   ├── theme/           # 테마 관련 컴포넌트
│   └── common/          # 공통 컴포넌트
├── hooks/               # Custom Hooks
│   ├── useMetamask.ts   # MetaMask 연동 훅
│   └── useERC20Token.ts # ERC20 토큰 조회 훅
├── types/               # TypeScript 타입 정의
│   └── ethereum.d.ts    # window.ethereum 타입
├── constants/           # 상수 정의
├── lib/                 # 유틸리티 함수
└── css/                 # 글로벌 스타일
```

## 🎯 주요 명령어

```bash
yarn dev        # 개발 서버 실행
yarn build      # 프로덕션 빌드
yarn start      # 프로덕션 서버 실행
yarn lint       # ESLint 실행
yarn prettier   # Prettier 검사
```

## 📖 사용 방법

### 1. MetaMask 연결
"MetaMask 연결" 버튼을 클릭하여 지갑을 연결합니다.

### 2. 지갑 정보 확인
- **연결된 주소**: 현재 연결된 지갑 주소
- **잔액**: ETH 잔액 (새로고침 버튼으로 갱신 가능)
- **네트워크**: 현재 연결된 네트워크

### 3. 네트워크 변경
드롭다운 메뉴에서 원하는 네트워크를 선택하여 전환합니다.

### 4. 메시지 서명
- 연결 시 자동으로 서명 요청이 표시됩니다
- "서명하기" 버튼으로 수동 서명도 가능합니다

## 🔧 커스텀 훅: useMetamask

```typescript
const {
  account,          // 연결된 지갑 주소
  balance,          // 잔액 (ETH)
  chainId,          // 현재 체인 ID
  signature,        // 서명 해시
  signedMessage,    // 서명된 메시지
  isConnected,      // 연결 상태
  isLoading,        // 로딩 상태
  error,            // 에러 메시지
  provider,         // ethers Provider
  signer,           // ethers Signer
  connect,          // 연결 함수
  disconnect,       // 연결 해제 함수
  switchChain,      // 네트워크 전환 함수
  refreshBalance,   // 잔액 새로고침 함수
  signMessage,      // 서명 함수
  clearError,       // 에러 초기화 함수
} = useMetamask();
```

## 🪙 커스텀 훅: useERC20Token

ERC20 토큰의 잔액과 정보를 조회하는 범용 훅입니다. 네이티브 토큰(ETH, AVAX 등)이 아닌 컨트랙트 기반 토큰을 다룰 때 사용합니다.

### 설정 방법

1. **토큰 컨트랙트 주소 설정**

   `src/app/(Main)/page.tsx` 파일에서 ERC20_TOKEN_ADDRESS 상수를 설정합니다:

   ```typescript
   // 배포된 스마트 컨트랙트 주소
   const ERC20_TOKEN_ADDRESS = '0x4b ... ';
   ```

2. **훅 사용**

   ```typescript
   import { useERC20Token } from '@/hooks/useERC20Token';

   const erc20Token = useERC20Token(
     ERC20_TOKEN_ADDRESS, // 토큰 컨트랙트 주소
     provider,            // useMetamask에서 가져온 provider
     account,             // useMetamask에서 가져온 account
     true                 // 자동 새로고침 활성화 (선택)
   );
   ```

### 반환값

```typescript
const {
  balance,          // 토큰 잔액 (포맷된 문자열)
  symbol,           // 토큰 심볼 (예: "K", "USDC")
  decimals,         // 토큰 소수점 자리수
  name,             // 토큰 이름 (예: "K Token")
  isLoading,        // 로딩 상태
  error,            // 에러 메시지
  refreshBalance,   // 수동 새로고침 함수
} = erc20Token;
```

### 주요 기능

- **자동 새로고침**: 메타마스크 연결, 계정 변경 시 자동으로 토큰 정보 업데이트
- **수동 새로고침**: `refreshBalance()` 함수로 언제든 최신 정보 조회
- **에러 처리**: 토큰 조회 실패 시 에러 메시지 제공
- **로딩 상태**: 데이터 로딩 중 UI 처리 가능
- **범용성**: 모든 ERC20 표준 토큰에 사용 가능
