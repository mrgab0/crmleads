'use client';
import { useState } from 'react';
import { X, UserPlus, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PIPELINE_STAGES = [
  { value: 'nuevo', label: 'Nuevo Lead' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'propuesta', label: 'Propuesta' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
];

export function NewContactModal({ isOpen, onClose, onSuccess }: NewContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [pipelineStage, setPipelineStage] = useState('nuevo');
  const [dealValue, setDealValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^,|,$/g, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Nombre y teléfono son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          company: company.trim() || undefined,
          position: position.trim() || undefined,
          pipelineStage,
          dealValue: dealValue ? Number(dealValue) : 0,
          tags,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      toast.success('Contacto guardado exitosamente');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600">
              <UserPlus size={20} />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Nuevo Contacto / Lead</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Nombre Completo *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Teléfono (E.164 o local) *
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Email (Marketing)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@empresa.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Empresa
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de la empresa"
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Cargo / Puesto
              </label>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Director Comercial, Gerente..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Etapa del Pipeline
              </label>
              <select
                value={pipelineStage}
                onChange={(e) => setPipelineStage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Valor Estimado del Trato ($ USD)
            </label>
            <input
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Tags de Marketing */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Etiquetas de Marketing (Presiona Enter para agregar)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 min-h-[42px] items-center">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium"
                >
                  <Tag size={12} />
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
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
                placeholder={tags.length === 0 ? 'Ej: VIP, Inbound, Webinar' : ''}
                className="flex-1 bg-transparent text-sm border-none outline-none text-zinc-900 dark:text-white min-w-[120px]"
              />
            </div>
          </div>

          {/* Nota inicial */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Nota Comercial Inicial
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detalles de interés del cliente, requerimientos o contexto..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
