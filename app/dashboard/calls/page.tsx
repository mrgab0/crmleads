import { CallHistoryTable } from '@/components/dashboard/CallHistoryTable';

export default function CallsPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Historial de Llamadas</h1>
      <CallHistoryTable />
    </div>
  );
}
