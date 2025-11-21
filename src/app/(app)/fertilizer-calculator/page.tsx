
'use client';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Sparkles, Loader2, FlaskConical, Beaker, Leaf, Siren } from 'lucide-react';
import { handleFertilizerCalculation } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { FertilizerCalculatorOutput } from '@/ai/flows/fertilizer-calculator';

const formSchema = z.object({
  nitrogen: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Nitrogen cannot be negative.")),
  phosphorus: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Phosphorus cannot be negative.")),
  potassium: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Potassium cannot be negative.")),
  ph: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "pH must be between 0 and 14.").max(14)),
  soilType: z.string().min(1, "Please select a soil type."),
  targetCrop: z.string().min(2, "Please enter a target crop."),
});

type FormSchema = z.infer<typeof formSchema>;

export default function FertilizerCalculatorPage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<FertilizerCalculatorOutput | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      soilType: 'Loam',
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
      ph: undefined,
      targetCrop: '',
    },
  });
  
  const hasRun = useRef(false);

  useEffect(() => {
    setPageTitle('AI Fertilizer Calculator');
  }, [setPageTitle]);

  const onSubmit = async (data: FormSchema) => {
    setIsPending(true);
    setResult(null);
    hasRun.current = false;
    
     const { id } = toast({
      title: 'Calculating Plan...',
      description: 'The AI is generating your custom fertilizer plan. This may take a moment.',
    });

    try {
        const response = await handleFertilizerCalculation(data);
        if (response.data) {
          setResult(response.data);
          toast({ title: 'Plan Ready!', description: "Your custom fertilizer plan has been generated." });
        } else {
          toast({ variant: 'destructive', title: 'Calculation Failed', description: response.message.replace('error:', '') });
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'An Error Occurred', description: e.message || "Failed to get a response from the server." });
    } finally {
        setIsPending(false);
        hasRun.current = true;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Calculator className="text-primary" />
              AI Fertilizer Calculator
            </CardTitle>
            <CardDescription>
              Enter your soil test results and target crop to get a custom fertilizer plan from our AI agronomist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                      control={form.control}
                      name="targetCrop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Crop</FormLabel>
                          <FormControl><Input placeholder="e.g., Wheat" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="soilType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soil Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sandy">Sandy</SelectItem>
                              <SelectItem value="Loam">Loam</SelectItem>
                              <SelectItem value="Clay">Clay</SelectItem>
                              <SelectItem value="Silt">Silt</SelectItem>
                              <SelectItem value="Peat">Peat</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ph"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soil pH</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g., 6.8" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>

                <Separator/>
                <h3 className="text-lg font-medium">Nutrient Levels (kg/ha)</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <FormField
                      control={form.control}
                      name="nitrogen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nitrogen (N)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g., 45.5" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phosphorus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phosphorus (P)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g., 25.2" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="potassium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potassium (K)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g., 180.0" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Calculate Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <h2 className="font-headline text-2xl">Generated Fertilizer Plan</h2>
            {isPending && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Separator />
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Plan for {form.getValues('targetCrop')}</CardTitle>
                        <CardDescription>Based on your provided soil data, here is a custom plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-4"><FlaskConical className="text-primary"/>Recommendations</h3>
                            <div className="space-y-4">
                            {result.recommendations.map((rec, i) => (
                                <div key={i} className="p-4 rounded-lg bg-muted/50">
                                    <p className="font-bold text-primary">{rec.name} @ {rec.applicationRate}</p>
                                    <p className="text-sm"><span className="font-semibold">Timing:</span> {rec.timing}</p>
                                    <p className="text-sm text-muted-foreground italic mt-1">{rec.reason}</p>
                                </div>
                            ))}
                            </div>
                        </div>

                        {result.warnings && result.warnings.length > 0 && (
                            <div>
                                <h3 className="font-semibold flex items-center gap-2 mb-2"><Siren className="text-destructive"/>Warnings</h3>
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        <ul className="list-disc pl-4">
                                        {result.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><Leaf className="text-primary"/>General Advice</h3>
                            <p className="text-muted-foreground text-sm">{result.generalAdvice}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
             {!isPending && !result && (
                 <Card className="flex items-center justify-center py-20 text-center">
                    <CardContent className="pt-6">
                        <Beaker className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <p className="mt-4 text-muted-foreground">Your generated plan will appear here.</p>
                    </CardContent>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
