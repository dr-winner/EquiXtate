# EquiXtate – AI Coding Agent Guide

This project is a Vite + React (TypeScript) web app with Tailwind + shadcn/ui and Web3 (ethers v6). It also integrates a simple AI advisor powered by Groq. Use this guide to make aligned, productive changes quickly.

## Big Picture
- Frontend-only SPA powered by React Router. Entry: `src/main.tsx`, app shell in `src/App.tsx` (routes, providers, toasters, query client).
- UI is componentized by feature under `src/components/**` with page-level containers in `src/pages/**`.
- Web3 integration lives under `src/services/web3/**` with a facade `src/services/Web3Service.ts` exposing wallet, token, and governance actions.
- Static/demo property data is in `src/data/propertyData.ts` with shared types in `src/types/**`.
- AI advisor lives in `src/hooks/useAIAdvisor.ts` and uses `VITE_GROQ_API_KEY` via `src/utils/envConfig.ts`.

## Source Layout & Aliases
- Path alias: `@` → `./src` (see `vite.config.ts`, `tsconfig*.json`). Prefer `@/...` imports, e.g. `import { toast } from "@/components/ui/use-toast"`.
- Feature folders:
  - `src/components/*` (e.g., `advisor/`, `marketplace/`, `property-page/`, `ui/` for shadcn components)
  - `src/pages/*` (route targets: `Index`, `PropertyPage`, `UserProfile`, `AdvisorPage`)
  - `src/services/*` (Web3 facade + subservices)
  - `src/utils/*`, `src/hooks/*`, `src/types/*`, `src/data/*`

## Web3 Integration Pattern (ethers v6)
- Always go through the facade `Web3Service` (`src/services/Web3Service.ts`) instead of calling subservices directly.
  - Wallet: `initialize`, `connectWallet`, `disconnectWallet`, `isWalletConnected`, `getWalletAddress`, `getNetwork`.
  - Tokens: `getPropertyTokenBalance`, `buyPropertyTokens`, `getAvailableTokens`.
  - Governance: `getGovernanceProposals`, `voteOnProposal`.
- Contracts are created in `ContractService.initializeContracts(signerOrProvider)` using ABIs from `src/services/web3/types.ts` and addresses from `src/services/web3/constants.ts`.
- Wallet lifecycle (MetaMask):
  - `WalletConnection.initialize()` sets provider/signer if already connected; `connectWallet()` prompts; `disconnectWallet()` resets and dispatches a `walletDisconnected` `CustomEvent`.
  - Listeners: `accountsChanged` (re-init or disconnect), `chainChanged` (full reload), `disconnect` (cleanup).
- Ethers v6 specifics: use `ethers.BrowserProvider`, `ethers.Contract`, and prefer `BigInt` math when dealing with on-chain values (see `buyPropertyTokens`).

## AI Advisor Integration
- Hook: `src/hooks/useAIAdvisor.ts` manages chat state and calls Groq `chat/completions` with model `llama3-8b-8192`.
- Env var: set `VITE_GROQ_API_KEY` (see `src/utils/envConfig.ts`). The UI shows a toast and a fallback message if the key is missing.
- Usage pattern: components call `const { messages, input, setInput, isLoading, handleSendMessage } = useAIAdvisor()` and render the chat UI.

## Styling & UI Conventions
- Tailwind + shadcn/ui under `src/components/ui/*`. Reuse these components (e.g., `button.tsx`, `dialog.tsx`, `toast.tsx`, `toaster.tsx`).
- Toasts: import from `@/components/ui/use-toast` (re-exports `@/hooks/use-toast`). Example:
  - `toast({ title: "Success", description: "Purchased tokens" })`
- Providers: `App.tsx` wraps the app with `QueryClientProvider`, `TooltipProvider`, and two toasters (`Toaster`, `Sonner`).

## Data & Types
- Property types and token math helpers: `src/types/property.ts`
  - `calculateRequiredTokens(priceUSDC)` and `calculateTokenValue(tokens)` with constants like `EQUIX_TOKEN_VALUE`.
- Mock property catalog: `src/data/propertyData.ts` with fields like `tokenPrice`, `tokensAvailable`, `blockchainMetadata`.

