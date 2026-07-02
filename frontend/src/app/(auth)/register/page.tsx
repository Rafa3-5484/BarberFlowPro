'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, User, Phone, Scissors } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Preencha todos os campos obrigatorios');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas nao conferem');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const api = (await import('@/lib/api')).default;
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center px-6 lg:px-16 bg-white dark:bg-gray-900"
      >
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BarberFlow</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Crie sua conta</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Criar Conta</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Preencha os dados para se cadastrar</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Input label="Nome" placeholder="Seu nome completo" value={form.name} onChange={(e) => updateField('name', e.target.value)} icon={<User className="h-4 w-4" />} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Input label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} icon={<Mail className="h-4 w-4" />} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Input label="Telefone" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} icon={<Phone className="h-4 w-4" />} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Input label="Senha" type={showPassword ? 'text' : 'password'} placeholder="Minimo 6 caracteres" value={form.password} onChange={(e) => updateField('password', e.target.value)} icon={<Lock className="h-4 w-4" />} rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              } />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Input label="Confirmar Senha" type={showPassword ? 'text' : 'password'} placeholder="Repita a senha" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} icon={<Lock className="h-4 w-4" />} />
            </motion.div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</motion.p>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <Button type="submit" loading={loading} className="w-full" size="lg">Criar Conta</Button>
            </motion.div>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Ja tem uma conta?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">Faca login</Link>
          </motion.p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center mb-6">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Scissors className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 font-display">Junte-se ao BarberFlow Pro</h2>
          <p className="text-xl text-white/80 max-w-md mx-auto">Modernize sua barbearia com agendamento online, controle financeiro e muito mais</p>
        </div>
      </motion.div>
    </div>
  );
}
