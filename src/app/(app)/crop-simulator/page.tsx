'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Bot, Sparkles, Loader2, Calendar, Droplets, Leaf, Cloudy, Bug, LineChart, DollarSign, CheckCircle } from 'lucide-react';
import { handleCropSimulation } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { CropSimulatorOutput } from '@/ai/flows/crop-simulator-flow';

const formSchema = z.object({
  cropType: z.string().min(2, "Crop type is required."),
  acreage: z.coerce.number().positive("Acreage must be positive."),
  region: z.string().min(2, "Region is required."),
  simulationMonths: z.coerce.number().int().min(1).max(24),
  fertilizerPlan: z.enum(["Standard NPK", "Organic Compost", "Minimal Application"]),
  wateringSchedule: z.enum(["Automated (Optimal)", "Twice a week", "Rain-fed only"]),
  weatherScenario: z.enum(["Normal", "Drought", "Excessive Rain"]),
  pestScenario: z.enum(["None", "Minor Infestation", "Major Outbreak"]),
});

type FormSchema = z.infer<typeof formSchema>;

export default function CropSimulatorPage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<CropSimulatorOutput | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: 'Wheat',
      acreage: 10,
      region: 'Punjab, India',
      simulationMonths: 6,
      fertilizerPlan: "Standard NPK",
      wateringSchedule: "Automated (Optimal)",
      weatherScenario: "Normal",
      pestScenario: "None",
    },
  });

  useEffect(() => {
    setPageTitle('AI Crop Simulator');
  }, [setPageTitle]);

  const onSubmit = async (data: FormSchema) => {
    setIsPending(true);
    setResult(null);
    toast({
      title: 'Starting Simulation...',
      description: 'The AI is running a multi-month forecast. This may take some time.',
    });
    const response = await handleCropSimulation(data);
    if (response.data) {
      setResult(response.data);
      toast({ title: 'Simulation Complete!', description: "Your farm's digital twin forecast is ready." });
    } else {
      toast({ variant: 'destructive', title: 'Simulation Failed', description: response.message.replace('error:', '') });
    }
    setIsPending(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Bot className="text-primary" />
              Digital Twin Simulator
            </CardTitle>
            <CardDescription>
              Configure the parameters for your farm field and run a multi-season simulation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField control={form.control} name="cropType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop</FormLabel>
                      <FormControl><Input placeholder="e.g., Wheat" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="acreage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acreage</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="simulationMonths" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simulation Duration (Months)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 6" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="region" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl><Input placeholder="e.g., Punjab, India" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator/>
                 <h3 className="text-lg font-medium">Scenarios</h3>

                 <FormField control={form.control} name="fertilizerPlan" render={({ field }) => (
                    <FormItem>
                      <FormLabel><Leaf className="inline h-4 w-4 mr-1"/>Fertilizer Plan</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Standard NPK">Standard NPK</SelectItem>
                            <SelectItem value="Organic Compost">Organic Compost</SelectItem>
                            <SelectItem value="Minimal Application">Minimal Application</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="wateringSchedule" render={({ field }) => (
                    <FormItem>
                      <FormLabel><Droplets className="inline h-4 w-4 mr-1"/>Watering Schedule</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Automated (Optimal)">Automated (Optimal)</SelectItem>
                            <SelectItem value="Twice a week">Twice a week</SelectItem>
                            <SelectItem value="Rain-fed only">Rain-fed only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="weatherScenario" render={({ field }) => (
                    <FormItem>
                      <FormLabel><Cloudy className="inline h-4 w-4 mr-1"/>Weather Scenario</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Drought">Drought</SelectItem>
                            <SelectItem value="Excessive Rain">Excessive Rain</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="pestScenario" render={({ field }) => (
                    <FormItem>
                      <FormLabel><Bug className="inline h-4 w-4 mr-1"/>Pest Scenario</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Minor Infestation">Minor Infestation</SelectItem>
                            <SelectItem value="Major Outbreak">Major Outbreak</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Run Simulation
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <h2 className="font-headline text-2xl">Simulation Results</h2>
          {isPending && (
            <Card>
              <CardContent className="pt-6 grid grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="animate-in fade-in-50 space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-xl">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                       <Card className="p-4">
                           <CardDescription>Predicted Yield</CardDescription>
                           <p className="text-2xl font-bold text-primary">{result.summary.predictedYield}</p>
                       </Card>
                        <Card className="p-4">
                           <CardDescription>Est. Net Revenue</CardDescription>
                           <p className="text-2xl font-bold text-primary">{result.summary.estimatedRevenue}</p>
                       </Card>
                        <Card className="p-4">
                           <CardDescription>Return on Investment (ROI)</CardDescription>
                           <p className="text-2xl font-bold text-primary">{result.summary.roi}%</p>
                       </Card>
                  </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Visual Timeline</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {result.timeline.map((stage, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="relative w-full aspect-video">
                        <Image src={stage.imageUrl} alt={stage.description} fill className="object-cover" />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">Month {stage.month}</CardTitle>
                        <CardDescription>{stage.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
              
              <Card>
                  <CardHeader>
                      <CardTitle className="text-xl">AI Strategy Analysis Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Executive Summary</h4>
                        <p className="text-sm text-muted-foreground">{result.analysis.executiveSummary}</p>
                    </div>
                     <Separator/>
                     <div>
                        <h4 className="font-semibold mb-2">Risk & Opportunity Analysis</h4>
                        <p className="text-sm text-muted-foreground">{result.analysis.riskOpportunityAnalysis}</p>
                    </div>
                     <Separator/>
                     <div>
                        <h4 className="font-semibold mb-2">Comparative Analysis</h4>
                        <p className="text-sm text-muted-foreground">{result.analysis.comparativeAnalysis}</p>
                    </div>
                     <Separator/>
                     <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                           {result.analysis.recommendations.map((rec, i) => (
                               <li key={i} className="flex items-start gap-3">
                                   <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                   <span className="text-sm text-muted-foreground">{rec}</span>
                               </li>
                           ))}
                       </ul>
                    </div>
                  </CardContent>
              </Card>

            </div>
          )}

          {!isPending && !result && (
            <Card className="flex items-center justify-center py-20 text-center">
              <CardContent className="pt-6">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Your simulation results will appear here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
