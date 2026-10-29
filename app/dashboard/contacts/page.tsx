import { ContactsTable } from '@/components/dashboard/ContactsTable';

export default function ContactsPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Contactos / Leads</h1>
      <ContactsTable />
    </div>
  );
}
