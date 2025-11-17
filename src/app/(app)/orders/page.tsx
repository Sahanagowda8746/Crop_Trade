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
import type { Order, Review } from '@/lib/types';
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

function OrderCard({ order, onRequestTransport }: { order: Order; onRequestTransport: (order: Order) => void; }) {
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
                <Button variant="outline" size="sm" onClick={() => onRequestTransport(order)}>
                    <Truck className="mr-2 h-4 w-4" />
                    Request Transport
                </Button>
                {order.status === 'delivered' && <LeaveReviewDialog order={order} />}
            </CardFooter>
        </Card>
    );
}

export default function OrdersPage() {
    const { setPageTitle } = useAppContext();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        setPageTitle('My Orders');
    }, [setPageTitle]);

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'orders'), where('buyerId', '==', user.uid), orderBy('orderDate', 'desc'));
    }, [firestore, user]);

    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
    
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Package className="text-primary" />
                        My Orders
                    </CardTitle>
                    <CardDescription>Track your past and current purchases. You can request transport for pending orders.</CardDescription>
                </CardHeader>
            </Card>
            
            {effectiveIsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
                </div>
            )}

            {!effectiveIsLoading && orders && orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map(order => <OrderCard key={order.id} order={order} onRequestTransport={handleRequestTransport} />)}
                </div>
            ) : null}

            {!effectiveIsLoading && (!orders || orders.length === 0) && (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>No Orders Yet</CardTitle>
                        <CardDescription>You haven't placed any orders. Head over to the marketplace to start shopping!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/market">
                            <Button>Go to Marketplace</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
