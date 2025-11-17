'use client';
import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { AreaChart, Sparkles, Loader2, CheckCircle, XCircle, Minus } from 'lucide-react';
import { handleYieldPrediction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { YieldPredictionOutput } from '@/ai/flows/yield-prediction';

const formSchema = z.object({
  cropType: z.string().min(2, "Please enter a crop type."),
  acreage: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Acreage must be a positive number.")),
  soilType: z.string().min(1, "Please select a soil type."),
  nitrogenLevel: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Nitrogen cannot be negative.")),
  phosphorusLevel: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Phosphorus cannot be negative.")),
  potassiumLevel: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Potassium cannot be negative.")),
  region: z.string().min(2, "Region is required."),
  historicalYield: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

const initialState: {
    message: string;
    data: YieldPredictionOutput | null;
    errors?: any;
} = {
  message: '',
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
      Predict Yield
    </Button>
  );
}

function FactorIcon({ impact }: { impact: 'Positive' | 'Negative' | 'Neutral' }) {
    if (impact === 'Positive') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (impact === 'Negative') return <XCircle className="h-5 w-5 text-destructive" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
}

export default function YieldPredictionPage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();
  
  const [state, formAction, isPending] = useActionState(handleYieldPrediction, initialState);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      soilType: 'Loam'
    },
  });

  useEffect(() => {
    setPageTitle('AI Yield Prediction');
  }, [setPageTitle]);
  
  useEffect(() => {
    if (state.message.startsWith('error:')) {
      toast({ variant: 'destructive', title: 'Prediction Failed', description: state.message.replace('error:', '') });
    } else if (state.data) {
      toast({ title: 'Prediction Ready!', description: "Your custom yield forecast has been generated." });
    }
  }, [state, toast]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <AreaChart className="text-primary" />
              AI Yield Prediction
            </CardTitle>
            <CardDescription>
              Provide details about your crop and field to get a data-driven yield forecast from our AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form action={formAction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="cropType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Type</FormLabel>
                          <FormControl><Input placeholder="e.g., Corn" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="acreage" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Acreage</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="soilType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soil Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl>
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
                     <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geographical Region</FormLabel>
                          <FormControl><Input placeholder="e.g., Punjab, India" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>

                <Separator/>
                <h3 className="text-lg font-medium">Soil Nutrients (kg/ha)</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <FormField control={form.control} name="nitrogenLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nitrogen (N)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g., 45.5" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="phosphorusLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phosphorus (P)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g., 25.2" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="potassiumLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potassium (K)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g., 180.0" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <FormField control={form.control} name="historicalYield" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Historical Yield (Optional)</FormLabel>
                          <FormControl><Input placeholder="e.g., 4.5 tons/acre" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <SubmitButton />
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <h2 className="font-headline text-2xl">Prediction Results</h2>
            {isPending && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <Skeleton className="h-12 w-1/2" />
                        <Skeleton className="h-8 w-1/3" />
                         <Separator/>
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            )}

            {state.data && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Forecast for {form.getValues('cropType')}</CardTitle>
                        <CardDescription>Based on your provided data, here is a custom yield prediction.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className='grid grid-cols-2 gap-4'>
                            <Card className="text-center">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-primary text-3xl font-bold">{state.data.predictedYield}</CardTitle>
                                    <CardDescription>Total Estimated Yield</CardDescription>
                                </CardHeader>
                            </Card>
                             <Card className="text-center">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-primary text-3xl font-bold">{state.data.yieldPerAcre}</CardTitle>
                                    <CardDescription>Estimated Yield per Acre</CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium">Confidence Score: {state.data.confidenceScore}%</p>
                            <Progress value={state.data.confidenceScore} className="mt-2" />
                        </div>
                        
                        <Separator/>
                        
                        <div>
                            <h3 className="font-semibold mb-4">Key Influencing Factors</h3>
                             <div className="space-y-4">
                                {state.data.influencingFactors.map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                        <FactorIcon impact={item.impact} />
                                        <div>
                                            <p className="font-semibold">{item.factor}</p>
                                            <p className="text-sm text-muted-foreground">{item.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                         <div>
                            <h3 className="font-semibold mb-2">Recommendations</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {state.data.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
             {!isPending && !state.data && (
                 <Card className="flex items-center justify-center py-20 text-center">
                    <CardContent className="pt-6">
                        <AreaChart className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <p className="mt-4 text-muted-foreground">Your generated prediction will appear here.</p>
                    </CardContent>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
