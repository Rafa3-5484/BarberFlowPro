'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/loading';
import { formatCurrency, formatTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { DashboardData } from '@/types';
import { CalendarDays, CheckCircle2, DollarSign, Percent, ArrowUp, ArrowDown, Clock, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const stats = [
    { label: 'Agendamentos Hoje', value: data?.todayAppointments || 0, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', change: '+12%' },
    { label: 'Atendidos', value: data?.todayCompleted || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', change: '+8%' },
    { label: 'Receita do Dia', value: formatCurrency(data?.todayRevenue || 0), icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30', change: '+15%' },
    { label: 'Comissoes', value: formatCurrency(data?.commissionsTotal || 0), icon: Percent, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', change: '+5%' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ola, {user?.name?.split(' ')[0] || 'Usuario'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{dateStr}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-hover">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                          <ArrowUp className="h-3 w-3" />
                          {stat.change}
                        </span>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agendamentos Recentes</h3>
              </CardHeader>
              <CardContent>
                {data?.recentAppointments && data.recentAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentAppointments.slice(0, 6).map((apt) => (
                      <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <Avatar name={apt.client.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{apt.client.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{apt.service.name} - {apt.employee.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formatTime(apt.date)}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum agendamento hoje</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receita Mensal</h3>
              </CardHeader>
              <CardContent>
                {data?.monthlyRevenue && data.monthlyRevenue.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.monthlyRevenue} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff' }}
                          formatter={(value: number) => [formatCurrency(value), 'Receita']}
                        />
                        <Bar dataKey="revenue" fill="#4c6ef5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Sem dados de receita</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Servicos mais Realizados</h3>
              </CardHeader>
              <CardContent>
                {data?.topServices && data.topServices.length > 0 ? (
                  <div className="space-y-4">
                    {data.topServices.slice(0, 5).map((svc, i) => (
                      <div key={svc.name} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-400 w-6">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{svc.name}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{svc.count}x</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(svc.count / Math.max(...data.topServices.map((s) => s.count))) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.2 * i }}
                              className="bg-primary-500 h-2 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum servico realizado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produtos com Estoque Baixo</h3>
              </CardHeader>
              <CardContent>
                {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                  <div className="space-y-3">
                    {data.lowStockProducts.slice(0, 5).map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{prod.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{prod.category || 'Sem categoria'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">{prod.stock} unid.</p>
                          <p className="text-xs text-gray-500">Min: {prod.minStock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Todos os produtos em nivel adequado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
