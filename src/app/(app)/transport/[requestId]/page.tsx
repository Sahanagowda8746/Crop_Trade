'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import type { TransportRequest, TransportBid } from '@/lib/types';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Truck, Calendar, DollarSign, User, Gavel } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const bidSchema = z.object({
  bidAmount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Bid must be a positive number.')
  ),
  estimatedDeliveryDate: z.string().min(1, 'Please select a delivery date.'),
});

function BidCard({ bid }: { bid: TransportBid }) {
    return (
        <Card className="bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg">{bid.transporterName}</CardTitle>
                    <CardDescription>Placed on {new Date().toLocaleDateString()}</CardDescription>
                </div>
                 <div className="flex items-center gap-2 text-lg font-bold text-primary">
                    <DollarSign className="h-5 w-5" />
                    {bid.bidAmount.toFixed(2)}
                </div>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Est. Delivery: {new Date(bid.estimatedDeliveryDate).toLocaleDateString()}</span>
            </CardContent>
        </Card>
    )
}

function PlaceBidForm({ requestId, transporterId, transporterName }: { requestId: string; transporterId: string; transporterName: string }) {
  const form = useForm<z.infer<typeof bidSchema>>({
    resolver: zodResolver(bidSchema),
    defaultValues: { bidAmount: 0, estimatedDeliveryDate: '' },
  });
  const firestore = useFirestore();
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof bidSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Database not connected.'});
        return;
    }

    const bidCollectionRef = collection(firestore, `transportRequests/${requestId}/bids`);
    
    const newBid: Omit<TransportBid, 'id'> = {
        transportRequestId: requestId,
        transporterId,
        transporterName,
        bidAmount: values.bidAmount,
        estimatedDeliveryDate: values.estimatedDeliveryDate,
        status: 'pending',
    };

    await addDocumentNonBlocking(bidCollectionRef, newBid);

    toast({ title: 'Bid Placed!', description: 'Your bid has been submitted successfully.' });
    form.reset();
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Place Your Bid</CardTitle>
            <CardDescription>Submit your offer for this delivery job.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="bidAmount" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bid Amount ($)</FormLabel>
                            <FormControl><Input type="number" placeholder="150.00" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="estimatedDeliveryDate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estimated Delivery Date</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" className="w-full">
                        <Gavel className="mr-2 h-4 w-4" />
                        Submit Bid
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}

export default function TransportRequestPage() {
  const { setPageTitle } = useAppContext();
  const params = useParams();
  const requestId = params.requestId as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { role } = useAppContext();

  const requestRef = useMemoFirebase(() => (firestore && requestId ? doc(firestore, 'transportRequests', requestId) : null), [firestore, requestId]);
  const { data: request, isLoading: isLoadingRequest } = useDoc<TransportRequest>(requestRef);

  const bidsQuery = useMemoFirebase(() => {
    if (!firestore || !requestId) return null;
    return query(collection(firestore, `transportRequests/${requestId}/bids`), orderBy('bidAmount', 'asc'));
  }, [firestore, requestId]);
  const { data: bids, isLoading: isLoadingBids } = useCollection<TransportBid>(bidsQuery);
  
  useEffect(() => {
    if (request) {
      setPageTitle(`Transport Request #${request.id.substring(0, 7)}`);
    } else {
        setPageTitle('Transport Request');
    }
  }, [request, setPageTitle]);

  const isLoading = isLoadingRequest || isLoadingBids || isUserLoading;

  if (isLoading) {
    return <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
    </div>
  }

  if (!request) {
    return (
      <Card>
        <CardHeader><CardTitle>Request Not Found</CardTitle></CardHeader>
        <CardContent><p>The transport request could not be found.</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Job Details</CardTitle>
                <CardDescription>Order ID: {request.orderId}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                    <MapPin className="text-primary mt-1" />
                    <div>
                        <p className="font-semibold text-lg">Route</p>
                        <p><span className="font-medium">From:</span> {request.pickupLocation}</p>
                        <p><span className="font-medium">To:</span> {request.deliveryLocation}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Truck className="text-primary mt-1" />
                    <div>
                        <p className="font-semibold text-lg">Vehicle Requirement</p>
                        <p>{request.requiredVehicle || 'Not specified'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <h2 className="font-headline text-xl font-semibold">Current Bids ({bids?.length || 0})</h2>
                {bids && bids.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {bids.map(bid => <BidCard key={bid.id} bid={bid} />)}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No bids have been placed yet.</p>
                )}
             </div>
              <div>
                {role === 'Transporter' && user && (
                    <PlaceBidForm requestId={requestId} transporterId={user.uid} transporterName={user.displayName || 'Anonymous Transporter'}/>
                )}
                 {role !== 'Transporter' && (
                    <Card>
                        <CardHeader>
                             <CardTitle className="font-headline">Bidding Area</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Only users with the 'Transporter' role can place bids. Switch your role to participate.</p>
                        </CardContent>
                    </Card>
                 )}
              </div>
        </div>
    </div>
  );
}
