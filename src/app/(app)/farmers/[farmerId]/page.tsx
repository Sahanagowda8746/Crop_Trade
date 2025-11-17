'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { CropListing, UserProfile } from '@/lib/types';
import { useAppContext } from '@/context/app-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

function CropCard({ crop }: { crop: CropListing }) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={crop.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
            alt={crop.cropType}
            fill
            className="object-cover"
            data-ai-hint={crop.imageHint || 'crop'}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">
          {crop.variety}
        </Badge>
        <CardTitle className="font-headline text-xl">{crop.cropType}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {new Date(crop.harvestDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} harvest
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
        <div className="font-semibold text-lg text-primary">
          ${crop.pricePerUnit.toFixed(2)}
          <span className="text-xs text-muted-foreground"> / {crop.unit || 'kg'}</span>
        </div>
        <Button size="sm">View</Button>
      </CardFooter>
    </Card>
  );
}

export default function FarmerProfilePage() {
  const { setPageTitle } = useAppContext();
  const params = useParams();
  const farmerId = params.farmerId as string;
  const firestore = useFirestore();

  const farmerRef = useMemoFirebase(() => (firestore && farmerId ? doc(firestore, 'users', farmerId) : null), [firestore, farmerId]);
  const { data: farmer, isLoading: isLoadingFarmer } = useDoc<UserProfile>(farmerRef);

  const cropsQuery = useMemoFirebase(() => {
      if (!firestore || !farmerId) return null;
      return query(collection(firestore, 'cropListings'), where('farmerId', '==', farmerId));
  }, [firestore, farmerId]);

  const { data: crops, isLoading: isLoadingCrops } = useCollection<CropListing>(cropsQuery);
  
  useEffect(() => {
    if (farmer) {
      setPageTitle(`${farmer.firstName} ${farmer.lastName}`);
    } else {
        setPageTitle('Farmer Profile');
    }
  }, [farmer, setPageTitle]);

  if (isLoadingFarmer) {
      return (
          <div className="space-y-6">
              <Card className="flex flex-col md:flex-row items-center p-6 space-y-4 md:space-y-0 md:space-x-6">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-2 text-center md:text-left">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-32" />
                  </div>
              </Card>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
          </div>
      )
  }

  if (!farmer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farmer not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested farmer profile could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardContent className="flex flex-col md:flex-row items-center p-6 gap-6">
          <Avatar className="h-24 w-24 text-lg">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${farmer.id}`} alt={`${farmer.firstName} ${farmer.lastName}`} />
            <AvatarFallback>{farmer.firstName?.charAt(0)}{farmer.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-headline font-bold">{farmer.firstName} {farmer.lastName}</h1>
            <p className="text-muted-foreground">{farmer.location}</p>
            <div className="flex items-center justify-center md:justify-start gap-1 mt-2 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-muted-foreground stroke-muted-foreground" />
                <span className="text-sm text-muted-foreground ml-2">(12 reviews)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-headline font-bold mb-4">Active Listings</h2>
        {isLoadingCrops ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
        ) : crops && crops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map(crop => <CropCard key={crop.id} crop={crop} />)}
          </div>
        ) : (
          <p className="text-muted-foreground">This farmer has no active listings.</p>
        )}
      </div>

       <div>
        <h2 className="text-2xl font-headline font-bold mb-4">Reviews</h2>
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground">Reviews and rating system coming soon!</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
