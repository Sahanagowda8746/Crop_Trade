'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { useAppContext } from '@/context/app-context';
import { Button } from './ui/button';

export default function AppHeader() {
  const { pageTitle } = useAppContext();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
       <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className='hidden md:block'>
        <h1 className="font-semibold text-2xl">
          Welcome Back, Farmer John!
        </h1>
        <p className="text-sm text-muted-foreground">Here's what's happening on your farm today.</p>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline">Login</Button>
        <Button>Sign Up</Button>
        <UserNav />
      </div>
    </header>
  );
}
