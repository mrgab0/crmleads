'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Phone,
  MessageCircle,
  Mail,
  UserPlus,
  Eye,
  Tag,
  Filter,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ContactRecord, PipelineStage } from '@/types';
import { NewContactModal } from '@/components/crm/NewContactModal';
import { ContactDetailModal } from '@/components/crm/ContactDetailModal';
import { SendEmailModal } from '@/components/crm/SendEmailModal';

const STAGE_LABELS: Record<PipelineStage, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  calificado: 'Calificado',
  propuesta: 'Propuesta',
  negociacion: 'Negociación',
  ganado: 'Ganado',
  perdido: 'Perdido',
};

const STAGE_COLORS: Record<PipelineStage, string> = {
  nuevo: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  contactado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  calificado: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  propuesta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  negociacion: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  ganado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  perdido: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function formatRelativeTime(date?: string): string {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export function ContactsTable() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [detailContact, setDetailContact] = useState<ContactRecord | null>(null);
  const [emailContact, setEmailContact] = useState<ContactRecord | null>(null);

  const loadContacts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedStage) params.set('stage', selectedStage);
    params.set('page', page.toString());
    params.set('limit', '25');

    fetch(`/api/contacts?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setContacts(d.contacts || []);
        setTotal(d.total || 0);
        if (d.availableTags) setAvailableTags(d.availableTags);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, selectedTag, selectedStage, page]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadContacts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTag('');
    setSelectedStage('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / 25) || 1;

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Barra Superior con Filtros y Botón de Nuevo Contacto */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono, email o empresa..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-zinc-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-800 dark:bg-zinc-700 text-white rounded-xl text-sm font-medium hover:bg-zinc-900 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Filtros de Segmentación (Tags y Pipeline) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Etapa */}
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todas las etapas</option>
              {Object.entries(STAGE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>

            {/* Filtro por Tag */}
            {availableTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Todas las etiquetas</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    🏷️ {tag}
                  </option>
                ))}
              </select>
            )}

            {(selectedTag || selectedStage || search) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline px-1"
              >
                Limpiar
              </button>
            )}

            {/* Botón Crear Contacto */}
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 ml-auto"
            >
              <UserPlus size={16} />
              Nuevo Lead
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  Lead / Empresa
                </th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  Contacto Directo
                </th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  Etapa Pipeline
                </th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  Tags de Marketing
                </th>
                <th className="text-left px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  Último Contacto
                </th>
                <th className="text-center px-4 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  Acciones 1-Clic
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800/50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-400">
                    <p className="font-medium text-sm">No se encontraron contactos</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Crea un nuevo lead o ajusta los filtros de búsqueda y tags.
                    </p>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {/* Lead y Empresa */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-white">
                        {contact.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {contact.position ? `${contact.position} • ` : ''}
                        {contact.company || 'Sin empresa'}
                      </div>
                    </td>

                    {/* Teléfono y Email */}
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      <div>{contact.phone}</div>
                      {contact.email && (
                        <div className="text-[11px] text-zinc-400 font-sans truncate max-w-[180px]">
                          {contact.email}
                        </div>
                      )}
                    </td>

                    {/* Etapa Pipeline */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          STAGE_COLORS[contact.pipelineStage || 'nuevo']
                        }`}
                      >
                        {STAGE_LABELS[contact.pipelineStage || 'nuevo']}
                      </span>
                      {Boolean(contact.dealValue) && (
                        <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-0.5">
                          <DollarSign size={10} />
                          {contact.dealValue?.toLocaleString()} USD
                        </div>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-medium"
                            >
                              <Tag size={10} />
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400 italic">—</span>
                        )}
                      </div>
                    </td>

                    {/* Último Contacto */}
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {formatRelativeTime(contact.lastContact)}
                    </td>

                    {/* Acciones 1-Clic */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {/* 📞 Llamar */}
                        <a
                          href={`/dashboard?call=${encodeURIComponent(contact.phone)}`}
                          className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                          title="Llamar con Softphone"
                        >
                          <Phone size={15} />
                        </a>

                        {/* 💬 WhatsApp */}
                        <a
                          href={`/dashboard/whatsapp?phone=${encodeURIComponent(contact.phone)}`}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>

                        {/* ✉️ Email */}
                        {contact.email ? (
                          <button
                            onClick={() => setEmailContact(contact)}
                            className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                            title="Enviar Email"
                          >
                            <Mail size={15} />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                            title="Sin email registrado"
                          >
                            <Mail size={15} />
                          </button>
                        )}

                        {/* 👤 Ver Ficha / Editar */}
                        <button
                          onClick={() => setDetailContact(contact)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          title="Ver Ficha y Notas"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-xs text-zinc-500">
              Mostrando {contacts.length} de {total} contactos
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-zinc-600 font-medium">
                {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <NewContactModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={loadContacts}
      />

      <ContactDetailModal
        contact={detailContact}
        isOpen={Boolean(detailContact)}
        onClose={() => setDetailContact(null)}
        onUpdate={() => {
          loadContacts();
          if (detailContact) {
            // Refrescar el contacto detallado
            fetch(`/api/contacts/${detailContact._id}`)
              .then((r) => r.json())
              .then((d) => setDetailContact(d.contact || null));
          }
        }}
        onOpenEmail={(c) => {
          setDetailContact(null);
          setEmailContact(c);
        }}
      />

      <SendEmailModal
        contact={emailContact}
        isOpen={Boolean(emailContact)}
        onClose={() => setEmailContact(null)}
        onSent={loadContacts}
      />
    </>
  );
}
