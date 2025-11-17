'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Construction, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TutorialsPage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    setPageTitle('Video Tutorials');
  }, [setPageTitle]);

  const handleNotify = () => {
    toast({
        title: 'You\'re on the list!',
        description: 'We will notify you as soon as new tutorials are available.',
    });
  }

  return (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-2xl text-center shadow-lg">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Video className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl pt-4">Video Tutorials Coming Soon!</CardTitle>
                <CardDescription className="text-base">
                    We're producing a series of helpful video guides to walk you through all of CropTrade's features, from listing a crop to managing smart devices.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                    <Image 
                        src="https://picsum.photos/seed/tutorials/1280/720"
                        alt="A person watching a tutorial on a laptop"
                        fill
                        className="object-cover"
                        data-ai-hint="video tutorial"
                    />
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <p className="font-semibold text-lg flex items-center gap-2"><Construction className="h-5 w-5 text-amber-500" /> Under Development</p>
                    <p className="text-muted-foreground">Our video content is in production. Click below to be notified when it goes live.</p>
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
