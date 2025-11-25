
'use client';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import type { Order, Review, TransportRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Star, Calendar, ShoppingCart, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

function LeaveReviewDialog({ order }: { order: Order }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const handleSubmitReview = async () => {
        if (rating === 0 || !comment.trim()) {
            toast({
                variant: 'destructive',
                title: 'Incomplete Review',
                description: 'Please provide a rating and a comment.'
            });
            return;
        }
        if (!firestore || !user || !order.cropListing) return;

        toast({ title: 'Submitting Review...', description: 'Please wait.' });
        
        // Reviews are stored under the farmer being reviewed
        const reviewCollectionRef = collection(firestore, `users/${order.cropListing.farmerId}/reviews`);
        const newReview: Omit<Review, 'id'> = {
            orderId: order.id,
            buyerId: user.uid,
            farmerId: order.cropListing.farmerId,
            rating,
            comment,
            reviewDate: new Date().toISOString(),
            buyerName: user.displayName || 'Anonymous Buyer',
        };
        
        await addDocumentNonBlocking(reviewCollectionRef, newReview);

        toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                    <Star className="mr-2 h-4 w-4" />
                    Leave Review
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogDescription>Share your experience with {order.cropListing?.farmerName} for your purchase of {order.cropListing?.cropType}.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <label className="font-medium">Rating</label>
                        <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-8 w-8 cursor-pointer transition-colors ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                    onClick={() => setRating(i + 1)}
                                />
                            ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="comment" className="font-medium">Comment</label>
                        <Textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="How was the quality of the crop? Was the delivery timely?" className="mt-2"/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleSubmitReview}>Submit Review</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function OrderCard({ order, transportRequest, onRequestTransport }: { order: Order; transportRequest?: TransportRequest, onRequestTransport: (order: Order) => void; }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start gap-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                        src={order.cropListing?.imageUrl || `https://picsum.photos/seed/${order.cropListingId}/200/200`}
                        alt={order.cropListing?.cropType || 'Crop'}
                        fill
                        className="object-cover"
                        data-ai-hint={order.cropListing?.imageHint || 'crop'}
                    />
                </div>
                <div className="flex-grow">
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">{order.status}</Badge>
                    <CardTitle className="font-headline mt-1">{order.cropListing?.cropType}</CardTitle>
                    <CardDescription>
                        From <Link href={`/farmers/${order.cropListing?.farmerId}`} className="text-primary hover:underline">{order.cropListing?.farmerName}</Link>
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Ordered on: {new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                 <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Quantity: {order.quantity} {order.cropListing?.unit}</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {transportRequest ? (
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/transport/${transportRequest.id}`}>
                             <Truck className="mr-2 h-4 w-4" />
                            View Request
                        </Link>
                    </Button>
                ) : (
                     <Button variant="outline" size="sm" onClick={() => onRequestTransport(order)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Request Transport
                    </Button>
                )}
                {order.status === 'delivered' && <LeaveReviewDialog order={order} />}
            </CardFooter>
        </Card>
    );
}

export default function OrdersPage() {
    const { setPageTitle, role } = useAppContext();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        setPageTitle(role === 'Farmer' ? 'Incoming Orders' : 'My Orders');
    }, [setPageTitle, role]);

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        const baseQuery = collection(firestore, 'orders');

        // This is now a safe query because the security rules will filter the results
        // on the backend for both buyers and farmers.
        return query(baseQuery, orderBy('orderDate', 'desc'));

    }, [firestore, user, role]);

    const { data: allOrders, isLoading } = useCollection<Order>(ordersQuery);

    // Client-side filtering after fetching
    const orders = useMemo(() => {
        if (!allOrders || !user) return [];
        if (role === 'Buyer') {
            return allOrders.filter(order => order.buyerId === user.uid);
        }
        if (role === 'Farmer') {
            return allOrders.filter(order => order.cropListing?.farmerId === user.uid);
        }
        return [];
    }, [allOrders, user, role]);


    const transportRequestsQuery = useMemoFirebase(() => {
        if (!firestore || !orders || orders.length === 0) return null;
        const orderIds = orders.map(o => o.id);
        if (orderIds.length === 0) return null;
        return query(collection(firestore, 'transportRequests'), where('orderId', 'in', orderIds));
    }, [firestore, orders]);
    const { data: transportRequests } = useCollection<TransportRequest>(transportRequestsQuery);
    
    const requestsByOrderId = useMemo(() => {
        return transportRequests?.reduce((acc, req) => {
            acc[req.orderId] = req;
            return acc;
        }, {} as Record<string, TransportRequest>) || {};
    }, [transportRequests]);

    const handleRequestTransport = async (order: Order) => {
        if (!firestore) return;
        toast({ title: "Creating Transport Request", description: "Please wait..." });

        const transportRequestCollection = collection(firestore, 'transportRequests');
        const newRequest = {
            orderId: order.id,
            pickupLocation: order.cropListing?.location || 'Unknown Location',
            deliveryLocation: order.deliveryAddress,
            requiredVehicle: 'Standard Truck', // Placeholder
            status: 'open',
            bidCount: 0,
        };

        await addDocumentNonBlocking(transportRequestCollection, newRequest);
        
        toast({ title: "Success", description: "Transport request has been created for transporters to bid on." });
    };

    const effectiveIsLoading = isLoading || isUserLoading;
    
    const pageTitle = role === 'Farmer' ? 'Incoming Orders' : 'My Orders';
    const pageDescription = role === 'Farmer' 
        ? "Track orders placed for your crops." 
        : "Track your past and current purchases.";

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Package className="text-primary" />
                        {pageTitle}
                    </CardTitle>
                    <CardDescription>{pageDescription}</CardDescription>
                </CardHeader>
            </Card>
            
            {effectiveIsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
                </div>
            )}

            {!effectiveIsLoading && orders && orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            transportRequest={requestsByOrderId[order.id]}
                            onRequestTransport={handleRequestTransport} 
                        />
                    ))}
                </div>
            ) : null}

            {!effectiveIsLoading && (!orders || orders.length === 0) && (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>No Orders Found</CardTitle>
                        <CardDescription>
                            {role === 'Buyer' ? "You haven't placed any orders. Head over to the marketplace to start shopping!" : "You do not have any incoming orders at this time."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {role === 'Buyer' && (
                             <Link href="/market">
                                <Button>Go to Marketplace</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    