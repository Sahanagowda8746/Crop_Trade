
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
import { LineChart, Sparkles, Loader2, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { handleDemandForecast } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { DemandForecastOutput } from '@/ai/flows/demand-forecast';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const formSchema = z.object({
  cropType: z.string().min(2, "Please enter a crop type."),
  region: z.string().min(2, "Please enter a region."),
  month: z.string().min(1, "Please select a month.").default(months[new Date().getMonth()]),
});

type FormSchema = z.infer<typeof formSchema>;

const initialState: {
    message: string;
    data: DemandForecastOutput | null;
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
      Forecast Demand
    </Button>
  );
}

function TrendIcon({ trend }: { trend: 'Increasing' | 'Decreasing' | 'Stable' }) {
    if (trend === 'Increasing') return <TrendingUp className="h-8 w-8 text-green-500" />;
    if (trend === 'Decreasing') return <TrendingDown className="h-8 w-8 text-destructive" />;
    return <Minus className="h-8 w-8 text-muted-foreground" />;
}


export default function DemandForecastPage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();
  
  const [state, formAction, isPending] = useActionState(handleDemandForecast, initialState);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: 'Wheat',
      region: 'Punjab, India',
      month: months[new Date().getMonth()],
    },
  });

  useEffect(() => {
    setPageTitle('AI Demand Forecast');
  }, [setPageTitle]);
  
  useEffect(() => {
    if (state.message.startsWith('error:')) {
      toast({ variant: 'destructive', title: 'Forecast Failed', description: state.message.replace('error:', '') });
    } else if (state.data) {
      toast({ title: 'Forecast Ready!', description: "Your custom demand forecast has been generated." });
    }
  }, [state, toast]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <LineChart className="text-primary" />
              AI Demand & Price Forecast
            </CardTitle>
            <CardDescription>
              Select a crop, region, and month to predict market demand and pricing trends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => formAction(data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="cropType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Type</FormLabel>
                          <FormControl><Input placeholder="e.g., Wheat" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Market Region</FormLabel>
                          <FormControl><Input placeholder="e.g., Punjab, India" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <FormField control={form.control} name="month" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a month" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
            <h2 className="font-headline text-2xl">Forecast Results</h2>
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
                        <CardTitle>Forecast for {form.getValues('cropType')} in {form.getValues('month')}</CardTitle>
                        <CardDescription>Market predictions for the {form.getValues('region')} region.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className='grid grid-cols-2 gap-4'>
                            <Card className="text-center p-4">
                                <CardDescription>Demand Trend</CardDescription>
                                <div className="flex justify-center items-center gap-2 mt-2">
                                    <TrendIcon trend={state.data.demand.trend} />
                                    <p className="text-2xl font-bold">{state.data.demand.trend}</p>
                                </div>
                            </Card>
                             <Card className="text-center p-4">
                                <CardDescription>Price Trend</CardDescription>
                                 <div className="flex justify-center items-center gap-2 mt-2">
                                    <TrendIcon trend={state.data.price.trend} />
                                    <p className="text-2xl font-bold">{state.data.price.trend}</p>
                                </div>
                            </Card>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">Analysis</h3>
                             <p className="text-sm text-muted-foreground">{state.data.analysis}</p>
                        </div>
                        
                        <Separator/>
                        
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2"><Info className="text-primary"/>Strategic Recommendations</h3>
                             <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
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
                        <LineChart className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <p className="mt-4 text-muted-foreground">Your demand forecast will appear here.</p>
                    </CardContent>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
