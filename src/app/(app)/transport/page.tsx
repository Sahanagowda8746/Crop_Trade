'use client';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Truck } from 'lucide-react';

export default function TransportPage() {
  const { setPageTitle } = useAppContext();

  useEffect(() => {
    setPageTitle('Transport Optimization');
  }, [setPageTitle]);

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
            <div className="mx-auto bg-secondary rounded-full p-4 w-fit">
              <Truck className="h-12 w-12 text-primary" />
            </div>
          <CardTitle className="font-headline text-2xl mt-4">Feature Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We are currently developing our advanced transport optimization tools. This feature will help you find the most efficient and cost-effective delivery routes for your crops.
          </p>
          <p className="text-muted-foreground mt-2">
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
