'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Tabs } from '@/components/ui/tabs';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { Client } from '@/types';
import {
  Users, Search, Plus, Phone, Mail, CalendarDays,
  DollarSign, Clock, UserPlus, Scissors, X, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tabValue, setTabValue] = useState('info');
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', notes: '' });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = (client: Client) => {
    setSelectedClient(client);
    setTabValue('info');
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/clients', form);
      setClients((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', birthDate: '', notes: '' });
      toast.success('Cliente cadastrado com sucesso!');
    } catch {
      toast.error('Erro ao cadastrar cliente');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{clients.length} clientes cadastrados</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Cliente
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title="Nenhum cliente encontrado"
            description={search ? 'Tente buscar por nome, telefone ou email' : 'Cadastre seu primeiro cliente'}
            action={search ? undefined : { label: 'Novo Cliente', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                >
                  <Card className="card-hover cursor-pointer" onClick={() => openDetail(client)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar name={client.name} size="lg" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{client.name}</h3>
                          {client.phone && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" /> {client.phone}
                            </p>
                          )}
                          {client.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                              <Mail className="h-3 w-3" /> {client.email}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {client.totalVisits} visitas</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrency(client.totalSpent)}</span>
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

      <Modal open={showModal} onOpenChange={setShowModal} title={selectedClient?.name} size="lg">
        {selectedClient && (
          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            tabs={[
              {
                value: 'info',
                label: 'Informacoes',
                content: (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar name={selectedClient.name} size="xl" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedClient.name}</h3>
                        <p className="text-sm text-gray-500">Cliente desde {formatDate(selectedClient.createdAt)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedClient.phone && (
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Telefone</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedClient.phone}</p>
                        </div>
                      )}
                      {selectedClient.email && (
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedClient.email}</p>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">Total de Visitas</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedClient.totalVisits}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">Total Gasto</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedClient.totalSpent)}</p>
                      </div>
                    </div>
                    {selectedClient.notes && (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 mb-1">Observacoes</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedClient.notes}</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                value: 'history',
                label: 'Historico',
                content: (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Historico de servicos em breve</p>
                  </div>
                ),
              },
              {
                value: 'appointments',
                label: 'Agendamentos',
                content: (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Agendamentos em breve</p>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>

      <Modal open={showForm} onOpenChange={setShowForm} title="Novo Cliente" description="Cadastre um novo cliente">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nome" placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Telefone" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" type="email" placeholder="cliente@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Data de Nascimento" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          <Input label="Observacoes" placeholder="Observacoes sobre o cliente" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
