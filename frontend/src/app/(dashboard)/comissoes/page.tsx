'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import Button from '@/components/ui/button';
import { Spinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { CommissionRecord, Employee } from '@/types';
import { Percent, CheckCircle2, XCircle, Search, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComissoesPage() {
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPaid, setFilterPaid] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [period, setPeriod] = useState('current');

  const fetchCommissions = async () => {
    try {
      const res = await api.get('/commissions');
      setRecords(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCommissions(); }, []);

  const filtered = records.filter((r) => {
    if (filterPaid === 'PAID') return r.paid;
    if (filterPaid === 'UNPAID') return !r.paid;
    return true;
  });

  const totalPaid = filtered.filter((r) => r.paid).reduce((s, r) => s + r.commissionValue, 0);
  const totalUnpaid = filtered.filter((r) => !r.paid).reduce((s, r) => s + r.commissionValue, 0);

  const employeeTotals = filtered.reduce((acc, r) => {
    const name = r.employee.name;
    if (!acc[name]) acc[name] = { paid: 0, unpaid: 0, count: 0 };
    if (r.paid) acc[name].paid += r.commissionValue;
    else acc[name].unpaid += r.commissionValue;
    acc[name].count++;
    return acc;
  }, {} as Record<string, { paid: number; unpaid: number; count: number }>);

  const markAsPaid = async (id: string) => {
    try {
      await api.patch(`/commissions/${id}/pay`);
      setRecords((prev) => prev.map((r) => r.id === id ? { ...r, paid: true, paidDate: new Date().toISOString() } : r));
      toast.success('Comissao marcada como paga!');
    } catch { toast.error('Erro ao atualizar'); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comissoes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de comissoes dos funcionarios</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Percent className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total em Comissoes</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPaid + totalUnpaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pagas</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30"><XCircle className="h-5 w-5 text-red-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {Object.keys(employeeTotals).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Resumo por Funcionario</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(employeeTotals).map(([name, data], i) => (
                <motion.div key={name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <Card className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{data.count} comissoes</span>
                        <span className="text-green-600">Pago: {formatCurrency(data.paid)}</span>
                        <span className="text-red-600">Pendente: {formatCurrency(data.unpaid)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar:</span>
          <div className="flex gap-2">
            {([['ALL', 'Todas'], ['PAID', 'Pagas'], ['UNPAID', 'Pendentes']] as const).map(([value, label]) => (
              <button key={value} onClick={() => setFilterPaid(value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterPaid === value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Percent className="h-16 w-16" />} title="Nenhuma comissao encontrada" description="As comissoes aparecerao apos os atendimentos" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <Thead>
                  <Tr><Th>Data</Th><Th>Funcionario</Th><Th>Servico</Th><Th>Valor Servico</Th><Th>%</Th><Th>Comissao</Th><Th>Status</Th><Th className="text-right">Acao</Th></Tr>
                </Thead>
                <Tbody>
                  {filtered.map((rec) => (
                    <Tr key={rec.id}>
                      <Td className="text-gray-500">{formatDate(rec.date)}</Td>
                      <Td><span className="font-medium text-gray-900 dark:text-white">{rec.employee.name}</span></Td>
                      <Td className="text-gray-500">{rec.appointment?.service?.name || '-'}</Td>
                      <Td>{formatCurrency(rec.serviceValue)}</Td>
                      <Td>{rec.commissionPercent}%</Td>
                      <Td className="font-bold text-gray-900 dark:text-white">{formatCurrency(rec.commissionValue)}</Td>
                      <Td>
                        <Badge variant={rec.paid ? 'success' : 'warning'}>{rec.paid ? 'Pago' : 'Pendente'}</Badge>
                      </Td>
                      <Td className="text-right">
                        {!rec.paid && (
                          <Button size="sm" variant="success" onClick={() => markAsPaid(rec.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Marcar Pago
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
