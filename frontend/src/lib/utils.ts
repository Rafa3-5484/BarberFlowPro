import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    CONFIRMED: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    IN_PROGRESS: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    COMPLETED: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    CANCELLED: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    NO_SHOW: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    PENDING: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    PAID: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    OPEN: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    CLOSED: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em Atendimento',
    COMPLETED: 'Finalizado',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Nao Compareceu',
    PENDING: 'Pendente',
    PAID: 'Pago',
    OPEN: 'Aberto',
    CLOSED: 'Fechado',
  };
  return labels[status] || status;
}

export function getDayName(day: number): string {
  const days = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
  return days[day] || '';
}
