import { Dialer } from '@/components/softphone/Dialer';
import { RecentCalls } from '@/components/dashboard/RecentCalls';

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Dialer />
        </div>
        <div className="lg:col-span-2">
          <RecentCalls />
        </div>
      </div>
    </div>
  );
}
