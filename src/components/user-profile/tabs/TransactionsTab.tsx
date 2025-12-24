
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from '@/utils/propertyUtils';
import { STABLECOIN_SYMBOL } from '@/types/property';

interface Transaction {
  date: string;
  type: string;
  property: string;
  tokens: number;
  amount: number;
}

interface TransactionsTabProps {
  transactions: Transaction[];
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Transaction</TableHead>
            <TableHead className="text-muted-foreground">Property</TableHead>
            <TableHead className="text-muted-foreground">Tokens</TableHead>
            <TableHead className="text-muted-foreground">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, index) => (
            <TableRow key={index}>
              <TableCell>{tx.date}</TableCell>
              <TableCell>
                <Badge variant={tx.type === 'Sale' ? 'destructive' : tx.type === 'Rent Collection' ? 'secondary' : tx.type === 'Governance Reward' ? 'outline' : 'default'}>
                  {tx.type}
                </Badge>
              </TableCell>
              <TableCell>{tx.property}</TableCell>
              <TableCell>{tx.tokens > 0 ? tx.tokens : '-'}</TableCell>
              <TableCell className="font-mono">{formatPrice(tx.amount)} {STABLECOIN_SYMBOL}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsTab;
