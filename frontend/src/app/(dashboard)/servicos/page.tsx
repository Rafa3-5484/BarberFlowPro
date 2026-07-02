'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { Service } from '@/types';
import { Scissors, Plus, Clock, Edit2, Trash2, Search, Save, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  { value: 'CORTE', label: 'Corte' },
  { value: 'BARBA', label: 'Barba' },
  { value: 'CORTE_BARBA', label: 'Corte + Barba' },
  { value: 'HIDRATACAO', label: 'Hidratacao' },
  { value: 'SOBRANCELHA', label: 'Sobrancelha' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '30', category: 'CORTE' });

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const categoriesSet = new Set(services.map((s) => s.category || 'OUTROS'));
  const allCategories = ['TODOS', ...Array.from(categoriesSet)];

  const filtered = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'TODOS' || s.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) };
      if (editing) {
        const res = await api.patch(`/services/${editing.id}`, payload);
        setServices((prev) => prev.map((s) => s.id === editing.id ? res.data : s));
        toast.success('Servico atualizado!');
      } else {
        const res = await api.post('/services', payload);
        setServices((prev) => [...prev, res.data]);
        toast.success('Servico cadastrado!');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', price: '', duration: '30', category: 'CORTE' });
    } catch { toast.error('Erro ao salvar servico'); }
  };

  const openEdit = (svc: Service) => {
    setEditing(svc);
    setForm({ name: svc.name, description: svc.description || '', price: String(svc.price), duration: String(svc.duration), category: svc.category || 'CORTE' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este servico?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success('Servico excluido!');
    } catch { toast.error('Erro ao excluir servico'); }
  };

  const toggleActive = async (svc: Service) => {
    try {
      const res = await api.patch(`/services/${svc.id}`, { active: !svc.active });
      setServices((prev) => prev.map((s) => s.id === svc.id ? res.data : s));
    } catch { toast.error('Erro ao alterar status'); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Servicos</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{services.length} servicos cadastrados</p>
          </div>
          <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', duration: '30', category: 'CORTE' }); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Servico
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar servicos..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {cat === 'TODOS' ? 'Todos' : categories.find((c) => c.value === cat)?.label || cat}
              </button>
            ))}
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Scissors className="h-16 w-16" />} title="Nenhum servico encontrado" description={search ? 'Tente buscar por nome' : 'Cadastre seu primeiro servico'} action={search ? undefined : { label: 'Novo Servico', onClick: () => { setEditing(null); setForm({ name: '', description: '', price: '', duration: '30', category: 'CORTE' }); setShowForm(true); }}} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((svc, i) => (
                <motion.div key={svc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} layout>
                  <Card className={`card-hover ${!svc.active ? 'opacity-60' : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                            <Scissors className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{svc.name}</h3>
                            {svc.category && <Badge variant="primary" size="sm">{categories.find((c) => c.value === svc.category)?.label || svc.category}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => toggleActive(svc)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            {svc.active ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-400" />}
                          </button>
                          <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(svc.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {svc.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{svc.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(svc.price)}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {svc.duration} min</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal open={showForm} onOpenChange={setShowForm} title={editing ? 'Editar Servico' : 'Novo Servico'} description="Preencha os dados do servico">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" placeholder="Ex: Corte Degrade" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Descricao" placeholder="Descricao do servico" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Preco (R$)" type="number" step="0.01" placeholder="0,00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Duracao (min)" type="number" placeholder="30" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
          <Select label="Categoria" value={form.category} onValueChange={(v) => setForm({ ...form, category: v })} options={categories} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
