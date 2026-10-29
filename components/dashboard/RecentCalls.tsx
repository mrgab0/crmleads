'use client';
import { useEffect, useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock } from 'lucide-react';
import type { CallRecord } from '@/types';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export function RecentCalls() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls?limit=10')
      .then((r) => r.json())
      .then((d) => setCalls(d.calls || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-100 dark:border-zinc-800 p-5">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Llamadas Recientes</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-100 dark:border-zinc-800 p-5">
      <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Llamadas Recientes</h2>
      {calls.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          <Phone size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay llamadas registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map((call) => (
            <div
              key={call._id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div
                className={`p-2 rounded-full shrink-0 ${
                  call.direction === 'inbound'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                }`}
              >
                {call.direction === 'inbound' ? (
                  <PhoneIncoming size={16} />
                ) : (
                  <PhoneOutgoing size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-800 dark:text-zinc-200 text-sm truncate">
                  {call.direction === 'inbound' ? call.from : call.to}
                </p>
                <p className="text-xs text-zinc-400">{formatRelativeTime(call.createdAt)}</p>
              </div>
              <div className="text-right shrink-0">
                {call.duration ? (
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock size={12} />
                    {formatDuration(call.duration)}
                  </div>
                ) : (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      call.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : call.status === 'no-answer'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {call.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
