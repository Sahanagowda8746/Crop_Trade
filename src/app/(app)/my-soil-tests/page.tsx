
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import type { SoilKitOrder } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TestTube, FlaskConical, CheckCircle, Package, Truck, Upload, PlusCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function SoilKitOrderCard({ order, role, onCancel }: { order: SoilKitOrder, role: string, onCancel: (orderId: string) => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const statusIcons: { [key: string]: JSX.Element } = {
        ordered: <Package className="w-4 h-4 mr-2" />,
        shipped: <Truck className="w-4 h-4 mr-2" />,
        received: <CheckCircle className="w-4 h-4 mr-2" />,
        processing: <FlaskConical className="w-4 h-4 mr-2 animate-pulse" />,
        completed: <CheckCircle className="w-4 h-4 mr-2 text-green-500" />,
    }
    
    const handleUploadReport = () => {
        if (!firestore) return;
        toast({ title: 'Simulating Upload...', description: 'Updating order status to completed and adding report URL.'});
        const orderRef = doc(firestore, 'soilKitOrders', order.id);
        updateDocumentNonBlocking(orderRef, {
            status: 'completed',
            labReportUrl: 'https://example.com/sample-lab-report.pdf' // Placeholder URL
        });
        toast({ title: 'Report "Uploaded"!', description: 'The farmer can now view their report.'});
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                     <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <TestTube className="text-primary"/> Soil Test Kit
                    </CardTitle>
                    <Badge variant="default">Lab</Badge>
                </div>
                 <CardDescription>
                    Ordered on {new Date(order.orderDate).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                    {statusIcons[order.status]}
                    <p className="font-semibold capitalize">{order.status}</p>
                </div>
                {order.status === 'shipped' && order.trackingId && (
                     <p className="text-sm text-muted-foreground">
                        Tracking ID: <span className="font-mono text-primary">{order.trackingId}</span>
                    </p>
                )}
                 <div className="flex items-center gap-2 flex-wrap">
                    {order.status === 'completed' && order.labReportUrl ? (
                        <Button asChild size="sm">
                            <Link href={order.labReportUrl} target="_blank">View Lab Report</Link>
                        </Button>
                    ) : role === 'Admin' && order.status === 'processing' ? (
                        <Button size="sm" variant="secondary" onClick={handleUploadReport}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Report
                        </Button>
                    ) : null}

                     {order.status === 'ordered' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. You will be refunded if applicable.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onCancel(order.id)}>Yes, Cancel Order</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function MySoilTestsPage() {
    const { setPageTitle, role } = useAppContext();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        setPageTitle('My Soil Tests');
    }, [setPageTitle]);

    const kitOrdersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        const baseCollection = collection(firestore, 'soilKitOrders');
        // Admins see all orders to manage them. Other users only see their own.
        if (role === 'Admin') {
            return query(baseCollection, orderBy('orderDate', 'desc'));
        }
        // Simplified query to avoid needing a composite index. Sorting is handled client-side.
        return query(baseCollection, where('userId', '==', user.uid));
    }, [user, firestore, role]);

    const { data: kitOrders, isLoading: isLoadingKitOrders } = useCollection<SoilKitOrder>(kitOrdersQuery);

    const sortedKitOrders = useMemo(() => {
        if (!kitOrders) return [];
        // Sort the data on the client-side
        return [...kitOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [kitOrders]);
    
    const handleCancelOrder = (orderId: string) => {
        if (!firestore) return;
        const orderRef = doc(firestore, 'soilKitOrders', orderId);
        deleteDocumentNonBlocking(orderRef);
        toast({
            title: 'Order Cancelled',
            description: 'Your soil kit order has been successfully cancelled.',
        });
    };

    const isLoading = isUserLoading || isLoadingKitOrders;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">My Soil Kit Orders</CardTitle>
                        <CardDescription>Track your physical soil kit orders and view lab reports. {role === 'Admin' && <span className="font-bold text-primary">(Admin View)</span>}</CardDescription>
                    </div>
                     <Button asChild>
                        <Link href="/soil-kit">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Order Another Kit
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            {isLoading && (
                <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
            )}
            {!isLoading && sortedKitOrders.length === 0 && (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>No Soil Kit Orders</CardTitle>
                        <CardDescription>Purchase a soil kit for a professional lab analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/soil-kit">Order a Kit</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
            <div className="grid md:grid-cols-2 gap-4">
                {sortedKitOrders.map(order => <SoilKitOrderCard key={order.id} order={order} role={role} onCancel={handleCancelOrder}/>)}
            </div>
        </div>
    );
}
