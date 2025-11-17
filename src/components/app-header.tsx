'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { useAppContext } from '@/context/app-context';

export default function AppHeader() {
  const { pageTitle } = useAppContext();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="font-headline text-xl md:text-2xl font-semibold">
        {pageTitle}
      </h1>
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
