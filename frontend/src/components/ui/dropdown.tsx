'use client';

import { ReactNode } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: (DropdownItem | { separator: true })[];
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'end', className }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={cn('outline-none', className)}>{trigger}</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className="z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg animate-in fade-in-80 zoom-in-95"
          sideOffset={4}
        >
          {items.map((item, index) => {
            if ('separator' in item) {
              return (
                <DropdownMenu.Separator
                  key={`sep-${index}`}
                  className="h-px bg-gray-200 dark:bg-gray-700 my-1"
                />
              );
            }
            return (
              <DropdownMenu.Item
                key={item.label}
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  'flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
