'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../_components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import { Spinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatTime, getStatusColor, getStatusLabel, getDayName } from '@/lib/utils';
import api from '@/lib/api';
import { Appointment } from '@/types';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Clock,
  User, Scissors, X, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const navigate = (dir: number) => {
    const newDate = new Date(currentDate);
    if (view === 'day') newDate.setDate(newDate.getDate() + dir);
    else if (view === 'week') newDate.setDate(newDate.getDate() + dir * 7);
    else newDate.setMonth(newDate.getMonth() + dir);
    setCurrentDate(newDate);
  };

  const dateTitle = currentDate.toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', ...(view === 'day' ? { day: 'numeric', weekday: 'long' } : {}),
  });

  const todayStr = currentDate.toISOString().split('T')[0];
  const dayApts = appointments.filter((a) => a.date.startsWith(todayStr));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  const getWeekApts = (date: Date) => {
    const ds = date.toISOString().split('T')[0];
    return appointments.filter((a) => a.date.startsWith(ds));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const getMonthApts = (day: number) => {
    const ds = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((a) => a.date.startsWith(ds));
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: status as any } : a));
      toast.success('Status atualizado!');
      setShowModal(false);
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{dateTitle}</p>
          </div>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Novo Agendamento</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => { setView(v); setCurrentDate(new Date()); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Hoje</button>
            <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </motion.div>

        {view === 'day' && (
          <div className="space-y-2">
            {HOURS.map((hour) => {
              const timeStr = `${String(hour).padStart(2, '0')}:00`;
              const hourApts = dayApts.filter((a) => new Date(a.date).getHours() === hour);
              return (
                <div key={hour} className="flex gap-3">
                  <div className="w-16 text-right pt-2 text-xs text-gray-400 font-medium">{timeStr}</div>
                  <div className="flex-1 min-h-[60px] rounded-lg border border-gray-100 dark:border-gray-800 p-1">
                    {hourApts.map((apt) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => { setSelectedApt(apt); setShowModal(true); }}
                        className={`p-2 mb-1 rounded-lg cursor-pointer text-white text-xs ${apt.status === 'CONFIRMED' ? 'bg-blue-500' : apt.status === 'IN_PROGRESS' ? 'bg-yellow-500' : apt.status === 'COMPLETED' ? 'bg-green-500' : apt.status === 'CANCELLED' ? 'bg-red-400' : 'bg-gray-400'}`}
                      >
                        <p className="font-medium">{formatTime(apt.date)} - {apt.client.name}</p>
                        <p className="opacity-90">{apt.service.name} - {apt.employee.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date) => {
              const apts = getWeekApts(date);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={date.toISOString()} className={`rounded-lg border ${isToday ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className={`text-center p-2 border-b border-gray-100 dark:border-gray-700 ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                    <p className="text-xs text-gray-500">{getDayName(date.getDay()).slice(0, 3)}</p>
                    <p className={`text-lg font-bold ${isToday ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>{date.getDate()}</p>
                  </div>
                  <div className="p-1 space-y-1 min-h-[120px]">
                    {apts.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => { setSelectedApt(apt); setShowModal(true); }}
                        className={`p-1.5 rounded text-xs cursor-pointer text-white ${apt.status === 'CONFIRMED' ? 'bg-blue-500' : apt.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-400'}`}
                      >
                        <p className="font-medium truncate">{formatTime(apt.date)}</p>
                        <p className="truncate">{apt.client.name}</p>
                      </div>
                    ))}
                    {apts.length > 3 && <p className="text-xs text-gray-400 text-center">+{apts.length - 3} mais</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'month' && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-px">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                ))}
                {(() => { const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentDate); const days = []; for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />); for (let d = 1; d <= daysInMonth; d++) { const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(); const apts = getMonthApts(d); days.push(<div key={d} className={`min-h-[80px] p-1 rounded-lg border ${isToday ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}><p className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>{d}</p>{apts.slice(0, 2).map((a) => <div key={a.id} className={`text-xs p-0.5 rounded mb-0.5 text-white truncate ${a.status === 'CONFIRMED' ? 'bg-blue-500' : a.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-400'}`}>{a.client.name}</div>)}{apts.length > 2 && <p className="text-xs text-gray-400">+{apts.length - 2}</p>}</div>); } return days; })()}
              </div>
            </CardContent>
          </Card>
        )}

        {view === 'day' && dayApts.length === 0 && (
          <EmptyState icon={<CalendarDays className="h-16 w-16" />} title="Nenhum agendamento para hoje" description="Clique em Novo Agendamento para criar" action={{ label: 'Novo Agendamento', onClick: () => setShowCreate(true) }} />
        )}
      </div>

      <Modal open={showModal} onOpenChange={setShowModal} title="Detalhes do Agendamento" size="lg">
        {selectedApt && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selectedApt.client.name} size="lg" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApt.client.name}</h3>
                <Badge variant={selectedApt.status === 'CONFIRMED' ? 'primary' : selectedApt.status === 'COMPLETED' ? 'success' : selectedApt.status === 'CANCELLED' ? 'danger' : 'warning'}>{getStatusLabel(selectedApt.status)}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Data</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedApt.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Horario</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatTime(selectedApt.date)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 flex items-center gap-1"><Scissors className="h-3 w-3" /> Servico</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedApt.service.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 flex items-center gap-1"><User className="h-3 w-3" /> Barbeiro</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedApt.employee.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Valor</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(selectedApt.totalValue)}</p>
              </div>
            </div>
            {selectedApt.notes && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 mb-1">Observacoes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedApt.notes}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedApt.status === 'CONFIRMED' && (
                <>
                  <Button size="sm" variant="success" onClick={() => updateStatus(selectedApt.id, 'IN_PROGRESS')}>Iniciar Atendimento</Button>
                  <Button size="sm" variant="danger" onClick={() => updateStatus(selectedApt.id, 'CANCELLED')}>Cancelar</Button>
                </>
              )}
              {selectedApt.status === 'IN_PROGRESS' && (
                <Button size="sm" variant="success" onClick={() => updateStatus(selectedApt.id, 'COMPLETED')}>Finalizar Atendimento</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowModal(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onOpenChange={setShowCreate} title="Novo Agendamento" description="Preencha os dados do agendamento">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Formulario de agendamento sera implementado com a integracao do backend</p>
        <div className="flex justify-end"><Button variant="outline" onClick={() => setShowCreate(false)}>Fechar</Button></div>
      </Modal>
    </DashboardLayout>
  );
}
