'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Phone, MessageCircle, Users, LayoutDashboard, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { href: '/dashboard/calls', icon: Phone, label: 'Llamadas' },
  { href: '/dashboard/contacts', icon: Users, label: 'Contactos' },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-16 lg:w-56 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 h-screen shrink-0">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="bg-brand-500 p-2 rounded-lg shrink-0">
            <Phone size={18} className="text-white" />
          </div>
          <span className="hidden lg:block font-bold text-zinc-900 dark:text-white text-sm">
            Lead Softphone
          </span>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                  active
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                )}
              >
                <Icon size={20} className="shrink-0" />
                <span className="hidden lg:block text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="hidden lg:block text-sm font-medium">Salir</span>
          </button>
        </div>
      </aside>

      {/* Bottom nav móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex z-50">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors',
                active ? 'text-brand-500' : 'text-zinc-400'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
