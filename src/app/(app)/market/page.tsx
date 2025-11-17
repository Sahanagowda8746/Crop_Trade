'use client';
import { useEffect, useMemo } from 'react';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { CropListing } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { initialCrops } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

function CropCard({ crop }: { crop: CropListing }) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
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
        <CardTitle className="font-headline text-2xl">{crop.cropType}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sold by {crop.farmerName}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
        <div className="font-semibold text-lg text-primary">
          ${crop.pricePerUnit.toFixed(2)}
          <span className="text-xs text-muted-foreground">
            {' '}
            / {crop.unit || 'kg'}
          </span>
        </div>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  );
}

function CropSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden shadow-sm">
            <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-4/5 mb-1" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    )
}

export default function MarketPage() {
  const { setPageTitle } = useAppContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const cropsCollectionRef = useMemoFirebase(() => collection(firestore, 'cropListings'), [firestore]);
  const { data: crops, isLoading } = useCollection<CropListing>(cropsCollectionRef);

  useEffect(() => {
    setPageTitle('Marketplace');
  }, [setPageTitle]);

  const handleSeedData = () => {
    toast({
        title: 'Seeding Data',
        description: 'Adding initial crop data to the database...',
    });

    const promises = initialCrops.map((crop) => {
        const docRef = doc(cropsCollectionRef, crop.id);
        // Using setDocumentNonBlocking to ensure we use the predefined IDs
        // and avoid duplicates on multiple clicks.
        setDocumentNonBlocking(docRef, crop, {});
    });
    
    toast({
        title: 'Success',
        description: `${initialCrops.length} crop listings have been added to the database.`,
        variant: 'default',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <CropSkeleton key={i} />)}
        {crops && crops.map(crop => <CropCard key={crop.id} crop={crop} />)}
        {!isLoading && crops?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>No Crops Available</CardTitle>
                <CardDescription>
                  The marketplace is currently empty. Click the button below to add some sample data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={handleSeedData}>Seed Data</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {crops && crops.length > 0 && (
          <div className="text-center pt-4">
              <Button onClick={handleSeedData} variant="outline">Re-seed Data</Button>
          </div>
      )}
    </div>
  );
}
