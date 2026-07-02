'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { Product } from '@/types';
import { Package, Plus, Search, Edit2, Trash2, Save, TrendingDown, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', stock: '0', minStock: '5', category: '' });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    const matchStock = showLowStock ? p.stock <= p.minStock : true;
    return matchSearch && matchStock;
  });

  const getStockLevel = (stock: number, min: number) => {
    if (stock <= 0) return { label: 'Critico', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' };
    if (stock <= min) return { label: 'Baixo', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' };
    return { label: 'OK', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), cost: form.cost ? parseFloat(form.cost) : undefined, stock: parseInt(form.stock), minStock: parseInt(form.minStock) };
      if (editing) {
        const res = await api.patch(`/products/${editing.id}`, payload);
        setProducts((prev) => prev.map((p) => p.id === editing.id ? res.data : p));
        toast.success('Produto atualizado!');
      } else {
        const res = await api.post('/products', payload);
        setProducts((prev) => [...prev, res.data]);
        toast.success('Produto cadastrado!');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', price: '', cost: '', stock: '0', minStock: '5', category: '' });
    } catch { toast.error('Erro ao salvar produto'); }
  };

  const openEdit = (prod: Product) => {
    setEditing(prod);
    setForm({ name: prod.name, description: prod.description || '', price: String(prod.price), cost: prod.cost ? String(prod.cost) : '', stock: String(prod.stock), minStock: String(prod.minStock), category: prod.category || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produto excluido!');
    } catch { toast.error('Erro ao excluir'); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{products.length} produtos cadastrados</p>
          </div>
          <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', cost: '', stock: '0', minStock: '5', category: '' }); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Produto
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button onClick={() => setShowLowStock(!showLowStock)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showLowStock ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            <TrendingDown className="h-4 w-4" /> Estoque Baixo
          </button>
        </motion.div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Package className="h-16 w-16" />} title="Nenhum produto encontrado" description={search ? 'Tente buscar por nome' : 'Cadastre seu primeiro produto'} action={search ? undefined : { label: 'Novo Produto', onClick: () => setShowForm(true) }} />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Produto</Th>
                    <Th>Categoria</Th>
                    <Th>Preco</Th>
                    <Th>Custo</Th>
                    <Th>Estoque</Th>
                    <Th className="text-right">Acoes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <AnimatePresence>
                    {filtered.map((prod, i) => {
                      const stockLevel = getStockLevel(prod.stock, prod.minStock);
                      return (
                        <motion.tr key={prod.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} exit={{ opacity: 0 }} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <Td>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{prod.name}</p>
                              {prod.description && <p className="text-xs text-gray-500">{prod.description}</p>}
                            </div>
                          </Td>
                          <Td>{prod.category ? <Badge variant="primary" size="sm">{prod.category}</Badge> : '-'}</Td>
                          <Td className="font-medium">{formatCurrency(prod.price)}</Td>
                          <Td>{prod.cost ? formatCurrency(prod.cost) : '-'}</Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockLevel.color}`}>{stockLevel.label}</span>
                              <span className="text-sm">{prod.stock} / {prod.minStock}</span>
                            </div>
                          </Td>
                          <Td>
                            <div className="flex justify-end gap-1">
                              <button onClick={() => openEdit(prod)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(prod.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </Td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </Tbody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal open={showForm} onOpenChange={setShowForm} title={editing ? 'Editar Produto' : 'Novo Produto'} description="Preencha os dados do produto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" placeholder="Nome do produto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Descricao" placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preco de Venda (R$)" type="number" step="0.01" placeholder="0,00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Custo (R$)" type="number" step="0.01" placeholder="0,00" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Estoque Atual" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            <Input label="Estoque Minimo" type="number" placeholder="5" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} required />
          </div>
          <Input label="Categoria" placeholder="Ex: Shampoo, Condicionador" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
