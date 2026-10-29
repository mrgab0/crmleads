'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error('Credenciales incorrectas');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-500 p-3 rounded-full mb-3">
            <Phone size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Lead Softphone</h1>
          <p className="text-zinc-500 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-zinc-900 dark:text-white"
              placeholder="admin@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-zinc-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
