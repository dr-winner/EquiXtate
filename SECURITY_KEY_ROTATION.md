# Key Rotation Checklist (Post-Exposure)

If any secret was ever committed or pushed (even briefly), rotate it. After rotation, update your local `.env` and any CI/CD secrets.

## Secrets to Rotate
- Privy: `VITE_PRIVY_APP_ID`, `VITE_PRIVY_APP_SECRET`
- WalletConnect: `VITE_WALLETCONNECT_PROJECT_ID`
- Groq: `VITE_GROQ_API_KEY`
- Pimlico: `VITE_PIMLICO_API_KEY`
- KRNL: `VITE_KRNL_ACCESS_TOKEN`, `VITE_KRNL_ENTRY_ID` (if treated as secret)
- Sumsub (if used): `VITE_SUMSUB_APP_TOKEN`, `VITE_SUMSUB_SECRET_KEY`

## How to Rotate
1) **Privy**: Dashboard → Settings → API Keys → Regenerate App Secret (and App ID if desired). Update `.env`.
2) **WalletConnect**: Cloud dashboard → Project Settings → Rotate / create new Project ID. Update `.env`.
3) **Groq**: https://console.groq.com/ → API Keys → Create new key. Update `.env`.
4) **Pimlico**: Dashboard → API Keys → Create new key. Update `.env`.
5) **KRNL**: If the access token was exposed, generate a new one in the KRNL console and update `.env`.
6) **Sumsub**: Cockpit → API Tokens → Regenerate App Token and Secret Key. Update `.env`.

## After Rotation
- Replace values in `.env` (do not commit it).
- Restart the dev server: `npm run dev`.
- Verify the app boots without Privy errors and wallet connect flows still work.
- Optional: store rotated secrets in GitHub repo secrets (for CI) instead of `.env`.

## Housekeeping
- Ensure `.env` and any backups (`.env.recovered`) stay untracked (already covered in `.gitignore`).
- Avoid keeping old secrets anywhere in git history; push-protection is enabled on the repo.
- Run `git status` before committing to confirm no `.env` is staged.
