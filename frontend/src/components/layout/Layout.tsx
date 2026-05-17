import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-lg">
        <div className="max-w-container-max mx-auto space-y-lg">
          {children}
        </div>
      </main>
    </div>
  );
}
