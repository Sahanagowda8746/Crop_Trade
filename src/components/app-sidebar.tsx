'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/context/app-context';
import {
  LayoutDashboard,
  Store,
  Gavel,
  Leaf,
  ScanSearch,
  Truck,
  FileCheck2,
  Sprout,
  Bot,
  GalleryHorizontal,
  Package,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Farmer', 'Buyer', 'Transporter', 'Admin'] },
  { href: '/market', label: 'Marketplace', icon: Store, roles: ['Farmer', 'Buyer', 'Transporter', 'Admin'] },
  { href: '/auctions', label: 'Auctions', icon: Gavel, roles: ['Farmer', 'Buyer', 'Transporter', 'Admin'] },
  { href: '/orders', label: 'My Orders', icon: Package, roles: ['Buyer'] },
  { href: '/soil-analysis', label: 'Soil Analysis', icon: Leaf, roles: ['Farmer'] },
  { href: '/pest-detection', label: 'Pest Detection', icon: ScanSearch, roles: ['Farmer'] },
  { href: '/marketing-suite', label: 'Marketing Suite', icon: GalleryHorizontal, roles: ['Farmer'] },
  { href: '/transport', label: 'Transport', icon: Truck, roles: ['Transporter'] },
  { href: '/traceability', label: 'Traceability', icon: FileCheck2, roles: ['Buyer'] },
];

export default function AppSidebar() {
  const { role } = useAppContext();
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Sprout className="w-8 h-8 text-primary" />
            <span className="font-headline text-2xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
                CropTrade
            </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
