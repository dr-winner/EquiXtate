# EquiXtate Overview

A Vite + React (TypeScript) SPA for tokenized real estate with Tailwind + shadcn/ui, basic Web3 wiring (ethers v6), and an AI advisor using Groq.

## Tech Stack
- React 18, TypeScript, Vite 5 (React SWC plugin)
- Tailwind CSS + shadcn/ui components
- Ethers v6 for wallet/contracts
- React Router v6, @tanstack/react-query
- Groq API for AI advisor (Llama 3)

## App Structure
- Entry: `src/main.tsx` → `src/App.tsx`
- Routing & providers: `src/App.tsx`
  - `QueryClientProvider`, `TooltipProvider`, global toasts (`Toaster`, `Sonner`)
  - Routes: `/` (Index), `/property/:id` (PropertyPage), `/profile` (UserProfile), fallback `*` (NotFound)
  - Floating AI assistant: `src/components/AIAdvisorBubble.tsx`
- Feature folders: `src/components/**` + `src/pages/**`
  - Marketplace: `components/marketplace/*`
  - Property page: `components/property-page/*` (header, gallery, metrics, purchase)
  - Property widgets: `components/property-details/*` (purchase controls, stats)
  - User profile: `components/user-profile/*` (tabs for analytics/staking/txs)
  - Advisor widget: `components/advisor/*`

## Data & Types
- Demo catalog: `src/data/propertyData.ts` (IDs, pricing, token supply, metadata)
- Shared token model/helpers: `src/types/property.ts`
  - `EQUIX_TOKEN_VALUE = 0.02` USD per token
  - `calculateRequiredTokens(priceUSDC)`, `calculateTokenValue(tokens)`
- Display helpers: `src/utils/propertyUtils.ts` (formatters, price tiers, type mapping)

## Web3 Integration (ethers v6)
- Facade: `src/services/Web3Service.ts`
  - Wallet: `initialize`, `connectWallet`, `disconnectWallet`, `isWalletConnected`, `getWalletAddress`, `getNetwork`
  - Tokens: `getPropertyTokenBalance`, `buyPropertyTokens`, `getAvailableTokens`
- Internals: `src/services/web3/**`
  - Wallet: `wallet/provider.ts`, `wallet/connection.ts` (MetaMask events), `wallet/network.ts`
  - Contracts: `ContractService.ts` builds `ethers.Contract` using ABIs in `services/web3/types.ts` and addresses in `services/web3/constants.ts`
- Solidity references (non-wired for prod): `src/contracts/*.sol`

## AI Advisor
- Hook: `src/hooks/useAIAdvisor.ts` calls Groq `chat/completions` model `llama3-8b-8192`
- Env: `VITE_GROQ_API_KEY` via `src/utils/envConfig.ts` (UI shows toast/fallback if missing)
- UI: `components/AIAdvisorBubble.tsx` and standalone page `src/pages/AdvisorPage.tsx`

## UI Conventions
- Tailwind theme tokens/animations in `tailwind.config.ts`
- shadcn components under `src/components/ui/*`
- Toasts: import from `@/components/ui/use-toast` (re-exports `@/hooks/use-toast`)
- Use `@` path alias for all imports (`vite.config.ts`, `tsconfig*.json`)

## Build & Run
```bash
npm run dev      # Dev server (host ::, port 8080)
npm run build    # Production build
npm run preview  # Preview built app
npm run lint     # ESLint (hooks plugin on, unused vars relaxed)
```

## Common Flows
- List properties (Index): uses `properties` from `src/data/propertyData.ts`, rendered via `components/PropertyCard.tsx`
- Property details (PropertyPage): finds by `:id`, renders header/gallery/metrics, connects wallet, purchases tokens via `Web3Service.buyPropertyTokens(id, amount)` and updates local state
- Profile: `src/pages/UserProfile.tsx` composes tabs, uses marketplace hooks for derived user data; current data is mock/demo

## Notes & Gotchas
- Contracts/addresses in `services/web3/*` are placeholders; align ABIs and addresses before mainnet/testnet use
- `chainChanged` triggers full reload; keep minimal in-memory assumptions across chains
- Prefer BigInt-aware flows for on-chain values (ethers v6)
- Use toasts for user-visible outcomes (avoid `alert`/console-only)
