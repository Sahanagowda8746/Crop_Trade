'use client';
import { useEffect, useActionState, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { handleUpdateListing } from '@/app/actions';
import { Pencil, Loader2, Upload, Save } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import type { CropListing } from '@/lib/types';

const listingSchema = z.object({
  listingId: z.string(),
  cropType: z.string().min(2, "Crop type is required."),
  variety: z.string().min(2, "Variety is required."),
  quantity: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Quantity must be a positive number.")
  ),
  unit: z.string().min(1, "Unit is required."),
  pricePerUnit: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Price must be a positive number.")
  ),
  location: z.string().min(3, "Location is required."),
  harvestDate: z.string().min(1, "Harvest date is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().optional(),
});

type FormSchema = z.infer<typeof listingSchema>;

const initialState = { message: '', errors: {} };

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Save className="mr-2 h-5 w-5" />
      )}
      Save Changes
    </Button>
  );
}

export default function EditListingPage() {
  const { setPageTitle } = useAppContext();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const listingId = params.listingId as string;
  
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useActionState(handleUpdateListing, initialState);
  
  const listingRef = useMemoFirebase(() => (firestore && listingId ? doc(firestore, 'cropListings', listingId) : null), [firestore, listingId]);
  const { data: listing, isLoading: isLoadingListing } = useDoc<CropListing>(listingRef);

  const form = useForm<FormSchema>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      listingId,
    },
  });
  
  useEffect(() => {
    setPageTitle('Edit Crop Listing');
  }, [setPageTitle]);
  
  useEffect(() => {
    if (listing) {
      form.reset({
        ...listing,
        listingId: listing.id,
        harvestDate: new Date(listing.harvestDate).toISOString().split('T')[0], // Format for date input
      });
      setPreview(listing.imageUrl || null);
    }
  }, [listing, form]);
  
  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith('error:')) {
        toast({ variant: 'destructive', title: "Update Error", description: state.message.replace('error:', '') });
      } else {
        toast({ title: "Listing Updated!", description: "Your changes have been saved." });
        router.push('/market');
      }
    }
  }, [state, toast, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) {
          toast({ variant: 'destructive', title: 'File Too Large', description: 'Please upload an image smaller than 4MB.' });
          return;
      }
      const dataUri = await fileToDataUri(file);
      setPreview(dataUri);
      form.setValue('imageUrl', dataUri);
    }
  };

  if (isLoadingListing) {
      return (
          <div className="max-w-4xl mx-auto">
              <Card><CardContent className="p-6"><Skeleton className="h-[600px] w-full" /></CardContent></Card>
          </div>
      )
  }

  if (!listing) {
      return (
          <div className="max-w-4xl mx-auto">
              <Card><CardHeader><CardTitle>Listing Not Found</CardTitle></CardHeader></Card>
          </div>
      )
  }
  
  if (user && listing.farmerId !== user.uid) {
       return (
          <div className="max-w-4xl mx-auto">
              <Card><CardHeader><CardTitle>Access Denied</CardTitle><CardDescription>You do not have permission to edit this listing.</CardDescription></CardHeader></Card>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <Pencil className="text-primary" />
              Edit Crop Listing
            </CardTitle>
            <CardDescription>
              Update the details of your crop listing below.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-8">
                 <FormField control={form.control} name="listingId" render={({ field }) => <Input type="hidden" {...field} />} />

                 <div>
                    <FormLabel>Crop Image</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                       <div className="relative w-32 h-32 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                          {preview ? (
                              <Image src={preview} alt="Crop preview" fill className="object-cover" />
                          ) : (
                              <span className="text-xs text-muted-foreground">No Image</span>
                          )}
                      </div>
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4"/>
                          Change Image
                      </Button>
                      <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                      <FormField control={form.control} name="imageUrl" render={({ field }) => <Input type="hidden" {...field} />} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField control={form.control} name="cropType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop Type</FormLabel>
                        <FormControl><Input placeholder="e.g., Wheat" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="variety" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variety</FormLabel>
                        <FormControl><Input placeholder="e.g., Winter Red" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="unit" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="ton">Ton</SelectItem>
                            <SelectItem value="bushel">Bushel</SelectItem>
                            <SelectItem value="head">Head</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="pricePerUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Unit (₹)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 200.00" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="location" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl><Input placeholder="e.g., California, USA" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <FormField control={form.control} name="harvestDate" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Harvest Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                 </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the quality of your crop." className="min-h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <SubmitButton />
              </div>
          </CardContent>
        </Card>
        </form>
      </Form>
    </div>
  );
}
