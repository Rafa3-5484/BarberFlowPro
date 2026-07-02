'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { Scissors, CalendarDays, Clock, User, Phone, Mail, Save, LogIn, UserPlus } from 'lucide-react';

export default function ClientAreaPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [tabValue, setTabValue] = useState('upcoming');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [bookingStep, setBookingStep] = useState(0);

  const mockAppointments = [
    { id: '1', date: '2026-07-05T14:00:00', service: 'Corte Degrade', barber: 'Carlos', status: 'CONFIRMED', value: 45 },
    { id: '2', date: '2026-07-12T10:00:00', service: 'Corte + Barba', barber: 'Pedro', status: 'CONFIRMED', value: 65 },
  ];

  const mockHistory = [
    { id: '3', date: '2026-06-28T15:00:00', service: 'Corte Social', barber: 'Carlos', status: 'COMPLETED', value: 40 },
    { id: '4', date: '2026-06-21T11:00:00', service: 'Barba', barber: 'Pedro', status: 'COMPLETED', value: 25 },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">BarberFlow Pro</span>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto mt-16 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {authMode === 'login' ? 'Area do Cliente' : 'Criar Conta'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {authMode === 'login' ? 'Acesse para gerenciar seus agendamentos' : 'Cadastre-se e agende seus horarios'}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6">
                {authMode === 'login' ? (
                  <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4">
                    <Input label="Email" type="email" placeholder="seu@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                    <Input label="Senha" type="password" placeholder="Sua senha" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                    <Button type="submit" className="w-full"><LogIn className="h-4 w-4 mr-2" /> Entrar</Button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Nao tem conta?{' '}
                      <button type="button" onClick={() => setAuthMode('register')} className="text-primary-600 font-medium">Cadastre-se</button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4">
                    <Input label="Nome" placeholder="Seu nome" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
                    <Input label="Email" type="email" placeholder="seu@email.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                    <Input label="Telefone" placeholder="(11) 99999-9999" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                    <Input label="Senha" type="password" placeholder="Minimo 6 caracteres" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                    <Button type="submit" className="w-full"><UserPlus className="h-4 w-4 mr-2" /> Cadastrar</Button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Ja tem conta?{' '}
                      <button type="button" onClick={() => setAuthMode('login')} className="text-primary-600 font-medium">Faca login</button>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Scissors className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">BarberFlow Pro</span>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Sair</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ola, Cliente!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Bem-vindo a sua area</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-5">
                <Tabs
                  value={tabValue}
                  onValueChange={setTabValue}
                  tabs={[
                    {
                      value: 'upcoming',
                      label: 'Proximos',
                      content: (
                        <div className="space-y-3">
                          {mockAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30"><CalendarDays className="h-5 w-5 text-primary-600" /></div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{apt.service}</p>
                                  <p className="text-xs text-gray-500">{formatDate(apt.date)} as {formatTime(apt.date)} - {apt.barber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{formatCurrency(apt.value)}</p>
                                <Badge variant="primary" size="sm">Confirmado</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      value: 'history',
                      label: 'Historico',
                      content: (
                        <div className="space-y-3">
                          {mockHistory.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><Scissors className="h-5 w-5 text-gray-400" /></div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{apt.service}</p>
                                  <p className="text-xs text-gray-500">{formatDate(apt.date)} - {apt.barber}</p>
                                </div>
                              </div>
                              <Badge variant="success" size="sm">Finalizado</Badge>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Novo Agendamento</h3>
                {bookingStep === 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">Selecione o servico desejado</p>
                    {['Corte Degrade - R$ 45', 'Corte Social - R$ 40', 'Barba - R$ 25', 'Corte + Barba - R$ 65', 'Hidratacao - R$ 35'].map((svc) => (
                      <button key={svc} onClick={() => setBookingStep(1)} className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-sm text-gray-700 dark:text-gray-300 transition-colors">{svc}</button>
                    ))}
                  </div>
                )}
                {bookingStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">Selecione o barbeiro</p>
                    {['Carlos', 'Pedro', 'Joao'].map((name) => (
                      <button key={name} onClick={() => setBookingStep(2)} className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-sm text-gray-700 dark:text-gray-300 transition-colors">{name}</button>
                    ))}
                  </div>
                )}
                {bookingStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">Selecione o horario</p>
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                      <button key={time} onClick={() => { alert('Agendamento solicitado!'); setBookingStep(0); }} className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-sm text-gray-700 dark:text-gray-300 transition-colors">{time}</button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Meus Dados</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" /> Carlos Silva
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" /> carlos@email.com
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" /> (11) 99999-9999
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
