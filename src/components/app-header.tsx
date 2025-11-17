'use client';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { useAppContext } from '@/context/app-context';
import { Button } from './ui/button';
import { useUser } from '@/firebase';

export default function AppHeader() {
  const { pageTitle } = useAppContext();
  const { user, isUserLoading } = useUser();

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
        {!isUserLoading && !user && (
            <>
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </>
        )}
        {!isUserLoading && user && <UserNav />}
      </div>
    </header>
  );
}
