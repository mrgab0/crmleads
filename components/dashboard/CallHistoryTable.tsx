'use client';
import { useEffect, useState } from 'react';
import { PhoneIncoming, PhoneOutgoing, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CallRecord } from '@/types';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function CallHistoryTable() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calls?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => { setCalls(d.calls || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Dirección</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Número</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Estado</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Duración</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : calls.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-zinc-400">
                  No hay llamadas registradas
                </td>
              </tr>
            ) : (
              calls.map((call) => (
                <tr
                  key={call._id}
                  className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        call.direction === 'inbound'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {call.direction === 'inbound' ? (
                        <PhoneIncoming size={12} />
                      ) : (
                        <PhoneOutgoing size={12} />
                      )}
                      {call.direction === 'inbound' ? 'Entrante' : 'Saliente'}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-300">
                    {call.direction === 'inbound' ? call.from : call.to}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        call.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : call.status === 'no-answer'
                          ? 'bg-yellow-100 text-yellow-700'
                          : call.status === 'initiated'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {call.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {call.duration ? (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuration(call.duration)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {formatDateTime(call.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-sm text-zinc-500">{total} llamadas totales</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-zinc-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
