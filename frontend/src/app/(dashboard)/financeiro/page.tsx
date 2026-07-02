'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Tabs } from '@/components/ui/tabs';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { TrendingUp, Plus, DollarSign, ArrowUpRight, ArrowDownLeft, PieChart, CalendarDays, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function FinanceiroPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'INCOME', description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });

  const fetchRecords = async () => {
    try {
      const res = await api.get('/financial');
      setRecords(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const totals = {
    income: records.filter((r) => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0),
    expense: records.filter((r) => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0),
  };

  const monthlyData = [
    { month: 'Jan', receita: 8500, despesa: 3200 },
    { month: 'Fev', receita: 9200, despesa: 2800 },
    { month: 'Mar', receita: 10800, despesa: 3500 },
    { month: 'Abr', receita: 9500, despesa: 3100 },
    { month: 'Mai', receita: 11200, despesa: 2900 },
    { month: 'Jun', receita: totals.income > 10000 ? totals.income : 10400, despesa: totals.expense > 3000 ? totals.expense : 3300 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/financial', { ...form, amount: parseFloat(form.amount) });
      setRecords((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ type: 'INCOME', description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
      toast.success('Registro salvo!');
    } catch { toast.error('Erro ao salvar'); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div></DashboardLayout>;

  const filteredRecords = tabValue === 'all' ? records : records.filter((r) => r.type === tabValue.toUpperCase());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Controle financeiro da barbearia</p>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Novo Registro</Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30"><ArrowUpRight className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receitas</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30"><ArrowDownLeft className="h-5 w-5 text-red-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Despesas</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(totals.expense)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30"><DollarSign className="h-5 w-5 text-primary-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Saldo</p>
                    <p className={`text-xl font-bold ${totals.income - totals.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totals.income - totals.expense)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Receita x Despesa - Ultimos 6 Meses</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} formatter={(value: number) => [formatCurrency(value)]} />
                    <Bar dataKey="receita" fill="#22c55e" radius={[4, 4, 0, 0]} name="Receita" />
                    <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-0">
              <Tabs value={tabValue} onValueChange={setTabValue} tabs={[
                { value: 'all', label: 'Todos', content: null! },
                { value: 'income', label: 'Receitas', content: null! },
                { value: 'expense', label: 'Despesas', content: null! },
              ].map((t) => ({ ...t, content: null! }))} />
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar:</span>
                <Tabs value={tabValue} onValueChange={setTabValue} tabs={[
                  { value: 'all', label: 'Todos', content: <></> },
                  { value: 'income', label: 'Receitas', content: <></> },
                  { value: 'expense', label: 'Despesas', content: <></> },
                ]} />
              </div>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhum registro financeiro</p></div>
              ) : (
                <Table>
                  <Thead>
                    <Tr><Th>Data</Th><Th>Descricao</Th><Th>Categoria</Th><Th>Tipo</Th><Th className="text-right">Valor</Th></Tr>
                  </Thead>
                  <Tbody>
                    {filteredRecords.map((rec) => (
                      <Tr key={rec.id}>
                        <Td className="text-gray-500">{formatDate(rec.date)}</Td>
                        <Td><span className="font-medium text-gray-900 dark:text-white">{rec.description}</span></Td>
                        <Td>{rec.category ? <Badge variant="primary" size="sm">{rec.category}</Badge> : '-'}</Td>
                        <Td><Badge variant={rec.type === 'INCOME' ? 'success' : 'danger'}>{rec.type === 'INCOME' ? 'Receita' : 'Despesa'}</Badge></Td>
                        <Td className={`text-right font-bold ${rec.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{rec.type === 'INCOME' ? '+' : '-'}{formatCurrency(rec.amount)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Modal open={showForm} onOpenChange={setShowForm} title="Novo Registro Financeiro">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Tipo" value={form.type} onValueChange={(v) => setForm({ ...form, type: v })} options={[
            { value: 'INCOME', label: 'Receita' }, { value: 'EXPENSE', label: 'Despesa' },
          ]} />
          <Input label="Descricao" placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Input label="Valor (R$)" type="number" step="0.01" placeholder="0,00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="Categoria" placeholder="Ex: Aluguel, Salarios" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
