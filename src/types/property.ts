
export enum PropertyType {
  BUY = 'Buy',
  RENT = 'Rent',
  FRACTIONAL = 'Fractional',
  AUCTION = 'Auction'
}

// EquiX token model
export interface EquiXToken {
  // 50 EquiX = $1 in value
  // 1 EquiX = $0.02
  readonly tokenValue: 0.02; // in USD
  readonly symbol: 'EquiX';
}

// Token pricing constants
export const EQUIX_TOKEN_VALUE = 0.02; // $0.02 per token (50 tokens = $1)
export const EQUIX_TOKEN_SYMBOL = 'EquiX';
export const STABLECOIN_SYMBOL = 'USDC';

// Convert property price to required tokens
export const calculateRequiredTokens = (propertyPriceUSDC: number): number => {
  return propertyPriceUSDC / EQUIX_TOKEN_VALUE;
};

// Convert tokens to USDC value
export const calculateTokenValue = (tokens: number): number => {
  return tokens * EQUIX_TOKEN_VALUE;
};
