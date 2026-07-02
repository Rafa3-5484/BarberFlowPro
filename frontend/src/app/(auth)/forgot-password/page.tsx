'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Mail, Scissors, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Informe seu email');
      return;
    }

    setLoading(true);
    try {
      const api = (await import('@/lib/api')).default;
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar email');
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Recuperar senha</p>
            </div>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Enviado!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Enviamos um link de recuperacao para <strong>{email}</strong>
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">Voltar para o Login</Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Esqueceu sua senha?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="h-4 w-4" />}
                  />
                </motion.div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</motion.p>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    Enviar Link
                  </Button>
                </motion.div>
              </form>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o Login
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center mb-6">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Scissors className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 font-display">Nao se preocupe</h2>
          <p className="text-xl text-white/80 max-w-md mx-auto">Vamos te ajudar a recuperar o acesso a sua conta rapidamente</p>
        </div>
      </motion.div>
    </div>
  );
}
