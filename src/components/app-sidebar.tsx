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
  Waypoints
} from 'lucide-react';

const aiAdvisoryItems = [
    { href: '/soil-analysis', label: 'Soil Analysis', icon: TestTube, roles: ['Farmer', 'Admin'] },
    { href: '/demand-forecast', label: 'Demand Forecast', icon: LineChart, roles: ['Farmer', 'Admin'] },
    { href: '/pest-detection', label: 'Disease Detection', icon: Radar, roles: ['Farmer', 'Admin'] },
    { href: '/fertilizer-calculator', label: 'Fertilizer Calculator', icon: Calculator, roles: ['Farmer', 'Admin'] },
    { href: '/crop-calendar', label: 'Crop Calendar', icon: Calendar, roles: ['Farmer', 'Admin'] },
    { href: '/yield-prediction', label: 'Yield Prediction', icon: AreaChart, roles: ['Farmer', 'Admin'] },
    { href: '/credit-score', label: 'Credit Score', icon: CircleDollarSign, roles: ['Farmer', 'Admin'] },
    { href: '/insurance-risk', label: 'Insurance Risk', icon: ShieldCheck, roles: ['Farmer', 'Admin'] },
    { href: '/profit-calculator', label: 'Profit Calculator', icon: CircleDollarSign, roles: ['Farmer', 'Admin'] },
    { href: '/expert-matchmaking', label: 'Expert Matchmaking', icon: Users, roles: ['Farmer'] },
    { href: '/video-tutorials', label: 'Video Tutorials', icon: Video, roles: ['Farmer', 'Buyer', 'Transporter', 'Admin'] },
];

const smartFarmingItems = [
    { href: '/smart-dashboard', label: 'Smart Dashboard', icon: LayoutDashboard, roles: ['Farmer'] },
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
            <span className="font-headline text-2xl font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
                CropTrade
            </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton isActive={pathname === '/dashboard'} tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarGroup>
                <SidebarGroupLabel>AI Advisory</SidebarGroupLabel>
                {aiAdvisoryItems.map(item => (
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

        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
