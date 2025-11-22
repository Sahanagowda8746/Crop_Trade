
'use client';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Droplets, RotateCw, Play, Square, Calendar, Dot, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


type ZoneStatus = 'watering' | 'idle' | 'scheduled' | 'error';

interface IrrigationZone {
  id: string;
  name: string;
  crop: string;
  status: ZoneStatus;
  soilMoisture: number; // percentage
  nextRun: string | null;
}

const initialZones: IrrigationZone[] = [
    { id: 'zone-a', name: 'Zone A - North Field', crop: 'Corn', status: 'idle', soilMoisture: 45, nextRun: 'Today at 4:00 PM' },
    { id: 'zone-b', name: 'Zone B - West Field', crop: 'Wheat', status: 'watering', soilMoisture: 55, nextRun: null },
    { id: 'zone-c', name: 'Zone C - Greenhouse', crop: 'Tomatoes', status: 'scheduled', soilMoisture: 62, nextRun: 'Tomorrow at 6:00 AM' },
    { id: 'zone-d', name: 'Zone D - South End', crop: 'Potatoes', status: 'idle', soilMoisture: 48, nextRun: null },
];

const statusConfig: { [key in ZoneStatus]: { label: string; color: string; icon: JSX.Element } } = {
    idle: { label: 'Idle', color: 'bg-gray-500', icon: <Dot/> },
    watering: { label: 'Watering', color: 'bg-blue-500 animate-pulse', icon: <Droplets className="h-4 w-4"/> },
    scheduled: { label: 'Scheduled', color: 'bg-amber-500', icon: <Calendar className="h-4 w-4"/> },
    error: { label: 'Error', color: 'bg-red-500', icon: <Power className="h-4 w-4"/> },
};


export default function SmartIrrigationPage() {
  const { setPageTitle } = useAppContext();
  const [zones, setZones] = useState<IrrigationZone[]>(initialZones);
  const [masterSystem, setMasterSystem] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(false);

  useEffect(() => {
    setPageTitle('Smart Irrigation');
  }, [setPageTitle]);

  const handleToggleZone = (id: string) => {
    setZones(zones.map(zone => {
      if (zone.id === id) {
        if (zone.status === 'watering') {
          return { ...zone, status: 'idle' };
        } else if (zone.status === 'idle') {
          return { ...zone, status: 'watering' };
        }
      }
      return zone;
    }));
  };
  
  const getMoistureColor = (moisture: number) => {
    if (moisture < 30) return 'bg-destructive';
    if (moisture < 50) return 'bg-yellow-500';
    return 'bg-primary';
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Irrigation Control Center</CardTitle>
          <CardDescription>Monitor and manage your farm's irrigation zones in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
                 <div className="flex items-center space-x-2">
                    <Switch id="master-system" checked={masterSystem} onCheckedChange={setMasterSystem} />
                    <label htmlFor="master-system" className="font-medium">Master System Status</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="auto-schedule" checked={autoSchedule} onCheckedChange={setAutoSchedule} />
                    <label htmlFor="auto-schedule">Enable Automatic Scheduling</label>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
            <Card key={zone.id} className="shadow-sm flex flex-col">
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <CardTitle className="font-headline">{zone.name}</CardTitle>
                        <Badge variant={zone.status === 'error' ? 'destructive' : 'secondary'}>
                            <span className={cn("h-2 w-2 rounded-full mr-2", statusConfig[zone.status].color)}></span>
                            {statusConfig[zone.status].label}
                        </Badge>
                     </div>
                     <CardDescription>{zone.crop}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium">Soil Moisture</label>
                            <span className="text-sm font-bold">{zone.soilMoisture}%</span>
                        </div>
                        <Progress value={zone.soilMoisture} indicatorClassName={getMoistureColor(zone.soilMoisture)} />
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">
                            {zone.status === 'watering' ? 'Currently irrigating...' : zone.nextRun ? `Next run: ${zone.nextRun}` : 'No scheduled runs.'}
                        </p>
                    </div>
                </CardContent>
                 <CardContent className="flex gap-2">
                     <Button 
                        variant={zone.status === 'watering' ? 'destructive' : 'default'}
                        onClick={() => handleToggleZone(zone.id)}
                        className="w-full"
                        disabled={zone.status === 'error' || zone.status === 'scheduled'}
                     >
                        {zone.status === 'watering' ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {zone.status === 'watering' ? 'Stop' : 'Start'}
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                    </Button>
                 </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
