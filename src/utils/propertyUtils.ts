
import { PropertyType } from "@/types/property";

/**
 * Format property address for display
 */
export const formatPropertyAddress = (location: string): string => {
  return location.replace(/,\s*Ghana$/, ''); // Remove ", Ghana" from the end
};

/**
 * Format currency in USDC
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format percentage with % sign
 */
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

/**
 * Calculate token price color class based on tier
 */
export const getTokenPriceColorClass = (tokenPrice: number): string => {
  if (tokenPrice >= 80) return "text-amber-400"; // Premium
  if (tokenPrice >= 30) return "text-space-neon-purple"; // Standard
  return "text-space-neon-green"; // Basic/Affordable
};

/**
 * Get tier label based on token price
 */
export const getPriceTier = (tokenPrice: number): string => {
  if (tokenPrice >= 80) return "Premium"; 
  if (tokenPrice >= 30) return "Standard"; 
  return "Basic";
};

/**
 * Convert string property type to enum
 */
export const stringToPropertyType = (type: string): PropertyType => {
  switch (type.toLowerCase()) {
    case 'buy':
      return PropertyType.BUY;
    case 'rent':
      return PropertyType.RENT;
    case 'fractional':
      return PropertyType.FRACTIONAL;
    case 'auction':
      return PropertyType.AUCTION;
    default:
      return PropertyType.BUY; // Default fallback
  }
};
