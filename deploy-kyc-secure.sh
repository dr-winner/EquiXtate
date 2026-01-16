#!/bin/bash
# Secure KYC Verifier Deployment Script
# Usage: ./deploy-kyc-secure.sh
# This script safely deploys KYCVerifier without exposing keys in shell history

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 KYC Verifier Secure Deployment Script${NC}"
echo "========================================"

# Step 1: Validate prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v forge &> /dev/null; then
  echo -e "${RED}❌ Foundry not installed. Run: brew install foundry${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Foundry installed${NC}"

if ! command -v cast &> /dev/null; then
  echo -e "${RED}❌ Cast not installed. Run: foundryup${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Cast installed${NC}"

# Step 2: Get oracle address
echo -e "\n${YELLOW}Step 2: Oracle wallet setup${NC}"
read -sp "Enter your ORACLE wallet address (0x...): " ORACLE_ADDRESS
echo ""

if [[ ! $ORACLE_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
  echo -e "${RED}❌ Invalid Ethereum address${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Oracle address validated: $ORACLE_ADDRESS${NC}"

# Step 3: Create temporary .env for this deployment
echo -e "\n${YELLOW}Step 3: Reading deployment credentials securely...${NC}"

# Read from .env.local (gitignored) if it exists, otherwise from .env
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE=".env"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}❌ .env file not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Using config from: $ENV_FILE${NC}"

# Read values safely from env file (not from shell)
PRIVATE_KEY=$(grep "PRIVATE_KEY=" "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ')
ETHERSCAN_API_KEY=$(grep "ETHERSCAN_API_KEY=" "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ')

if [ -z "$PRIVATE_KEY" ]; then
  echo -e "${RED}❌ PRIVATE_KEY not found in $ENV_FILE${NC}"
  exit 1
fi

if [ -z "$ETHERSCAN_API_KEY" ]; then
  echo -e "${RED}⚠️  ETHERSCAN_API_KEY not found - contract won't be verified${NC}"
  ETHERSCAN_API_KEY=""
fi

# Step 4: Display deployment info
echo -e "\n${YELLOW}Step 4: Deployment Information${NC}"
echo "-------------------------------"
echo "Network: Sepolia (testnet)"
echo "RPC URL: https://ethereum-sepolia-rpc.publicnode.com"
echo "Oracle Address: $ORACLE_ADDRESS"
echo ""
read -p "Does this look correct? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}❌ Deployment cancelled${NC}"
  exit 1
fi

# Step 5: Deploy contract
echo -e "\n${YELLOW}Step 5: Deploying KYCVerifier contract...${NC}"

cd src/contracts || { echo -e "${RED}❌ src/contracts directory not found${NC}"; exit 1; }

DEPLOY_CMD="forge create KYCVerifier \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY \
  --constructor-args $ORACLE_ADDRESS"

# Add etherscan verification if key is available
if [ -n "$ETHERSCAN_API_KEY" ]; then
  DEPLOY_CMD="$DEPLOY_CMD \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify"
fi

# Execute deployment and capture output
OUTPUT=$($DEPLOY_CMD 2>&1)
EXIT_CODE=$?

# Extract contract address from output
if [[ $OUTPUT =~ Deployed\ to:\ (0x[a-fA-F0-9]{40}) ]]; then
  CONTRACT_ADDRESS="${BASH_REMATCH[1]}"
  echo -e "${GREEN}✅ Contract deployed successfully!${NC}"
  echo "Contract Address: $CONTRACT_ADDRESS"
else
  echo -e "${RED}❌ Deployment failed${NC}"
  echo "Output: $OUTPUT"
  exit 1
fi

# Step 6: Verify oracle is set correctly
echo -e "\n${YELLOW}Step 6: Verifying oracle configuration...${NC}"

VERIFIED_ORACLE=$(cast call "$CONTRACT_ADDRESS" \
  "kycOracle()(address)" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com)

if [[ $VERIFIED_ORACLE == "0x"* ]]; then
  VERIFIED_ORACLE=$(echo "$VERIFIED_ORACLE" | tr '[:upper:]' '[:lower:]')
  ORACLE_CHECK=$(echo "$ORACLE_ADDRESS" | tr '[:upper:]' '[:lower:]')
  
  if [ "$VERIFIED_ORACLE" == "$ORACLE_CHECK" ]; then
    echo -e "${GREEN}✅ Oracle correctly set to: $VERIFIED_ORACLE${NC}"
  else
    echo -e "${RED}❌ Oracle mismatch! Set: $VERIFIED_ORACLE, Expected: $ORACLE_CHECK${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Could not verify oracle (may retry later)${NC}"
fi

# Step 7: Save configuration
echo -e "\n${YELLOW}Step 7: Saving configuration...${NC}"

# Go back to project root
cd ../.. || exit 1

# Create .env.kyc with only what's needed (and gitignored)
cat > .env.kyc << EOF
# KYC Verifier Contract Configuration
# Add these to your .env.local or backend .env

# Frontend config
VITE_KYC_VERIFIER_CONTRACT=$CONTRACT_ADDRESS

# Backend config (KEEP PRIVATE - do NOT commit)
KYC_VERIFIER_CONTRACT=$CONTRACT_ADDRESS
ORACLE_ADDRESS=$ORACLE_ADDRESS
ORACLE_PRIVATE_KEY=<paste_oracle_wallet_private_key_here>
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
EOF

echo -e "${GREEN}✅ Configuration saved to: .env.kyc${NC}"

# Step 8: Final instructions
echo -e "\n${YELLOW}Step 8: Next Steps${NC}"
echo "========================================"
echo ""
echo "1. Add to frontend .env.local:"
echo "   ${GREEN}VITE_KYC_VERIFIER_CONTRACT=$CONTRACT_ADDRESS${NC}"
echo ""
echo "2. Add to backend .env (KEEP PRIVATE):"
echo "   ${GREEN}KYC_VERIFIER_CONTRACT=$CONTRACT_ADDRESS${NC}"
echo "   ${GREEN}ORACLE_PRIVATE_KEY=0x<oracle_wallet_private_key>${NC}"
echo "   ${GREEN}ORACLE_ADDRESS=$ORACLE_ADDRESS${NC}"
echo ""
echo "3. Configure Sumsub webhook at:"
echo "   ${GREEN}https://cockpit.sumsub.com/ → Settings → Webhooks${NC}"
echo "   URL: https://your-backend.com/api/sumsub/webhook"
echo ""
echo "4. View on Etherscan:"
echo "   ${GREEN}https://sepolia.etherscan.io/address/$CONTRACT_ADDRESS${NC}"
echo ""
echo -e "${YELLOW}Contract deployment complete! 🎉${NC}"

# Cleanup: Clear sensitive variables
unset PRIVATE_KEY
unset ETHERSCAN_API_KEY
unset ORACLE_ADDRESS
