export type UserRole = 'OWNER' | 'MANAGER' | 'BARBER' | 'RECEPTIONIST' | 'CLIENT';

export type AppointmentStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type PaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'WITHDRAWAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  photo?: string;
  birthDate?: string;
  birthDateStr?: string;
  notes?: string;
  lastVisit?: string;
  nextAppointment?: string;
  totalVisits: number;
  totalSpent: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone?: string;
  cpf?: string;
  role: string;
  commission: number;
  active: boolean;
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string;
  userId?: string;
  appointments?: Appointment[];
  employeeServices?: { serviceId: string; service: Service }[];
  workSchedule?: WorkSchedule[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  status: AppointmentStatus;
  notes?: string;
  totalValue: number;
  client: Client;
  employee: Employee;
  service: Service;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  category?: string;
  active: boolean;
}

export interface CashRegister {
  id: string;
  openDate: string;
  closeDate?: string;
  initialAmount: number;
  finalAmount?: number;
  status: string;
  notes?: string;
  user: User;
  movements: CashMovement[];
}

export interface CashMovement {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  date: string;
  serviceValue: number;
  commissionPercent: number;
  commissionValue: number;
  paid: boolean;
  paidDate?: string;
  employee: Employee;
  appointment: Appointment;
}

export interface DashboardData {
  todayAppointments: number;
  todayCompleted: number;
  todayPending: number;
  todayRevenue: number;
  monthRevenue: number;
  topServices: { name: string; count: number; revenue: number }[];
  topProducts: { name: string; quantity: number }[];
  newClients: number;
  recurringClients: number;
  appointmentsByHour: { hour: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  weeklyAppointments: { day: string; count: number }[];
  recentAppointments: Appointment[];
  commissionsTotal: number;
  lowStockProducts: Product[];
}

export interface WorkSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}
