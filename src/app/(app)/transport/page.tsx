'use client';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Truck, User } from 'lucide-react';

function OrderCard({ order }: { order: Order }) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center justify-between font-headline">
                    Order: #{order.id.substring(0, 7)}...
                    <span className="text-sm font-medium text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</span>
                </CardTitle>
                <CardDescription>Status: <span className="font-semibold text-primary">{order.status}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Package className="text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{order.cropListing?.cropType} ({order.cropListing?.variety})</p>
                        <p className="text-sm text-muted-foreground">Quantity: {order.quantity} {order.cropListing?.unit}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <MapPin className="text-muted-foreground" />
                    <div>
                        <p className="font-semibold">From: {order.cropListing?.location}</p>
                        <p className="text-sm text-muted-foreground">To: {order.deliveryAddress}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <User className="text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Buyer: {order.buyer?.firstName} {order.buyer?.lastName}</p>
                        <p className="text-sm text-muted-foreground">{order.buyer?.location}</p>
                    </div>
                </div>
            </CardContent>
            <CardContent>
                 <Button className="w-full">
                    <Truck className="mr-2 h-4 w-4" />
                    Bid on this Delivery
                </Button>
            </CardContent>
        </Card>
    );
}

function OrderSkeleton() {
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

  const ordersCollectionRef = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
  const { data: orders, isLoading } = useCollection<Order>(ordersCollectionRef);

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
            {isLoading && Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
            {orders && orders.map(order => <OrderCard key={order.id} order={order} />)}
            {!isLoading && orders?.length === 0 && (
                <div className="col-span-full">
                    <Card className="text-center py-12">
                        <CardHeader>
                            <CardTitle>No Deliveries Available</CardTitle>
                            <CardDescription>There are currently no open orders requiring transport.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </div>
    </div>
  );
}
