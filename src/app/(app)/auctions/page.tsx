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
import { auctions } from '@/lib/data';
import { Auction } from '@/lib/types';
import { Gavel, Clock, Users } from 'lucide-react';
import Image from 'next/image';

const TimeLeft = ({ endTime }: { endTime: Date }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60); // update every minute

    return () => clearTimeout(timer);
  });

  const timerComponents: string[] = [];

  Object.entries(timeLeft).forEach(([interval, value]) => {
    if (value > 0) {
      timerComponents.push(`${value} ${interval.slice(0, 1)}`);
    }
  });

  return (
    <span className="font-semibold text-amber-600">
      {timerComponents.length ? timerComponents.join(' ') + ' left' : 'Auction ended'}
    </span>
  );
};


export default function AuctionsPage() {
  const { setPageTitle } = useAppContext();

  useEffect(() => {
    setPageTitle('Auctions');
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
      {auctions.map((auction: Auction) => (
        <Card key={auction.id} className="flex flex-col md:flex-row overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
          <div className="relative h-48 md:h-auto md:w-1/3 flex-shrink-0">
             <Image
                src={auction.crop.imageUrl}
                alt={auction.crop.name}
                fill
                className="object-cover"
                data-ai-hint={auction.crop.imageHint}
              />
          </div>
          <div className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{auction.crop.name} - {auction.crop.variety}</CardTitle>
              <CardDescription>From {auction.crop.farmer}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">Current Bid:</span>
                <span className="font-bold text-primary">${auction.currentBid.toFixed(2)}</span>
              </div>
               <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <TimeLeft endTime={auction.endTime} />
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{auction.bidderCount} bidders</span>
                </div>
               </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Gavel className="mr-2 h-4 w-4" />
                Place Bid
              </Button>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}
