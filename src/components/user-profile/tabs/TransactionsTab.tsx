
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
          <TableRow className="border-space-deep-purple">
            <TableHead className="text-gray-300">Date</TableHead>
            <TableHead className="text-gray-300">Transaction</TableHead>
            <TableHead className="text-gray-300">Property</TableHead>
            <TableHead className="text-gray-300">Tokens</TableHead>
            <TableHead className="text-gray-300">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, index) => (
            <TableRow key={index} className="border-space-deep-purple">
              <TableCell>{tx.date}</TableCell>
              <TableCell>
                <Badge className={tx.type === 'Purchase' ? 'bg-space-neon-green' : 
                               tx.type === 'Sale' ? 'bg-red-500' : 
                               tx.type === 'Rent Collection' ? 'bg-amber-400' : 
                               'bg-space-neon-purple'}>
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
