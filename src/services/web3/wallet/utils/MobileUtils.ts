
// Utility function to generate wallet deep links for mobile devices
export function getDeepLink(): string {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return '';
  
  const userAgent = navigator.userAgent.toLowerCase();
  let deepLink = "";
  
  if (userAgent.includes("android")) {
    // Android deep linking
    deepLink = `intent://metamask.app.link/dapp/${window.location.hostname}#Intent;scheme=https;package=io.metamask;end`;
  } else {
    // iOS deep linking
    deepLink = `https://metamask.app.link/dapp/${window.location.hostname}`;
  }
  
  return deepLink;
}

// Check if running in a mobile environment
export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Check if running inside a specific wallet browser
export function detectWalletBrowser(): { name: string | null; isWalletBrowser: boolean } {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('metamask')) {
    return { name: 'MetaMask', isWalletBrowser: true };
  }
  
  if (userAgent.includes('trust')) {
    return { name: 'Trust Wallet', isWalletBrowser: true };
  }
  
  if (userAgent.includes('coinbase')) {
    return { name: 'Coinbase Wallet', isWalletBrowser: true };
  }
  
  return { name: null, isWalletBrowser: false };
}
