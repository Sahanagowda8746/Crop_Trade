'use client';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { DollarSign, List, Calendar, Bell } from 'lucide-react';
import MonthlyHarvestChart from '@/components/charts/monthly-harvest-chart';
import RevenueOverviewChart from '@/components/charts/revenue-overview-chart';

export default function DashboardPage() {
  const { setPageTitle } = useAppContext();
  
  useEffect(() => {
    setPageTitle('Dashboard');
  }, [setPageTitle]);


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹50,000</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3</div>
            <p className="text-xs text-muted-foreground">
              Awaiting buyer interest
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Harvests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Corn and Tomatoes in July
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pest Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">1 New</div>
            <p className="text-xs text-muted-foreground">
              Medium risk for aphids
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Monthly Harvest</CardTitle>
                <CardDescription>Total crop yield in tons for the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <MonthlyHarvestChart />
            </CardContent>
        </Card>
         <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Your total revenue over the past 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <RevenueOverviewChart />
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
