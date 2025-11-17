'use client';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { DollarSign, List, Calendar, Bell, LineChart, Thermometer, Wind, Droplet, Clock, PackageCheck, Tractor, CheckCircle, Wheat } from 'lucide-react';
import MonthlyHarvestChart from '@/components/charts/monthly-harvest-chart';
import RevenueOverviewChart from '@/components/charts/revenue-overview-chart';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const marketRates = [
  { crop: 'Wheat', price: '₹2,350', change: '+1.2%' },
  { crop: 'Corn', price: '₹2,100', change: '-0.5%' },
  { crop: 'Tomatoes', price: '₹3,200', change: '+3.4%' },
  { crop: 'Potatoes', price: '₹1,800', change: '+0.8%' },
];

export default function DashboardPage() {
  const { setPageTitle } = useAppContext();
  
  useEffect(() => {
    setPageTitle('Dashboard');
  }, [setPageTitle]);


  return (
    <div className="space-y-6">
       <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back, Farmer John!</h1>
        <p className="text-muted-foreground">Here's your farm's complete operational overview.</p>
      </div>
      
      {/* KPI & Business Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Farm Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,25,800</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">
              3 new listings this week
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Harvests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Corn, Tomatoes, and Carrots
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High-Risk Pest Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-destructive">2</div>
            <p className="text-xs text-muted-foreground">
              Aphids on Field B, Blight on Field C
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            {/* AI Crop Cycle Planner */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">AI Crop Cycle Planner: Winter Wheat (Field A)</CardTitle>
                    <CardDescription>AI-driven timeline for your current crop cycle.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 ring-4 ring-green-200">
                                <CheckCircle className="h-6 w-6"/>
                            </div>
                            <p className="mt-2 font-semibold">Sown</p>
                            <p className="text-xs">Oct 15</p>
                        </div>
                        <Progress value={25} className="w-full h-2 flex-1" />
                         <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground ring-4 ring-green-200">
                                <Wheat className="h-6 w-6"/>
                            </div>
                            <p className="mt-2 font-bold text-primary">Growth</p>
                             <p className="text-xs">(Current)</p>
                        </div>
                         <Progress value={0} className="w-full h-2 flex-1" />
                         <div className="flex flex-col items-center opacity-50">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500">
                                <PackageCheck className="h-6 w-6"/>
                            </div>
                            <p className="mt-2 font-semibold">Harvest</p>
                            <p className="text-xs">Feb 20</p>
                        </div>
                         <Progress value={0} className="w-full h-2 flex-1" />
                        <div className="flex flex-col items-center opacity-50">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500">
                                <Tractor className="h-6 w-6"/>
                            </div>
                            <p className="mt-2 font-semibold">Fallow</p>
                            <p className="text-xs">Mar 1</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <div className="grid gap-6 md:grid-cols-2">
                 {/* Charts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Harvest</CardTitle>
                        <CardDescription>Yield in tons for the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <MonthlyHarvestChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Total revenue (₹) for the past 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueOverviewChart />
                    </CardContent>
                </Card>
             </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
            {/* Weather & Forecast */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Weather & Forecast</CardTitle>
                    <CardDescription>Pune, Maharashtra</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                            <p className="text-4xl font-bold">28°C</p>
                            <p className="text-muted-foreground">Partly Cloudy</p>
                        </div>
                        <div className="text-right text-sm">
                            <div className="flex items-center gap-2"><Droplet className="w-4 h-4 text-muted-foreground"/>Humidity: 65%</div>
                            <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-muted-foreground"/>Wind: 12 km/h</div>
                        </div>
                     </div>
                     <div className="flex justify-between text-center text-sm">
                        <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold">Mon</p>
                            <Cloudy className="w-6 h-6 text-primary"/>
                            <p>29°</p>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold">Tue</p>
                            <Cloudy className="w-6 h-6 text-primary"/>
                            <p>30°</p>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold">Wed</p>
                            <Thermometer className="w-6 h-6 text-destructive"/>
                            <p>32°</p>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold">Thu</p>
                            <Cloudy className="w-6 h-6 text-primary"/>
                            <p>31°</p>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <p className="font-semibold">Fri</p>
                            <Droplet className="w-6 h-6 text-blue-500"/>
                            <p>27°</p>
                        </div>
                     </div>
                </CardContent>
            </Card>

            {/* Live Market Rates */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Live Market Rates</CardTitle>
                    <CardDescription>Real-time commodity prices per quintal.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Crop</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Change</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {marketRates.map(rate => (
                                <TableRow key={rate.crop}>
                                    <TableCell className="font-medium">{rate.crop}</TableCell>
                                    <TableCell className="text-right font-semibold">{rate.price}</TableCell>
                                    <TableCell className={`text-right font-medium ${rate.change.startsWith('+') ? 'text-green-600' : 'text-destructive'}`}>
                                        {rate.change}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* IoT Devices Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Active Devices</CardTitle>
                    <CardDescription>Status of your IoT hardware.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between text-sm">
                        <p className="font-medium">Soil Sensor (Field A)</p>
                        <div className="flex items-center gap-2">
                             <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-muted-foreground">Online</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
