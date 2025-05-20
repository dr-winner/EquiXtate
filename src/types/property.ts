
export enum PropertyType {
  BUY = 'Buy',
  RENT = 'Rent',
  FRACTIONAL = 'Fractional',
  AUCTION = 'Auction'
}

// EquiX token model
export interface EquiXToken {
  // 1 EquiX = $5 in value
  readonly tokenValue: 5; // in USD
  readonly symbol: 'EquiX';
}

// Token pricing constants
export const EQUIX_TOKEN_VALUE = 5; // $5 per token (previously $0.02)
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
