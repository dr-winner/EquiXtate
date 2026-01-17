/**
 * KRNL Integration Status Component
 * 
 * Shows the current status of KRNL integration and provides
 * guidance for setting up real credentials.
 */

import React, { useEffect, useState } from 'react';
import { realKRNLService, KRNLStatus } from '@/services/RealKRNLService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, Terminal, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConnectionTest {
  success: boolean;
  mode: 'real' | 'mock';
  message: string;
  latency?: number;
}

export function KRNLStatusCard() {
  const [status, setStatus] = useState<KRNLStatus | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Get initial status
    setStatus(realKRNLService.getStatus());
  }, []);

  const testConnection = async () => {
    setTesting(true);
    const result = await realKRNLService.testConnection();
    setConnectionTest(result);
    setTesting(false);
  };

  if (!status) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              KRNL Protocol Status
              <Badge variant={status.isReady ? 'default' : 'secondary'}>
                {status.mode === 'real' ? 'Real Mode' : 'Mock Mode'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Cross-chain verification and attestation service
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testConnection}
            disabled={testing}
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test Connection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            {status.hasRpcUrl ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">RPC URL</span>
          </div>
          <div className="flex items-center gap-2">
            {status.hasEntryId ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Entry ID</span>
          </div>
          <div className="flex items-center gap-2">
            {status.hasAccessToken ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Access Token</span>
          </div>
        </div>

        {/* Status Message */}
        {!status.isReady && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Required</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{status.message}</p>
              <div className="mt-2 space-y-1">
                <p className="font-medium">Quick Setup:</p>
                <code className="block bg-muted p-2 rounded text-xs">
                  ./scripts/krnl-setup.sh
                </code>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {status.isReady && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Ready</AlertTitle>
            <AlertDescription>
              KRNL integration is fully configured and operational.
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Test Result */}
        {connectionTest && (
          <Alert variant={connectionTest.success ? 'default' : 'destructive'}>
            {connectionTest.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>Connection Test</AlertTitle>
            <AlertDescription>
              <p>{connectionTest.message}</p>
              {connectionTest.latency && (
                <p className="text-xs text-muted-foreground mt-1">
                  Latency: {connectionTest.latency}ms
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Links */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://docs.krnl.xyz/getting-started/getting-started-with-krnl/cli" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              KRNL Docs
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://discord.gg/krnl-labs" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              KRNL Discord
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact KRNL status badge for use in headers/footers
 */
export function KRNLStatusBadge() {
  const [status, setStatus] = useState<KRNLStatus | null>(null);

  useEffect(() => {
    setStatus(realKRNLService.getStatus());
  }, []);

  if (!status) return null;

  return (
    <Badge 
      variant={status.isReady ? 'default' : 'secondary'}
      className="cursor-help"
      title={status.message}
    >
      KRNL: {status.mode}
    </Badge>
  );
}

export default KRNLStatusCard;
