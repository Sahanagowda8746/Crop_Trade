
'use client';
import { useEffect, useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { CropListing } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { initialCrops } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Pencil, CreditCard, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

function PaymentDialog({ crop, onConfirm }: { crop: CropListing; onConfirm: (crop: CropListing, paymentMethod: 'UPI' | 'Card') => void; }) {
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card'>('UPI');
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm(crop, paymentMethod);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={crop.quantity <= 0}>Buy Now</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Your Purchase</DialogTitle>
                    <DialogDescription>Select a payment method for '{crop.cropType}'.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <RadioGroup defaultValue="upi" onValueChange={(value: 'UPI' | 'Card') => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="UPI" id="upi" />
                            <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                                <Send className="h-5 w-5 text-primary" />
                                UPI
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Card" id="card" />
                            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Card (Credit/Debit)
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleConfirm}>Confirm Order</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CropCard({ crop, onBuy, onRemove, currentUserId }: { crop: CropListing, onBuy: (crop: CropListing, paymentMethod: 'UPI' | 'Card') => void, onRemove: (cropId: string) => void, currentUserId?: string }) {
  const isOwner = crop.farmerId === currentUserId;
  const isOutOfStock = crop.quantity <= 0;

  return (
    <Card className="flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 relative">
       {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2 z-10">Out of Stock</Badge>
        )}
      <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={crop.imageUrl || `https://picsum.photos/seed/${crop.id}/600/400`}
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
          Sold by{' '}
          <Link href={`/farmers/${crop.farmerId}`} className="hover:underline text-primary font-medium">
            {crop.farmerName}
          </Link>
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
        <div className="font-semibold text-lg text-primary">
          ₹{crop.pricePerUnit.toFixed(2)}
          <span className="text-xs text-muted-foreground">
            {' '}
            / {crop.unit || 'kg'}
          </span>
        </div>
        <div className="flex gap-2">
        {isOwner ? (
            <>
              <Button variant="outline" size="sm" asChild>
                  <Link href={`/market/edit/${crop.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your crop listing.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemove(crop.id)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
        ) : (
            <PaymentDialog crop={crop} onConfirm={onBuy} />
        )}
        </div>
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
  const { setPageTitle, role } = useAppContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  
  const cropsCollectionRef = useMemoFirebase(() => collection(firestore, 'cropListings'), [firestore]);
  const { data: crops, isLoading } = useCollection<CropListing>(cropsCollectionRef);

  useEffect(() => {
    setPageTitle('Marketplace');
  }, [setPageTitle]);

  const handleSeedData = () => {
    if (!firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to seed data.',
        });
        return;
    }
    toast({
        title: 'Seeding Data',
        description: 'Adding initial crop data to the database...',
    });

    initialCrops.forEach((crop) => {
        const docRef = doc(firestore, 'cropListings', crop.id);
        const userOwnedCrop = {
            ...crop,
            farmerId: user.uid,
            farmerName: user.displayName || 'Current User',
        };
        setDocumentNonBlocking(docRef, userOwnedCrop, { merge: true });
    });
    
    toast({
        title: 'Success',
        description: `${initialCrops.length} crop listings have been added to the database.`,
        variant: 'default',
    });
  };
  
  const handleBuy = async (crop: CropListing, paymentMethod: 'UPI' | 'Card') => {
    if (role !== 'Buyer') {
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: 'Only users with the "Buyer" role can purchase crops. Please switch your role.',
      });
      return;
    }

    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to purchase items.',
        });
        return;
    }
    
    toast({
        title: 'Processing Order',
        description: `Placing your order for ${crop.cropType}...`
    })

    const ordersCollectionRef = collection(firestore, 'orders');
    const newOrder = {
        buyerId: user.uid,
        cropListingId: crop.id,
        quantity: 1, // Placeholder quantity
        orderDate: new Date().toISOString(),
        deliveryAddress: '123 Main St, Anytown, USA', // Placeholder address
        status: 'pending',
        cropListing: crop, // Denormalize for easy display
        paymentMethod,
    };
    
    await addDocumentNonBlocking(ordersCollectionRef, newOrder);

    toast({
        title: 'Order Placed!',
        description: `You have successfully ordered ${crop.quantity} ${crop.unit} of ${crop.cropType}.`
    });
  }

  const handleRemove = (cropId: string) => {
    if (!firestore) return;

    const docRef = doc(firestore, 'cropListings', cropId);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: 'Listing Removed',
        description: 'The crop listing has been removed from the marketplace.'
    })
  }

  const effectiveIsLoading = isLoading || isUserLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">Browse fresh crops directly from farmers.</p>
        </div>
        {role === 'Farmer' && (
            <Link href="/market/new-listing">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Listing
                </Button>
            </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {effectiveIsLoading && Array.from({ length: 8 }).map((_, i) => <CropSkeleton key={i} />)}
        {crops && crops.map(crop => <CropCard key={crop.id} crop={crop} onBuy={handleBuy} onRemove={handleRemove} currentUserId={user?.uid}/>)}
        {!effectiveIsLoading && crops?.length === 0 && (
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
