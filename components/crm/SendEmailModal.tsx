'use client';
import { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ContactRecord } from '@/types';

interface SendEmailModalProps {
  contact: ContactRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export function SendEmailModal({
  contact,
  isOpen,
  onClose,
  onSent,
}: SendEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || !contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Asunto y mensaje son requeridos');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/marketing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact._id,
          to: contact.email,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar');
      }

      toast.success('Email enviado con éxito');
      setSubject('');
      setMessage('');
      onSent();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar correo';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                Redactar Email a {contact.name}
              </h3>
              <p className="text-xs text-zinc-500">{contact.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Asunto
            </label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej. Propuesta comercial / Seguimiento"
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Mensaje
            </label>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send size={15} />
              {sending ? 'Enviando...' : 'Enviar Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
