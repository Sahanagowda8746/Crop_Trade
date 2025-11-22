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
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/context/app-context';
import {
  LayoutDashboard,
  Store,
  Gavel,
  Truck,
  FileCheck2,
  Sprout,
  Package,
  Wrench,
  TestTube,
  LineChart,
  BrainCircuit,
  Calculator,
  Calendar,
  AreaChart,
  ShieldCheck,
  CircleDollarSign,
  Users,
  Video,
  Bot,
  Radar,
  Cloudy,
  Waypoints,
  LifeBuoy
} from 'lucide-react';

const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Farmer', 'Admin'] },
    { href: '/market', label: 'Marketplace', icon: Store, roles: ['Farmer', 'Buyer', 'Admin'] },
    { href: '/auctions', label: 'Auctions', icon: Gavel, roles: ['Farmer', 'Buyer', 'Admin'] },
    { href: '/orders', label: 'My Orders', icon: Package, roles: ['Buyer'] },
    { href: '/transport', label: 'Transport Jobs', icon: Truck, roles: ['Transporter'] },
    { href: '/my-soil-tests', label: 'My Tests', icon: TestTube, roles: ['Farmer', 'Admin'] },
    { href: '/traceability', label: 'Traceability', icon: FileCheck2, roles: ['Farmer', 'Buyer', 'Admin'] },
]

const aiAdvisoryItems = [
    { href: '/pest-detection', label: 'Disease Detection', icon: Radar, roles: ['Farmer', 'Admin'] },
    { href: '/fertilizer-calculator', label: 'Fertilizer Calculator', icon: Calculator, roles: ['Farmer', 'Admin'] },
    { href: '/yield-prediction', label: 'Yield Prediction', icon: AreaChart, roles: ['Farmer', 'Admin'] },
    { href: '/demand-forecast', label: 'Demand Forecast', icon: LineChart, roles: ['Farmer', 'Admin'] },
    { href: '/credit-score', label: 'Credit Score', icon: CircleDollarSign, roles: ['Farmer', 'Admin'] },
    { href: '/crop-simulator', label: 'Crop Simulator', icon: Bot, roles: ['Farmer', 'Admin'] },
    
    
];

const smartFarmingItems = [
    { href: '/smart-dashboard', label: 'IoT Dashboard', icon: LayoutDashboard, roles: ['Farmer'] },
    { href: '/smart-irrigation', label: 'Smart Irrigation', icon: Cloudy, roles: ['Farmer'] },
    { href: '/drone-mapping', label: 'Drone Mapping', icon: Waypoints, roles: ['Farmer'] },
];

export default function AppSidebar() {
  const { role } = useAppContext();
  const pathname = usePathname();

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
            {mainNavItems.map(item => (
                item.roles.includes(role) && (
                    <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                            <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                            <item.icon />
                            <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                )
            ))}
            
            <SidebarMenuItem>
              <Link href="/ai-tools">
                <SidebarMenuButton isActive={pathname === '/ai-tools'} tooltip="AI & Lab Tools">
                  <BrainCircuit />
                  <span>AI & Lab Tools</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarGroup>
                <SidebarGroupLabel>AI Advisory</SidebarGroupLabel>
                {aiAdvisoryItems.map(item => (
                    item.roles.includes(role) && (
                        <SidebarMenuItem key={item.href + item.label}>
                            <Link href={item.href}>
                                <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                                <item.icon />
                                <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )
                ))}
            </SidebarGroup>
            
            <SidebarGroup>
                <SidebarGroupLabel>Smart Farming</SidebarGroupLabel>
                 {smartFarmingItems.map(item => (
                    item.roles.includes(role) && (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                                <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                                <item.icon />
                                <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )
                ))}
            </SidebarGroup>
            
            <SidebarGroup>
                <SidebarGroupLabel>Support</SidebarGroupLabel>
                 <SidebarMenuItem>
                    <Link href="/support">
                        <SidebarMenuButton isActive={pathname.startsWith('/support')} tooltip="Help & Support">
                        <LifeBuoy />
                        <span>Help & Support</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarGroup>

        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
