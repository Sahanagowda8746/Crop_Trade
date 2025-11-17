'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Waypoints, Construction, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DroneMappingPage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    setPageTitle('Drone Mapping');
  }, [setPageTitle]);

  const handleNotify = () => {
    toast({
        title: 'You\'re on the list!',
        description: 'We will notify you as soon as Drone Mapping is available.',
    });
  }

  return (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-2xl text-center shadow-lg">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Waypoints className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl pt-4">Drone Mapping is Coming Soon!</CardTitle>
                <CardDescription className="text-base">
                    Get ready for a birds-eye view of your farm. Our upcoming drone mapping feature will provide detailed field analysis, plant health monitoring, and more.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                    <Image 
                        src="https://picsum.photos/seed/dronemap/1280/720"
                        alt="Drone mapping a field"
                        fill
                        className="object-cover"
                        data-ai-hint="drone farm"
                    />
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <p className="font-semibold text-lg flex items-center gap-2"><Construction className="h-5 w-5 text-amber-500" /> Under Development</p>
                    <p className="text-muted-foreground">Our team is hard at work building this feature. Click below to be notified when it launches.</p>
                </div>
                <Button size="lg" onClick={handleNotify}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notify Me When It's Ready
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
