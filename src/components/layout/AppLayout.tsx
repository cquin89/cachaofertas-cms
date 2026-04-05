import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette, useCommandPalette } from '@/components/shared/CommandPalette';

export function AppLayout() {
  const { open, setOpen } = useCommandPalette();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-background">
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenCommandPalette={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}
