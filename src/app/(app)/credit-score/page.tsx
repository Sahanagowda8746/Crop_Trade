
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
import { CircleDollarSign, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { handleCreditScore } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { CreditScoreOutput } from '@/ai/flows/credit-score-flow';

const formSchema = z.object({
  annualRevenue: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Annual revenue must be a positive number.")),
  yearsFarming: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().int().min(0, "Years in farming cannot be negative.")),
  loanHistory: z.enum(['No Loans', 'Paid On Time', 'Minor Delays', 'Major Delays']),
  outstandingDebt: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Outstanding debt cannot be negative.")),
});

type FormSchema = z.infer<typeof formSchema>;

function scoreToColor(score: number): string {
    if (score >= 750) return 'text-green-500';
    if (score >= 650) return 'text-yellow-500';
    if (score >= 550) return 'text-orange-500';
    return 'text-destructive';
}

export default function CreditScorePage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<CreditScoreOutput | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualRevenue: undefined,
      yearsFarming: undefined,
      loanHistory: 'No Loans',
      outstandingDebt: undefined,
    },
  });

  useEffect(() => {
    setPageTitle('AI Credit Score Assessment');
  }, [setPageTitle]);
  
  const onSubmit = async (data: FormSchema) => {
    setIsPending(true);
    setResult(null);
    const response = await handleCreditScore(data);
    if (response.data) {
      setResult(response.data);
      toast({ title: 'Assessment Ready!', description: "Your credit score has been calculated." });
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
              <CircleDollarSign className="text-primary" />
              AI Credit Score Assessment
            </CardTitle>
            <CardDescription>
              Provide your farm's financial details to get an estimated credit score and improvement tips from our AI. This is a simulation and not a formal credit check.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="annualRevenue" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Farm Revenue (₹)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 500000" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="yearsFarming" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Farming</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="loanHistory" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Past Loan History</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select history" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="No Loans">No Past Loans</SelectItem>
                              <SelectItem value="Paid On Time">All Paid On Time</SelectItem>
                              <SelectItem value="Minor Delays">Minor Delays (less than 30 days)</SelectItem>
                              <SelectItem value="Major Delays">Major Delays (more than 30 days)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="outstandingDebt" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outstanding Debt (₹)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 100000" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Assess My Credit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <h2 className="font-headline text-2xl">Your Credit Assessment</h2>
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
                        <CardDescription>Your Estimated Credit Score</CardDescription>
                        <CardTitle className={`text-7xl font-bold ${scoreToColor(result.creditScore)}`}>{result.creditScore}</CardTitle>
                        <Progress value={(result.creditScore - 300) / 5.5} className="w-3/4 mx-auto" />
                        <p className={`font-semibold text-lg ${scoreToColor(result.creditScore)}`}>{result.riskLevel} Risk</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Separator/>
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">Financial Analysis</h3>
                             <p className="text-sm text-muted-foreground">{result.analysis}</p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">Recommendations for Improvement</h3>
                             <ul className="space-y-2">
                                {result.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
             {!isPending && !result && (
                 <Card className="flex items-center justify-center py-20 text-center">
                    <CardContent className="pt-6">
                        <CircleDollarSign className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <p className="mt-4 text-muted-foreground">Your credit assessment will appear here.</p>
                    </CardContent>
                </Card>
             )}
        </div>
      </div>
    </div>
  );
}
