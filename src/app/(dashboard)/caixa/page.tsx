'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import api from '@/lib/api';
import { CashRegister, CashMovement } from '@/types';
import { DollarSign, Plus, Lock, Unlock, Search, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CaixaPage() {
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegister, setActiveRegister] = useState<CashRegister | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [movementFilter, setMovementFilter] = useState('ALL');
  const [form, setForm] = useState({ type: 'INCOME', description: '', amount: '', paymentMethod: 'CASH' });

  const fetchRegisters = async () => {
    try {
      const res = await api.get('/cash-register');
      setRegisters(res.data);
      const open = res.data.find((r: CashRegister) => r.status === 'OPEN');
      if (open) setActiveRegister(open);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRegisters(); }, []);

  const openRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const initialAmount = parseFloat(form.amount) || 0;
      const res = await api.post('/cash-register/open', { initialAmount });
      setActiveRegister(res.data);
      setRegisters((prev) => [...prev, res.data]);
      setShowOpenForm(false);
      setForm({ type: 'INCOME', description: '', amount: '', paymentMethod: 'CASH' });
      toast.success('Caixa aberto!');
    } catch { toast.error('Erro ao abrir caixa'); }
  };

  const closeRegister = async () => {
    if (!confirm('Fechar o caixa?')) return;
    try {
      await api.post('/cash-register/close');
      setActiveRegister(null);
      toast.success('Caixa fechado!');
    } catch { toast.error('Erro ao fechar caixa'); }
  };

  const addMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/cash-register/movement', {
        type: form.type,
        description: form.description,
        amount: parseFloat(form.amount),
        paymentMethod: form.type === 'INCOME' ? form.paymentMethod : undefined,
      });
      if (activeRegister) {
        setActiveRegister({
          ...activeRegister,
          movements: [...activeRegister.movements, res.data],
        });
      }
      setShowForm(false);
      setForm({ type: 'INCOME', description: '', amount: '', paymentMethod: 'CASH' });
      toast.success('Movimentacao registrada!');
    } catch { toast.error('Erro ao registrar'); }
  };

  const filteredMovements = activeRegister?.movements.filter((m) => movementFilter === 'ALL' || m.type === movementFilter) || [];

  const totals = {
    income: activeRegister?.movements.filter((m) => m.type === 'INCOME').reduce((s, m) => s + m.amount, 0) || 0,
    expense: activeRegister?.movements.filter((m) => m.type === 'EXPENSE').reduce((s, m) => s + m.amount, 0) || 0,
    withdrawal: activeRegister?.movements.filter((m) => m.type === 'WITHDRAWAL').reduce((s, m) => s + m.amount, 0) || 0,
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Caixa</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de caixa diario</p>
          </div>
          {activeRegister ? (
            <Button variant="danger" onClick={closeRegister}><Lock className="h-4 w-4 mr-2" /> Fechar Caixa</Button>
          ) : (
            <Button onClick={() => { setForm({ type: 'INCOME', description: '', amount: '', paymentMethod: 'CASH' }); setShowOpenForm(true); }}>
              <Unlock className="h-4 w-4 mr-2" /> Abrir Caixa
            </Button>
          )}
        </motion.div>

        {activeRegister ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-600">Caixa Aberto</span>
                    <span className="text-xs text-gray-400 ml-auto">Aberto em {formatDateTime(activeRegister.openDate)}</span>
                  </div>
                  {activeRegister.initialAmount > 0 && <p className="text-sm text-gray-500 mb-3">Valor inicial: {formatCurrency(activeRegister.initialAmount)}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-xs text-blue-600 dark:text-blue-400">Total Recebido</p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totals.income)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <p className="text-xs text-red-600 dark:text-red-400">Despesas</p>
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatCurrency(totals.expense)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Retiradas</p>
                      <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{formatCurrency(totals.withdrawal)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-xs text-green-600 dark:text-green-400">Saldo</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(activeRegister.initialAmount + totals.income - totals.expense - totals.withdrawal)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Movimentacoes</h3>
              <div className="flex gap-2">
                <select value={movementFilter} onChange={(e) => setMovementFilter(e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
                  <option value="ALL">Todas</option>
                  <option value="INCOME">Entradas</option>
                  <option value="EXPENSE">Despesas</option>
                  <option value="WITHDRAWAL">Retiradas</option>
                </select>
                <Button size="sm" onClick={() => { setForm({ type: 'INCOME', description: '', amount: '', paymentMethod: 'CASH' }); setShowForm(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Nova
                </Button>
              </div>
            </motion.div>

            {filteredMovements.length === 0 ? (
              <EmptyState icon={<DollarSign className="h-16 w-16" />} title="Nenhuma movimentacao" description="Registre entradas e saidas do caixa" action={{ label: 'Nova Movimentacao', onClick: () => { setForm({ type: 'INCOME', description: '', amount: '', paymentMethod: 'CASH' }); setShowForm(true); }}} />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMovements.map((mov) => (
                      <div key={mov.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${mov.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30' : mov.type === 'EXPENSE' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                            {mov.type === 'INCOME' ? <ArrowUpRight className={`h-4 w-4 ${mov.type === 'INCOME' ? 'text-green-600' : mov.type === 'EXPENSE' ? 'text-red-600' : 'text-yellow-600'}`} /> : <ArrowDownLeft className={`h-4 w-4 ${mov.type === 'EXPENSE' ? 'text-red-600' : 'text-yellow-600'}`} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{mov.description}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(mov.createdAt)} {mov.paymentMethod && `- ${mov.paymentMethod}`}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${mov.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          {mov.type === 'INCOME' ? '+' : '-'}{formatCurrency(mov.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <EmptyState icon={<Lock className="h-16 w-16" />} title="Caixa Fechado" description="Abra o caixa para comecar a registrar movimentacoes" action={{ label: 'Abrir Caixa', onClick: () => setShowOpenForm(true) }} />
        )}
      </div>

      <Modal open={showOpenForm} onOpenChange={setShowOpenForm} title="Abrir Caixa" description="Informe o valor inicial">
        <form onSubmit={openRegister} className="space-y-4">
          <Input label="Valor Inicial (R$)" type="number" step="0.01" placeholder="0,00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowOpenForm(false)}>Cancelar</Button>
            <Button type="submit"><Unlock className="h-4 w-4 mr-2" /> Abrir Caixa</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showForm} onOpenChange={setShowForm} title="Nova Movimentacao" description="Registre entrada ou saida">
        <form onSubmit={addMovement} className="space-y-4">
          <Select label="Tipo" value={form.type} onValueChange={(v) => setForm({ ...form, type: v })} options={[
            { value: 'INCOME', label: 'Entrada' },
            { value: 'EXPENSE', label: 'Despesa' },
            { value: 'WITHDRAWAL', label: 'Retirada' },
          ]} />
          <Input label="Descricao" placeholder="Descricao da movimentacao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Input label="Valor (R$)" type="number" step="0.01" placeholder="0,00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          {form.type === 'INCOME' && (
            <Select label="Forma de Pagamento" value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })} options={[
              { value: 'CASH', label: 'Dinheiro' },
              { value: 'PIX', label: 'PIX' },
              { value: 'CREDIT_CARD', label: 'Cartao de Credito' },
              { value: 'DEBIT_CARD', label: 'Cartao de Debito' },
            ]} />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit"><Plus className="h-4 w-4 mr-2" /> Registrar</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
