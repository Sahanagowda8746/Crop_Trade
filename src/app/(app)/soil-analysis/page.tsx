'use client';
import { useEffect, useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/app-context';
import { handleSoilAnalysis } from '@/app/actions';
import { Leaf, FlaskConical, Lightbulb, Sprout, Upload, Sparkles, Droplets, Microscope, TestTube, CheckCircle, Trees, Scale } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { SoilAnalysisFromImageOutput } from '@/ai/flows/soil-analysis-from-image';

const initialState: {
    message: string;
    errors?: any;
    data?: SoilAnalysisFromImageOutput | null;
} = {
  message: '',
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
       {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
        </>
       ) : (
        <>
          <Leaf className="mr-2 h-4 w-4" /> Analyze Soil Image
        </>
      )}
    </Button>
  );
}

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function NutrientMeter({ level }: { level: 'Low' | 'Moderate' | 'High' }) {
    const levelMap = {
        'Low': { value: 25, color: 'bg-red-500' },
        'Moderate': { value: 60, color: 'bg-yellow-500' },
        'High': { value: 90, color: 'bg-green-500' },
    }
    return <Progress value={levelMap[level].value} indicatorClassName={levelMap[level].color} />
}


function ResultsDisplay({ data, imagePreview }: { data: SoilAnalysisFromImageOutput, imagePreview: string }) {
    return (
        <Card className="shadow-md animate-in fade-in-50">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
                <CardDescription>The AI has analyzed your soil image and generated the following report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Image src={imagePreview} alt="Analyzed soil" width={400} height={400} className="rounded-lg object-cover w-full aspect-square" />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2"><Scale className="text-muted-foreground" />Fertility Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-primary">{data.fertilityScore}<span className="text-lg font-normal text-muted-foreground">/100</span></p>
                                <Progress value={data.fertilityScore} className="mt-2" />
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2"><Trees className="text-muted-foreground" />Soil Type</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <p className="text-2xl font-semibold">{data.soilType}</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2"><Droplets className="text-muted-foreground" />Moisture</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <p className="text-2xl font-semibold">{data.moisture}</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2"><Microscope className="text-muted-foreground" />Texture</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <p className="text-2xl font-semibold">{data.texture}</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2"><TestTube className="text-muted-foreground" />pH Estimate</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <p className="text-2xl font-semibold">{data.phEstimate.toFixed(1)}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <FlaskConical className="text-primary" /> Nutrient Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-medium">Nitrogen</p>
                                <p className="text-sm text-muted-foreground">{data.nutrientAnalysis.nitrogen}</p>
                            </div>
                            <NutrientMeter level={data.nutrientAnalysis.nitrogen} />
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-medium">Phosphorus</p>
                                <p className="text-sm text-muted-foreground">{data.nutrientAnalysis.phosphorus}</p>
                            </div>
                             <NutrientMeter level={data.nutrientAnalysis.phosphorus} />
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-medium">Potassium</p>
                                <p className="text-sm text-muted-foreground">{data.nutrientAnalysis.potassium}</p>
                            </div>
                             <NutrientMeter level={data.nutrientAnalysis.potassium} />
                        </div>
                    </div>
                </div>
                
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                            <Sprout className="text-primary" /> Recommended Crops
                        </h3>
                        <ul className="space-y-2">
                           {data.recommendedCrops.map(crop => (
                               <li key={crop} className="flex items-center gap-2 text-muted-foreground">
                                   <CheckCircle className="h-4 w-4 text-green-500" />
                                   <span>{crop}</span>
                               </li>
                           ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                            <Lightbulb className="text-primary" /> Fertilizer Plan & Advice
                        </h3>
                        <p className="text-muted-foreground font-semibold mb-2">{data.generalAdvice}</p>
                         <ul className="space-y-2">
                           {data.fertilizerPlan.map(plan => (
                               <li key={plan} className="flex items-start gap-2 text-muted-foreground">
                                   <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                   <span>{plan}</span>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SoilAnalysisPage() {
  const { setPageTitle } = useAppContext();
  const [state, formAction] = useFormState(handleSoilAnalysis, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { pending } = useFormStatus();

  useEffect(() => {
    setPageTitle('AI Soil Analysis');
  }, [setPageTitle]);

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
    } else {
      setPreview(null);
    }
  };
  
  useEffect(() => {
    if(state.message && state.message !== 'Analysis complete.') {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.message.replace('error:', ''),
      });
    } else if (state.data) {
      toast({
        title: 'Analysis Complete',
        description: 'Your soil report is ready.',
      });
    }
  }, [state, toast]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb className="text-primary" />
            AI-Powered Soil Analysis
          </CardTitle>
          <CardDescription>
            Upload an image of your soil (max 4MB), and our AI will analyze its properties to provide a detailed report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
             <div className="space-y-2">
                <label htmlFor="photo" className="font-medium">Upload Soil Photo</label>
                <div className="flex gap-2">
                    <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-grow">
                        <Upload className="mr-2"/>
                        Choose File
                    </Button>
                </div>
                <input type="hidden" name="photoDataUri" value={preview || ''} />
             </div>

            {preview && (
              <div className="relative w-full h-64 rounded-md overflow-hidden border bg-muted">
                <Image src={preview} alt="Soil sample preview" fill className="object-contain" />
              </div>
            )}

            {state.errors?.photoDataUri && (
              <p className="text-sm font-medium text-destructive">{state.errors.photoDataUri[0]}</p>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {pending && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis in Progress</CardTitle>
            <CardDescription>The AI is analyzing your soil image. This may take a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="md:col-span-1 w-full aspect-square" />
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      {state.data && preview && (
        <ResultsDisplay data={state.data} imagePreview={preview} />
      )}
    </div>
  );
}