## Routing
- Routes are defined in `src/App.tsx` with `react-router-dom`:
  ## EquiXtate — AI Coding Agent Guide (concise)

  This repo is a Vite + React (TypeScript) SPA with Tailwind + shadcn/ui, plus a Web3 layer (ethers v6) and a small AI advisor (Groq). The guidance below highlights the repository structure, integration points, and concrete places to change behavior.

  ### Big picture (what to know)
  - **Frontend**: Entry is `src/main.tsx`, app shell and routes in `src/App.tsx`.
  - **UI**: Componentized by feature in `src/components/*`, pages in `src/pages/*` (e.g., `PropertyPage`, `AdvisorPage`). Use the `@` alias for imports (`@/...`).
  - **Web3 façade**: All wallet/contract logic goes through `src/services/Web3Service.ts` (exposes `initialize`, `connectWallet`, `disconnectWallet`, token/governance helpers). Avoid direct ethers usage in components.
  - **AI advisor**: `src/hooks/useAIAdvisor.ts` manages chat state and calls Groq. Env var `VITE_GROQ_API_KEY` (see `src/utils/envConfig.ts`).

  ### Key files & where to change things (examples)
  - **Wallet flow / provider**: `src/services/Web3Service.ts` and UI hook in `src/components/WalletConnection.tsx` — modify here for wallet lifecycle, event handlers and provider initialization.
  - **Contract initialization**: `ContractService.initializeContracts(signerOrProvider)` (references ABIs in `src/services/web3/types.ts` and addresses in `src/services/web3/constants.ts`).
  - **AI chat**: `src/hooks/useAIAdvisor.ts` and UI components in `src/components/advisor/*` (e.g., `ChatWindow.tsx`, `ChatMessages.tsx`).
  - **Shared UI**: `src/components/ui/*` contains shadcn-style primitives — use `@/components/ui/use-toast` for toasts across the app.
  - **Data & types**: property shapes and token helpers live in `src/types/property.ts` and `src/data/propertyData.ts`.

### Integration points & external dependencies
- **Groq API**: requires `VITE_GROQ_API_KEY` for AI features (fallback behavior exists if missing).
- **Ethers v6**: uses `ethers.BrowserProvider` and `ethers.Contract`; code prefers `BigInt` for on-chain math.
- **Blockchain artifacts**: contracts and Hardhat config live in `/blockchain` (scripts that build/export ABIs are under `/blockchain/scripts`). **Primary deployment target: Sonic Labs blockchain** (testnet chain ID: 64165, mainnet: 146).### Developer workflows (commands you'll use)
- Install deps: `./install-deps.sh` or `npm install` at repo root.
- Run dev UI: `npm run dev` (port 8080 by default). Use `npm run build` and `npm run preview` for production preview.
- Lint: `npm run lint` (see `eslint.config.js`).
- Contract tasks: `cd blockchain && npm run compile` to compile contracts, `npm run deploy:sonic` for Sonic testnet, `npm run export-abis` to export ABIs. See `/blockchain/SONIC_DEPLOYMENT.md` for full deployment guide.

  ### Project-specific conventions (don’t guess these)
  - **Facade-first**: Never import contract or provider logic directly in components — go through `Web3Service` or the `ContractService` wrappers.
  - **Event-based wallet cleanup**: Components expecting wallet state should listen for the `walletDisconnected` custom event emitted on disconnect.
  - **Toasters**: Use the shared toast hook `@/components/ui/use-toast` rather than `alert` or console messages for user-facing notifications.
  - **Path alias**: Always prefer `@/...` imports (configured in `vite.config.ts` and `tsconfig.*.json`).

### Quick troubleshooting pointers
- If AI advisor shows a fallback: verify `VITE_GROQ_API_KEY` is set and `src/utils/envConfig.ts` reads it correctly.
- For wallet-related bugs: reproduce with MetaMask on Sonic network, then check `Web3Service.initialize()` and event handlers for `accountsChanged` / `chainChanged` / `disconnect`.
- If contracts mismatch: run `cd blockchain && npm run compile && npm run deploy:sonic` to rebuild/deploy, then `npm run export-abis` and verify `src/services/web3/constants.ts` addresses for Sonic testnet (chain ID 64165).  If anything above is unclear or you want this expanded (examples for common edits, tests, or CI steps), tell me which area to expand and I will iterate.
