'use client';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Gavel, List, Users } from 'lucide-react';
import { auctions, crops } from '@/lib/data';

export default function DashboardPage() {
  const { setPageTitle } = useAppContext();

  useEffect(() => {
    setPageTitle('Dashboard');
  }, [setPageTitle]);

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
            <div className="text-2xl font-bold">{crops.length}</div>
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
            <div className="text-2xl font-bold">{auctions.length}</div>
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
            <div className="text-2xl font-bold">
                {auctions.reduce((sum, auction) => sum + auction.bidderCount, 0)}
            </div>
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
                    <li>As a <span className="font-semibold text-foreground">Farmer</span>, you can analyze your soil and detect pests in your crops using our AI tools.</li>
                    <li>As a <span className="font-semibold text-foreground">Buyer</span>, you can track your purchases using the traceability feature.</li>
                    <li>As a <span className="font-semibold text-foreground">Transporter</span>, you can view transport-related information.</li>
                    <li>Anyone can browse the <span className="font-semibold text-foreground">Marketplace</span> and view ongoing <span className="font-semibold text-foreground">Auctions</span>.</li>
                </ul>
                <p>Switch your role using the avatar in the top-right corner to explore different perspectives.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
