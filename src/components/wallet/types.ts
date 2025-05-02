
export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error"
}

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

export interface NetworkInfo {
  chainId: string | null;
  name: string;
}
