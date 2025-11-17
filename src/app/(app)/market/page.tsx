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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Crop } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function CropCard({ crop }: { crop: Crop }) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={crop.imageUrl}
            alt={crop.name}
            fill
            className="object-cover"
            data-ai-hint={crop.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">
          {crop.variety}
        </Badge>
        <CardTitle className="font-headline text-2xl">{crop.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sold by {crop.farmer}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
        <div className="font-semibold text-lg text-primary">
          ${crop.price.toFixed(2)}
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
  
  const cropsCollection = useMemoFirebase(() => collection(firestore, 'cropListings'), [firestore]);
  const { data: crops, isLoading } = useCollection<Crop>(cropsCollection);

  useEffect(() => {
    setPageTitle('Marketplace');
  }, [setPageTitle]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {isLoading && Array.from({ length: 8 }).map((_, i) => <CropSkeleton key={i} />)}
      {crops && crops.map(crop => <CropCard key={crop.id} crop={crop} />)}
       {!isLoading && crops?.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Crops Available</CardTitle>
              <CardDescription>
                There are currently no crop listings in the marketplace. Check back later or add new listings if you're a farmer.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
