'use client';
import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Gavel, List, Users } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Auction, CropListing } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { setPageTitle } = useAppContext();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'cropListings');
  }, [firestore, user]);
  const { data: crops, isLoading: isLoadingCrops } = useCollection<CropListing>(cropsQuery);

  const auctionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'auctions'), where('status', '==', 'open'));
  }, [firestore, user]);
  const { data: auctions, isLoading: isLoadingAuctions } = useCollection<Auction>(auctionsQuery);
  
  const isLoading = isLoadingCrops || isLoadingAuctions || isUserLoading;

  useEffect(() => {
    setPageTitle('Dashboard');
  }, [setPageTitle]);

  const totalBidders = useMemo(() => {
      if (!auctions) return 0;
      // This is a placeholder logic. In a real scenario, you'd likely count unique bidders.
      // For now, we'll just count the number of auctions with a bidder.
      return auctions.filter(a => a.currentBidderId).length;
  }, [auctions]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold tracking-tight">
          Welcome to CropTrade
        </h2>
        <p className="text-muted-foreground">
          Your central hub for agricultural commerce.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Listings
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{crops?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">
              Crops available in the marketplace
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Auctions</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{auctions?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">
              Live bidding opportunities
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bidders
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{totalBidders}</div>}
            <p className="text-xs text-muted-foreground">
              Across all open auctions
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>Use the sidebar to navigate through the application's features. Your available options will change based on your selected role.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>As a <span className="font-semibold text-foreground">Farmer</span>, you can analyze your soil, detect pests, and generate marketing materials for your crops using our AI tools.</li>
                    <li>As a <span className="font-semibold text-foreground">Buyer</span>, you can browse the marketplace, participate in auctions, and track your purchases.</li>
                    <li>As a <span className="font-semibold text-foreground">Transporter</span>, you can view transport-related information.</li>
                </ul>
                <p>Switch your role using the avatar in the top-right corner to explore different perspectives.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    