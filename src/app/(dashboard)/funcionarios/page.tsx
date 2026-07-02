'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Tabs } from '@/components/ui/tabs';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Spinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate, getDayName } from '@/lib/utils';
import api from '@/lib/api';
import { Employee } from '@/types';
import { Briefcase, Plus, Phone, Percent, Clock, Star, Search, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FuncionariosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tabValue, setTabValue] = useState('schedule');
  const [form, setForm] = useState({ name: '', phone: '', cpf: '', role: 'BARBEIRO', commission: '50', workStartTime: '09:00', workEndTime: '19:00' });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.phone?.includes(search));

  const openDetail = (emp: Employee) => {
    setSelectedEmp(emp);
    setTabValue('schedule');
    setShowDetail(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, commission: parseFloat(form.commission) };
      const res = await api.post('/employees', payload);
      setEmployees((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ name: '', phone: '', cpf: '', role: 'BARBEIRO', commission: '50', workStartTime: '09:00', workEndTime: '19:00' });
      toast.success('Funcionario cadastrado!');
    } catch { toast.error('Erro ao cadastrar'); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Funcionarios</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{employees.length} funcionarios</p>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Novo Funcionario</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar funcionarios..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Briefcase className="h-16 w-16" />} title="Nenhum funcionario encontrado" description={search ? 'Tente buscar por nome' : 'Cadastre seu primeiro funcionario'} action={search ? undefined : { label: 'Novo Funcionario', onClick: () => setShowForm(true) }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((emp, i) => (
                <motion.div key={emp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} layout>
                  <Card className={`card-hover cursor-pointer ${!emp.active ? 'opacity-60' : ''}`} onClick={() => openDetail(emp)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar name={emp.name} size="lg" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{emp.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{emp.role}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> {emp.commission}%</span>
                            {emp.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {emp.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal open={showDetail} onOpenChange={setShowDetail} title={selectedEmp?.name} size="lg">
        {selectedEmp && (
          <Tabs value={tabValue} onValueChange={setTabValue} tabs={[
            {
              value: 'schedule',
              label: 'Horarios',
              content: (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">Horario padrao: {selectedEmp.workStartTime || '09:00'} as {selectedEmp.workEndTime || '19:00'}</p>
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getDayName(i)}</span>
                      <span className="text-sm text-gray-500">{selectedEmp.workDays?.includes(String(i)) ? `${selectedEmp.workStartTime || '09:00'} - ${selectedEmp.workEndTime || '19:00'}` : 'Folga'}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              value: 'services',
              label: 'Servicos',
              content: selectedEmp.employeeServices && selectedEmp.employeeServices.length > 0 ? (
                <div className="space-y-2">
                  {selectedEmp.employeeServices.map((es) => (
                    <div key={es.serviceId} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{es.service.name}</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(es.service.price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500"><Star className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhum servico vinculado</p></div>
              ),
            },
            {
              value: 'commissions',
              label: 'Comissoes',
              content: (
                <div className="text-center py-8 text-gray-500">
                  <Percent className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Comissao atual: {selectedEmp.commission}%</p>
                </div>
              ),
            },
          ]} />
        )}
      </Modal>

      <Modal open={showForm} onOpenChange={setShowForm} title="Novo Funcionario" description="Cadastre um novo funcionario">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Telefone" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          <Input label="Cargo" placeholder="Ex: Barbeiro, Cabelereiro" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input label="Comissao (%)" type="number" placeholder="50" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Inicio do Expediente" type="time" value={form.workStartTime} onChange={(e) => setForm({ ...form, workStartTime: e.target.value })} />
            <Input label="Fim do Expediente" type="time" value={form.workEndTime} onChange={(e) => setForm({ ...form, workEndTime: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
