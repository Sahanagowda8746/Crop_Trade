'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AIAssistantWidget from '@/components/AIAssistantWidget';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex flex-col h-screen">
            <header className="flex h-16 items-center gap-4 border-b bg-background/95 px-6">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-32" />
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <div className="flex flex-1">
                <aside className="hidden md:block w-[16rem] border-r p-3">
                     <div className="flex flex-col gap-2 p-3">
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                             <Skeleton key={i} className="h-9 w-full" />
                        ))}
                    </div>
                </aside>
                <main className="flex-1 p-8">
                     <Skeleton className="h-40 w-full" />
                     <div className="grid grid-cols-2 gap-6 mt-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                     </div>
                </main>
            </div>
        </div>
    )
  }

  return <>{children}</>;
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
        <AuthGuard>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
                <AIAssistantWidget />
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    </FirebaseClientProvider>
  );
}
