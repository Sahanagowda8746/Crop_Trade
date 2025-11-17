'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { useAppContext } from '@/context/app-context';
import { Button } from './ui/button';

export default function AppHeader() {
  const { pageTitle } = useAppContext();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur-sm">
       <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className='hidden md:block'>
        <h1 className="font-semibold text-xl">
          {pageTitle}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost">Login</Button>
        <Button>Sign Up</Button>
        <UserNav />
      </div>
    </header>
  );
}
