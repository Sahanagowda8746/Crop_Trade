'use client';
import { useEffect } from 'react';
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
import { crops } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function MarketPage() {
  const { setPageTitle } = useAppContext();

  useEffect(() => {
    setPageTitle('Marketplace');
  }, [setPageTitle]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {crops.map(crop => (
        <Card key={crop.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
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
            <Badge variant="secondary" className="mb-2">{crop.variety}</Badge>
            <CardTitle className="font-headline text-2xl">{crop.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sold by {crop.farmer}
            </CardDescription>
          </CardContent>
          <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
            <div className="font-semibold text-lg text-primary">
              ${crop.price.toFixed(2)}
              <span className="text-xs text-muted-foreground"> / {crop.name === 'Tomatoes' || crop.name === 'Carrots' || crop.name === 'Potatoes' ? 'kg' : 'ton'}</span>
            </div>
            <Button>View Details</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
