'use client';
import { useEffect, useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/app-context';
import { handleSoilAnalysis } from '@/app/actions';
import { Leaf, FlaskConical, Lightbulb, Sprout, Upload, Sparkles, Droplets, Microscope, TestTube, CheckCircle, Trees, Scale, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { SoilAnalysisFromImageOutput } from '@/lib/types';
import { useRouter } from 'next/navigation';

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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
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


export default function SoilAnalysisPage() {
  const { setPageTitle } = useAppContext();
  const [state, formAction] = useActionState(handleSoilAnalysis, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

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
    if (state.message) {
      if (state.message.startsWith('error:')) {
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: state.message.replace('error:', ''),
        });
      } else if (state.message === 'Analysis complete.') {
          toast({
            title: 'Analysis Complete!',
            description: 'Your new soil report has been saved. Redirecting you to your test history.',
          });
          // Redirect to the page where they can see the results
          router.push('/my-soil-tests');
      }
    }
  }, [state, toast, router]);
  
  const { pending } = useFormStatus();

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

      {/* The results are no longer displayed on this page directly */}
    </div>
  );
}
