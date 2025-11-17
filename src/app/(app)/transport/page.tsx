'use client';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { TransportRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, Info } from 'lucide-react';
import Link from 'next/link';

function RequestCard({ request }: { request: TransportRequest }) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center justify-between font-headline">
                    Request: #{request.id.substring(0, 7)}...
                    <span className="text-sm font-medium text-primary">{request.status}</span>
                </CardTitle>
                <CardDescription>
                    <span className="font-semibold">Order ID:</span>
                    <Link href="#" className="text-primary hover:underline ml-1">{request.orderId.substring(0,7)}...</Link>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-start gap-4">
                    <MapPin className="text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">From: {request.pickupLocation}</p>
                        <p className="text-sm text-muted-foreground">To: {request.deliveryLocation}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Truck className="text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Vehicle Required</p>
                        <p className="text-sm text-muted-foreground">{request.requiredVehicle || 'Not specified'}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Info className="text-muted-foreground" />
                    <div>
                         <p className="font-semibold">Bids</p>
                        <p className="text-sm text-muted-foreground">{request.bidCount || 0} bids placed</p>
                    </div>
                </div>
            </CardContent>
            <CardContent>
                <Link href={`/transport/${request.id}`} className="w-full">
                    <Button className="w-full">
                        <Truck className="mr-2 h-4 w-4" />
                        View Bids & Place Offer
                    </Button>
                 </Link>
            </CardContent>
        </Card>
    );
}

function RequestSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
}

export default function TransportPage() {
  const { setPageTitle } = useAppContext();
  const firestore = useFirestore();

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'transportRequests'), where('status', '==', 'open'));
  }, [firestore]);

  const { data: requests, isLoading } = useCollection<TransportRequest>(requestsQuery);

  useEffect(() => {
    setPageTitle('Transport Marketplace');
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Available Deliveries</CardTitle>
                <CardDescription>Browse and bid on crop delivery jobs from farmers to buyers.</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <RequestSkeleton key={i} />)}
            {requests && requests.map(request => <RequestCard key={request.id} request={request} />)}
            {!isLoading && requests?.length === 0 && (
                <div className="col-span-full">
                    <Card className="text-center py-12">
                        <CardHeader>
                            <CardTitle>No Transport Requests Available</CardTitle>
                            <CardDescription>There are currently no open transport requests.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </div>
    </div>
  );
}
