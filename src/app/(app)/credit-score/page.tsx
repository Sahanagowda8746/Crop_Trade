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
import { CircleDollarSign, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { handleCreditScore } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { CreditScoreOutput } from '@/ai/flows/credit-score-flow';

const formSchema = z.object({
  annualRevenue: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Annual revenue must be a positive number.")),
  yearsFarming: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().int().min(0, "Years in farming cannot be negative.")),
  loanHistory: z.string().min(1, "Please select your loan history."),
  outstandingDebt: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Outstanding debt cannot be negative.")),
});

type FormSchema = z.infer<typeof formSchema>;

const initialState: {
    message: string;
    data: CreditScoreOutput | null;
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
      Assess My Credit
    </Button>
  );
}

function scoreToColor(score: number): string {
    if (score >= 750) return 'text-green-500';
    if (score >= 650) return 'text-yellow-500';
    if (score >= 550) return 'text-orange-500';
    return 'text-destructive';
}

export default function CreditScorePage() {
  const { setPageTitle } = useAppContext();
  const { toast } = useToast();
  
  const [state, formAction, isPending] = useActionState(handleCreditScore, initialState);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanHistory: 'No Loans',
    },
  });

  useEffect(() => {
    setPageTitle('AI Credit Score Assessment');
  }, [setPageTitle]);
  
  useEffect(() => {
    if (state.message.startsWith('error:')) {
      toast({ variant: 'destructive', title: 'Assessment Failed', description: state.message.replace('error:', '') });
    } else if (state.data) {
      toast({ title: 'Assessment Ready!', description: "Your credit score has been calculated." });
    }
  }, [state, toast]);

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
              <form action={formAction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="annualRevenue" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Farm Revenue (₹)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 500000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="yearsFarming" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Farming</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
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
                          <FormControl><Input type="number" placeholder="e.g., 100000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                <SubmitButton />
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

            {state.data && (
                <Card className="animate-in fade-in-50">
                    <CardHeader className="items-center text-center">
                        <CardDescription>Your Estimated Credit Score</CardDescription>
                        <CardTitle className={`text-7xl font-bold ${scoreToColor(state.data.creditScore)}`}>{state.data.creditScore}</CardTitle>
                        <Progress value={(state.data.creditScore - 300) / 5.5} className="w-3/4 mx-auto" />
                        <p className={`font-semibold text-lg ${scoreToColor(state.data.creditScore)}`}>{state.data.riskLevel} Risk</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Separator/>
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">Financial Analysis</h3>
                             <p className="text-sm text-muted-foreground">{state.data.analysis}</p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">Recommendations for Improvement</h3>
                             <ul className="space-y-2">
                                {state.data.recommendations.map((rec, i) => (
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
             {!isPending && !state.data && (
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
