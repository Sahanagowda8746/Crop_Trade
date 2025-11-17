import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import { FirebaseClientProvider } from '@/firebase';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AIAssistantWidget from '@/components/AIAssistantWidget';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
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
    </FirebaseClientProvider>
  );
}
