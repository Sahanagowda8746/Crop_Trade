
'use client';
import { useEffect, useState } from 'react';
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
import type { Auction } from '@/lib/types';
import { Gavel, Clock, Users, Tag, Package } from 'lucide-react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


const TimeLeft = ({ endTime }: { endTime: string }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60); // update every minute

    return () => clearTimeout(timer);
  });

  const timerComponents: string[] = [];

  Object.entries(timeLeft).forEach(([interval, value]) => {
    if (value > 0) {
      timerComponents.push(`${value}${interval.slice(0, 1)}`);
    }
  });

  return (
    <span className="font-semibold text-amber-600">
      {timerComponents.length ? timerComponents.join(' ') + ' left' : 'Auction ended'}
    </span>
  );
};

function PlaceBidDialog({ auction, userId }: { auction: Auction; userId: string }) {
    const [bidAmount, setBidAmount] = useState<number | string>('');
    const { toast } = useToast();
    const firestore = useFirestore();

    const currentBid = auction.currentBid || auction.startingBid;
    const minBid = currentBid + 1; // Assuming bid increment is 1

    const handlePlaceBid = () => {
        const newBid = Number(bidAmount);
        if (newBid <= currentBid) {
            toast({
                variant: 'destructive',
                title: 'Invalid Bid',
                description: `Your bid must be higher than the current bid of $${currentBid.toFixed(2)}.`,
            });
            return;
        }

        if (!firestore) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not connect to the database.',
            });
            return;
        }

        const auctionRef = doc(firestore, 'auctions', auction.id);
        updateDocumentNonBlocking(auctionRef, {
            currentBid: newBid,
            currentBidderId: userId,
        });
        
        toast({
            title: 'Bid Placed!',
            description: `You have successfully placed a bid of $${newBid.toFixed(2)}.`,
        });
    };

    useEffect(() => {
        // When the dialog opens, suggest the minimum next bid
        setBidAmount(minBid);
    }, [minBid]);


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={new Date(auction.endDate) < new Date()}>
                    <Gavel className="mr-2 h-4 w-4" />
                    Place Bid
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Place a Bid</DialogTitle>
                    <DialogDescription>
                        Place a bid on "{auction.cropListing?.cropType} - {auction.cropListing?.variety}". The current bid is ${currentBid.toFixed(2)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="bid-amount" className="text-right">
                            Your Bid
                        </label>
                        <Input
                            id="bid-amount"
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="col-span-3"
                            min={minBid}
                            step="1"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" onClick={handlePlaceBid}>Place Bid</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function AuctionsPage() {
  const { setPageTitle } = useAppContext();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const auctionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'auctions'), where('status', '==', 'open'));
  }, [firestore, user]);

  const { data: auctions, isLoading } = useCollection<Auction>(auctionsQuery);

  useEffect(() => {
    setPageTitle('Live Auctions');
  }, [setPageTitle]);
  
  const effectiveIsLoading = isLoading || isUserLoading;

  if (effectiveIsLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i} className="shadow-sm">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {!effectiveIsLoading && auctions?.length === 0 && (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardHeader>
                <CardTitle>No Live Auctions</CardTitle>
                <CardDescription>There are currently no open auctions. Please check back later.</CardDescription>
              </CardHeader>
            </Card>
          </div>
      )}
      {auctions?.map((auction: Auction) => (
        <Card key={auction.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
          <div className="relative h-48 w-full">
             <Image
                src={auction.cropListing?.imageUrl || `https://picsum.photos/seed/${auction.id}/600/400`}
                alt={auction.cropListing?.cropType || 'Crop'}
                fill
                className="object-cover"
                data-ai-hint={auction.cropListing?.imageHint || 'crop'}
              />
          </div>
          <div className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{auction.cropListing?.cropType} - {auction.cropListing?.variety}</CardTitle>
              <CardDescription>
                Listed by <Link href={`/farmers/${auction.cropListing?.farmerId}`} className="text-primary hover:underline font-medium">{auction.cropListing?.farmerName}</Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Start Bid</p>
                        <p className="font-semibold">${auction.startingBid.toFixed(2)}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Current Bid</p>
                        <p className="font-bold text-lg text-primary">${(auction.currentBid || auction.startingBid).toFixed(2)}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-semibold">{auction.cropListing?.quantity} {auction.cropListing?.unit}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Time Left</p>
                        <TimeLeft endTime={auction.endDate} />
                    </div>
                  </div>
               </div>
                <div className="flex items-center gap-2 text-sm pt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {auction.bidderCount || 0} {auction.bidderCount === 1 ? 'bidder' : 'bidders'}
                  </span>
                </div>
            </CardContent>
            <CardFooter>
              {user && <PlaceBidDialog auction={auction} userId={user.uid} />}
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}
