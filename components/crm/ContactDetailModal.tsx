'use client';
import { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  Building,
  Briefcase,
  DollarSign,
  Tag,
  Plus,
  Send,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { ContactRecord, PipelineStage } from '@/types';

interface ContactDetailModalProps {
  contact: ContactRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onOpenEmail: (contact: ContactRecord) => void;
}

const PIPELINE_STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'propuesta', label: 'Propuesta' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
];

export function ContactDetailModal({
  contact,
  isOpen,
  onClose,
  onUpdate,
  onOpenEmail,
}: ContactDetailModalProps) {
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !contact) return null;

  const handleStageChange = async (newStage: PipelineStage) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/contacts/${contact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStage: newStage }),
      });
      if (!res.ok) throw new Error('Error al actualizar etapa');
      toast.success(`Etapa cambiada a: ${newStage}`);
      onUpdate();
    } catch {
      toast.error('Error al actualizar etapa');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/contacts/${contact._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      if (!res.ok) throw new Error('Error al guardar nota');
      toast.success('Nota agregada');
      setNewNote('');
      onUpdate();
    } catch {
      toast.error('Error al agregar nota');
    } finally {
      setAddingNote(false);
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim();
      const currentTags = contact.tags || [];
      if (!currentTags.includes(clean)) {
        const nextTags = [...currentTags, clean];
        await updateTags(nextTags);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = async (tToRemove: string) => {
    const nextTags = (contact.tags || []).filter((t) => t !== tToRemove);
    await updateTags(nextTags);
  };

  const updateTags = async (tags: string[]) => {
    try {
      const res = await fetch(`/api/contacts/${contact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });
      if (!res.ok) throw new Error();
      onUpdate();
    } catch {
      toast.error('Error al actualizar tags');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              {contact.name}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {contact.position ? `${contact.position} en ` : ''}
              {contact.company || 'Sin empresa'} • ID: {contact._id.slice(-6)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Acciones 1-Clic Bar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <a
            href={`/dashboard?call=${contact.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Llamar con Softphone"
          >
            <Phone size={14} />
            Llamar
          </a>
          <a
            href={`/dashboard/whatsapp?phone=${contact.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Enviar WhatsApp"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
          {contact.email ? (
            <button
              onClick={() => onOpenEmail(contact)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Redactar Email"
            >
              <Mail size={14} />
              Enviar Email
            </button>
          ) : (
            <span className="text-xs text-zinc-400 italic">Sin email registrado</span>
          )}
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selector de Etapa del Pipeline */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Etapa del Pipeline
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((s) => {
                const isCurrent = contact.pipelineStage === s.value;
                return (
                  <button
                    key={s.value}
                    disabled={updating}
                    onClick={() => handleStageChange(s.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-brand-500 text-white shadow'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Información General */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-sm">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Phone size={16} className="text-brand-500" />
              <span className="font-mono text-xs">{contact.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Mail size={16} className="text-brand-500" />
              <span className="text-xs truncate">{contact.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Building size={16} className="text-brand-500" />
              <span className="text-xs">{contact.company || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <DollarSign size={16} className="text-brand-500" />
              <span className="text-xs">
                {contact.dealValue ? `$${contact.dealValue.toLocaleString()} USD` : '$0 USD'}
              </span>
            </div>
          </div>

          {/* Tags de Marketing */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Etiquetas de Marketing
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 min-h-[42px] items-center">
              {(contact.tags || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium"
                >
                  <Tag size={12} />
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ Etiqueta y Enter..."
                className="flex-1 bg-transparent text-xs border-none outline-none text-zinc-900 dark:text-white min-w-[130px]"
              />
            </div>
          </div>

          {/* Timeline de Notas Comerciales */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Historial y Notas de Seguimiento
            </label>

            {/* Input nueva nota */}
            <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Añadir nota de llamada, reunión o interés..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 flex items-center gap-1"
              >
                <Plus size={16} />
                Nota
              </button>
            </form>

            {/* Lista de notas */}
            <div className="space-y-3">
              {(!contact.notes || contact.notes.length === 0) ? (
                <p className="text-xs text-zinc-400 italic py-2">
                  No hay notas registradas para este contacto.
                </p>
              ) : (
                [...contact.notes].reverse().map((note, idx) => (
                  <div
                    key={note._id || idx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {note.author}
                      </span>
                      <span>
                        {new Date(note.createdAt).toLocaleString('es', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
