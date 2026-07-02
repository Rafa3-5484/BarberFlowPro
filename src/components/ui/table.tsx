'use client';

import { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <thead className={cn('[&_tr]:border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </thead>
  );
}

export function Tbody({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)}>
      {children}
    </tbody>
  );
}

export function Tr({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <tr className={cn('border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50', className)}>
      {children}
    </tr>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return (
    <th className={cn('h-12 px-4 text-left align-middle font-medium text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400', className)} {...props}>
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableDataCellElement>) {
  return (
    <td className={cn('p-4 align-middle text-gray-700 dark:text-gray-300', className)} {...props}>
      {children}
    </td>
  );
}
