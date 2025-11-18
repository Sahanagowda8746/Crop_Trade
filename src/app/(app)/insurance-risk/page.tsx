
'use client';
import { useEffect, useState } from 'react';
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
import { ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { handleInsuranceRisk } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { InsuranceRiskOutput } from '@/ai/flows/insurance-risk-flow';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  cropType: z.string().min(2, "Please enter a crop type."),
  region: z.string().min(2, "Please enter a region."),
  acreage: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Acreage must be positive.")),
  historicalEvents: z.enum(['None', 'Rare', 'Occasional', 'Frequent']),
});

type FormSchema = z.infer<typeof formSchema>;

function scoreToColor(score: number): string {
    if (score <= 25) return 'text-green-500';
    if (score <= 50) return 'text-yellow-500';
    if (score <= 75) return 'text-orange-500';
    return 'text-destructive';
}

export default function InsuranceRiskPage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<InsuranceRiskOutput | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: 'Rice',
      region: 'Coastal Andhra Pradesh, India',
      acreage: undefined,
      historicalEvents: 'Occasional',
    },
  });

  useEffect(() => {
    setPageTitle('AI Insurance Risk Assessment');
  }, [setPageTitle]);
  
  const onSubmit = async (data: FormSchema) => {
    setIsPending(true);
    setResult(null);
    const response = await handleInsuranceRisk(data);
    if(response.data) {
      setResult(response.data);
      toast({ title: 'Assessment Ready!', description: "Your custom insurance risk profile is complete." });
    } else {
       toast({ variant: 'destructive', title: 'Assessment Failed', description: response.message.replace('error:', '') });
    }
    setIsPending(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              AI Insurance Risk Assessment
            </CardTitle>
            <CardDescription>
              Get an AI-powered risk assessment and estimated insurance premium for your crop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="cropType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Type</FormLabel>
                          <FormControl><Input placeholder="e.g., Rice" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Region</FormLabel>
                          <FormControl><Input placeholder="e.g., Coastal Andhra Pradesh" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="acreage" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Acreage</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField control={form.control} name="historicalEvents" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Extreme Weather History</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="None">None in last 5 years</SelectItem>
                                <SelectItem value="Rare">Rare (1-2 events in 5 years)</SelectItem>
                                <SelectItem value="Occasional">Occasional (3-4 events in 5 years)</SelectItem>
                                <SelectItem value="Frequent">Frequent (5+ events in 5 years)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Assess Risk
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <h2 className="font-headline text-2xl">Risk Profile</h2>
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

            {result && (
                <Card className="animate-in fade-in-50">
                    <CardHeader className="items-center text-center">
                        <CardDescription>Overall Risk Score</CardDescription>
                        <CardTitle className={`text-7xl font-bold ${scoreToColor(result.riskScore)}`}>{result.riskScore}</CardTitle>
                        <Progress value={result.riskScore} className="w-3/4 mx-auto" />
                        <p className={`font-semibold text-lg ${scoreToColor(result.riskScore)}`}>{result.riskLevel} Risk</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card className="text-center p-4">
                             <CardDescription>Estimated Premium</CardDescription>
                             <p className="text-2xl font-bold text-primary">{result.premiumEstimate}</p>
                        </Card>
                        
                        <Separator/>
                        
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">Key Risk Factors</h3>
                             <div className="space-y-2">
                                {result.riskFactors.map((rec, i) => (
                                    <div key={i} className="text-sm text-muted-foreground">
                                        <span className={`font-semibold ${rec.impact === 'Positive' ? 'text-green-600' : 'text-destructive'}`}>{rec.impact}:</span> {rec.reason}
                                    </div>
                                ))}
                            </div>
                        </div>

                         <div>
                            <h3 className="font-semibold mb-2 text-lg">Risk Mitigation Steps</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {result.mitigationSteps.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
             {!isPending && !result && (
                 <Card className="flex items-center justify-center py-20 text-center">
                    <CardContent className="pt-6">
                        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <p className="mt-4 text-muted-foreground">Your risk assessment will appear here.</p>
                    </CardContent>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
