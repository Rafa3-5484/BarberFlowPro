'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Settings, Bell, Shield, Store, CreditCard, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const daysOfWeek = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

export default function ConfiguracoesPage() {
  const [tabValue, setTabValue] = useState('store');

  const handleSave = () => {
    toast.success('Configurações salvas!');
  };

  const tabs = [
    {
      value: 'store',
      label: 'Barbearia',
      content: (
        <div className="space-y-4 max-w-lg">
          <Input label="Nome da Barbearia" placeholder="Minha Barbearia" defaultValue="BarberFlow Pro" />
          <Input label="Telefone" placeholder="(11) 99999-9999" />
          <Input label="Endereco" placeholder="Rua, numero, bairro" />
          <Input label="CNPJ" placeholder="00.000.000/0000-00" />
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Salvar</Button>
        </div>
      ),
    },
    {
      value: 'hours',
      label: 'Horarios',
      content: (
        <div className="space-y-4 max-w-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Defina os horários de funcionamento da barbearia</p>
          {daysOfWeek.map((day) => (
            <div key={day.value} className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-700 dark:text-gray-300">{day.label}</span>
              <input type="time" defaultValue="09:00" className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
              <span className="text-gray-400">as</span>
              <input type="time" defaultValue="19:00" className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
          ))}
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Salvar</Button>
        </div>
      ),
    },
    {
      value: 'notifications',
      label: 'Notificacoes',
      content: (
        <div className="space-y-4 max-w-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure as notificacoes do sistema</p>
          <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer">
            <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Novos Agendamentos</p><p className="text-xs text-gray-500">Notificar quando houver novo agendamento</p></div>
            <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer">
            <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lembretes</p><p className="text-xs text-gray-500">Lembrar de agendamentos 1h antes</p></div>
            <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer">
            <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Estoque Baixo</p><p className="text-xs text-gray-500">Notificar quando produto estiver com estoque baixo</p></div>
            <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
          </label>
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Salvar</Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuracoes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencia as configuracoes da sua barbearia</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5">
              <Tabs value={tabValue} onValueChange={setTabValue} tabs={tabs} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
