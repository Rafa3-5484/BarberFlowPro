'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { FileText, Download, FileSpreadsheet, TrendingUp, Users, Package, Scissors, Briefcase, Percent } from 'lucide-react';

const reportTypes = [
  { key: 'financial', label: 'Financeiro', description: 'Receitas, despesas e saldo do periodo', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  { key: 'clients', label: 'Clientes', description: 'Relatorio de clientes e frequencia', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { key: 'stock', label: 'Estoque', description: 'Produtos, vendas e nivel de estoque', icon: Package, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { key: 'services', label: 'Servicos', description: 'Servicos realizados e receita por servico', icon: Scissors, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { key: 'employees', label: 'Funcionarios', description: 'Desempenho e produtividade', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { key: 'commissions', label: 'Comissoes', description: 'Comissoes pagas e pendentes', icon: Percent, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
];

export default function RelatoriosPage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (type: string, format: 'pdf' | 'excel') => {
    setGenerating(type);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatorios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gere relatorios detalhados da sua barbearia</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Periodo do Relatorio</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input label="Data Inicial" type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                <Input label="Data Final" type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report, i) => {
            const Icon = report.icon;
            const loading = generating === report.key;
            return (
              <motion.div key={report.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <Card className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${report.bg}`}>
                        <Icon className={`h-6 w-6 ${report.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{report.label}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" loading={loading} onClick={() => handleGenerate(report.key, 'pdf')}>
                        <FileText className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" loading={loading} onClick={() => handleGenerate(report.key, 'excel')}>
                        <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
