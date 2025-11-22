
'use client';
import { useEffect, useActionState, useState, useRef, useTransition, startTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { handleCropDescription } from '@/app/actions';
import { PlusCircle, Sparkles, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

const listingSchema = z.object({
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

const aiDescriptionInitialState: {
  message: string;
  errors: any;
  data: {description: string} | null;
} = {
  message: '',
  errors: null,
  data: null,
};

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function GenerateDescriptionButton({ onClick, disabled }: { onClick: () => void; disabled: boolean; }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={disabled}>
      {disabled ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Generate with AI
    </Button>
  );
}

export default function NewListingPage() {
  const { setPageTitle } = useAppContext();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiState, formAction, isAiPending] = useActionState(handleCropDescription, aiDescriptionInitialState);

  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      unit: 'kg',
      cropType: '',
      variety: '',
      description: '',
      harvestDate: '',
      location: '',
      imageUrl: '',
      pricePerUnit: 0,
      quantity: 0,
    },
  });
  
  useEffect(() => {
    setPageTitle('Create New Crop Listing');
  }, [setPageTitle]);
  
  useEffect(() => {
    if (aiState.data?.description) {
      form.setValue('description', aiState.data.description);
      toast({ title: "Description Generated!", description: "The AI has written a description for your crop." });
    }
    if (aiState.message && aiState.message.startsWith('error:')) {
      toast({ variant: 'destructive', title: "AI Error", description: aiState.message.replace('error:', '') });
    }
  }, [aiState, form, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) {
          toast({
              variant: 'destructive',
              title: 'File Too Large',
              description: 'Please upload an image smaller than 4MB.',
          });
          return;
      }
      const dataUri = await fileToDataUri(file);
      setPreview(dataUri);
      form.setValue('imageUrl', dataUri);
    } else {
      setPreview(null);
      form.setValue('imageUrl', undefined);
    }
  };

  const handleGenerateDescription = () => {
    const formData = new FormData();
    const cropData = form.getValues();
    formData.append('cropName', cropData.cropType || 'Crop');
    formData.append('variety', cropData.variety || 'Standard');
    formData.append('growingConditions', 'Grown using standard organic farming practices.'); // Placeholder
    formData.append('yield', `${cropData.quantity || 0} ${cropData.unit}`);
    formData.append('uniqueQualities', 'Fresh and locally sourced.'); // Placeholder
    
    startTransition(() => {
      formAction(formData);
    });
  };

  async function onSubmit(values: z.infer<typeof listingSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a listing.',
      });
      return;
    }

    toast({ title: 'Creating Listing...', description: 'Your new crop listing is being submitted.' });

    const newListingsCollection = collection(firestore, 'cropListings');
    const newListing = {
      ...values,
      farmerId: user.uid,
      farmerName: user.displayName || 'Anonymous Farmer',
      listingDate: new Date().toISOString(),
      currency: 'INR',
    };
    
    try {
      await addDocumentNonBlocking(newListingsCollection, newListing);
      toast({ title: 'Listing Created!', description: 'Your crop is now available on the marketplace.' });
      router.push('/market');
    } catch (e) {
      // The non-blocking update will handle permission errors via the global listener
      console.error(e);
       toast({ variant: 'destructive', title: 'Submission Error', description: 'An unexpected error occurred.' });
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <PlusCircle className="text-primary" />
            New Crop Listing
          </CardTitle>
          <CardDescription>
            Fill out the form below to add your crop to the marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-8">
               <div>
                  <FormLabel>Crop Image</FormLabel>
                  <div className="mt-2 flex items-center gap-4">
                     <div className="relative w-32 h-32 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                        {preview ? (
                            <Image src={preview} alt="Crop preview" fill className="object-cover" />
                        ) : (
                            <span className="text-xs text-muted-foreground">Image Preview</span>
                        )}
                    </div>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4"/>
                        Upload Image
                    </Button>
                    <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type</FormLabel>
                      <FormControl><Input placeholder="e.g., Wheat" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="variety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variety</FormLabel>
                      <FormControl><Input placeholder="e.g., Winter Red" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
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
                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Unit (₹)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 200.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input placeholder="e.g., California, USA" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="harvestDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Harvest Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
               </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Description</FormLabel>
                        <GenerateDescriptionButton onClick={handleGenerateDescription} disabled={isAiPending} />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the quality, condition, and any other relevant details about your crop."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A great description helps attract buyers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" size="lg" className="w-full">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Listing
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
      </form>
    </div>
  );
}
