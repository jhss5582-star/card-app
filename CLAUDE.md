# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

## Architecture

Next.js 14 App Router 기반 카드 내역 대시보드.

### OAuth 흐름

1. 사용자 → `GET /api/auth/connect?company=shinhan` → 오픈뱅킹 인증 페이지 리다이렉트
2. 콜백 → `GET /api/auth/callback?code=xxx&state=xxx`
3. 서버에서 `exchangeToken()` 호출 — **`client_secret`은 이 Route Handler 안에서만 사용**, 클라이언트로 노출 금지
4. `access_token`을 `token_{company}` httpOnly 쿠키에 저장
5. 이후 `/api/transactions?company=shinhan` 호출 시 쿠키에서 토큰 읽어 오픈뱅킹 API 요청

### Key files

| 경로 | 역할 |
|------|------|
| `src/lib/types.ts` | 공유 타입 (Transaction, Category, CardCompany) |
| `src/lib/categories.ts` | 키워드 기반 카테고리 분류 (`classifyTransaction`) |
| `src/lib/cardCompanies.ts` | 카드사 메타데이터, `buildAuthUrl`, `exchangeToken`, `fetchCardTransactions` |
| `src/lib/mockData.ts` | 개발용 샘플 데이터 생성기 |
| `src/app/api/auth/connect/route.ts` | OAuth 시작 (state 생성, 쿠키 저장) |
| `src/app/api/auth/callback/route.ts` | OAuth 콜백, 토큰 교환 |
| `src/app/api/transactions/route.ts` | 거래 내역 조회 (`?mock=true`로 mock 모드) |

### 카테고리 추가

`src/lib/categories.ts`의 `CATEGORY_KEYWORDS`와 `CATEGORY_COLORS`에 항목을 추가하고, `src/lib/types.ts`의 `Category` 타입에도 반영한다.

### 실제 API 연동

`.env.local.example`을 참고해 `.env.local`을 만들고 오픈뱅킹 포털(openbanking.or.kr)에서 발급한 키를 입력한다. 개발 중에는 `/api/transactions?mock=true` 또는 `generateMockTransactions()`를 사용한다.
