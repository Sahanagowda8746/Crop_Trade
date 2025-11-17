'use client';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Droplet, Thermometer, Wind, Wifi, CircleDot, Zap, BarChart, Rss, AlertCircle } from 'lucide-react';
import WaterUsageChart from '@/components/charts/water-usage-chart';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const devices = [
    { id: 'sensor-001', type: 'Soil Moisture Sensor', location: 'Field A, Sector 2', status: 'online', reading: '45%' },
    { id: 'valve-003', type: 'Irrigation Valve', location: 'Field A, Sector 2', status: 'online', reading: 'Closed' },
    { id: 'sensor-002', type: 'Soil Moisture Sensor', location: 'Field C, Sector 1', status: 'online', reading: '52%' },
    { id: 'valve-005', type: 'Irrigation Valve', location: 'Field C, Sector 1', status: 'offline', reading: 'Unknown' },
    { id: 'weather-station-01', type: 'Weather Station', location: 'Central Hub', status: 'online', reading: '28°C' },
];

export default function SmartDashboardPage() {
  const { setPageTitle } = useAppContext();

  useEffect(() => {
    setPageTitle('Smart Farming Dashboard');
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Smart Dashboard</h1>
        <p className="text-muted-foreground">Monitor and control your farm's IoT devices in real-time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Water Usage (Today)</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250 L</div>
            <p className="text-xs text-muted-foreground">-5% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Soil Moisture</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48%</div>
            <p className="text-xs text-muted-foreground">Optimal range: 40-60%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 / 5</div>
            <p className="text-xs text-muted-foreground">1 device currently offline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
            <p className="text-xs text-muted-foreground">Valve `valve-005` is offline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Water Usage</CardTitle>
                    <CardDescription>Water consumption (in Liters) over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <WaterUsageChart />
                </CardContent>
            </Card>
        </div>
         <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Device Status</CardTitle>
                    <CardDescription>Overview of all connected IoT devices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Reading</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.map(device => (
                                <TableRow key={device.id}>
                                    <TableCell>
                                        <p className="font-medium">{device.type}</p>
                                        <p className="text-xs text-muted-foreground">{device.location}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'} className="capitalize">
                                            {device.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{device.reading}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
