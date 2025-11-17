
'use client';
import { useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, FlaskConical, Package, TestTube, Truck, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const features = [
    "Professional lab analysis of N, P, K, pH, and organic matter.",
    "Personalized fertilizer and crop recommendations.",
    "Digital report accessible anytime on the AgriLink platform.",
    "Easy-to-use sample collection and mail-in kit."
];

const instructions = [
    "Collect around 200-300g of soil.",
    "Take samples from 5-10 random points in the area.",
    "Sample from a depth of 0-15cm.",
    "Ensure the soil is air-dried before packing.",
    "Do not mix any fertilizer or extra water.",
    "Use only the provided container and seal it tightly.",
    "Attach the unique QR code label to the container.",
    "Place the sealed container in the provided zip-lock bag.",
    "Insert the completed submission form into the package.",
    "Ship the sample using the pre-paid return pouch."
];

const requirements = [
    { parameter: 'Soil Weight', requirement: '200-300g', compliant: true },
    { parameter: 'Moisture', requirement: '<10% (air dried)', compliant: true },
    { parameter: 'Container', requirement: 'Provided one only', compliant: true },
    { parameter: 'Sun Drying', requirement: 'Not allowed', compliant: false },
    { parameter: 'Water Added', requirement: 'Not allowed', compliant: false },
    { parameter: 'Foreign Material', requirement: 'None (stones, roots)', compliant: false },
];


export default function SoilKitPage() {
    const { setPageTitle } = useAppContext();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        setPageTitle('Professional Soil Test Kit');
    }, [setPageTitle]);

    const handleBuyNow = async () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'You are not logged in',
                description: 'Please log in to purchase a soil kit.',
            });
            return;
        }

        toast({
            title: 'Processing Order...',
            description: 'Please wait while we create your order.',
        });

        const newOrder = {
            userId: user.uid,
            status: 'ordered' as const,
            orderDate: new Date().toISOString(),
            trackingId: null,
            soilKitQr: `SK-${user.uid.slice(0, 5)}-${Date.now()}`,
            labReportUrl: null,
        };

        const ordersCollection = collection(firestore, 'soilKitOrders');
        await addDocumentNonBlocking(ordersCollection, newOrder);

        toast({
            title: 'Order Placed!',
            description: 'Your Soil Test Kit has been ordered successfully.',
        });

        router.push('/my-soil-tests');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
             <Card className="overflow-hidden shadow-lg">
                <div className="grid md:grid-cols-2">
                    <div className="p-8 flex flex-col justify-center">
                        <CardHeader className="p-0">
                             <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                <FlaskConical className="text-primary"/>
                                AgriLink Soil Test Kit
                            </CardTitle>
                            <CardDescription className="text-lg pt-2">
                                Get precise, lab-accurate results for your soil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-6">
                            <ul className="space-y-3">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-4xl font-bold mt-6 text-primary">₹3999</p>
                            <p className="text-sm text-muted-foreground">Includes shipping and all lab fees.</p>
                            <Button onClick={handleBuyNow} size="lg" className="w-full mt-6">Buy Now</Button>
                        </CardContent>
                    </div>
                     <div className="relative min-h-[300px] md:min-h-0">
                         <Image
                            src="https://picsum.photos/seed/soilkit/800/800"
                            alt="Soil Test Kit"
                            fill
                            className="object-cover"
                            data-ai-hint="soil test kit"
                        />
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-8 text-center">
                     <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                            <Package className="h-8 w-8" />
                        </div>
                        <p className="font-semibold">1. Order Your Kit</p>
                        <p className="text-sm text-muted-foreground">We ship a complete soil collection kit to your address.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                            <Truck className="h-8 w-8" />
                        </div>
                        <p className="font-semibold">2. Collect & Ship</p>
                        <p className="text-sm text-muted-foreground">Follow the simple instructions to collect your soil and mail it back using the pre-paid return pouch.</p>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                            <TestTube className="h-8 w-8" />
                        </div>
                        <p className="font-semibold">3. Get Your Report</p>
                        <p className="text-sm text-muted-foreground">Our lab analyzes your sample and you get a notification when your detailed report is ready on your dashboard.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Sample Collection & Shipping Instructions</CardTitle>
                    <CardDescription>Follow these instructions carefully to ensure an accurate lab analysis.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        {instructions.map((instruction, i) => (
                             <li key={i} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{instruction}</span>
                            </li>
                        ))}
                    </div>
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Requirement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requirements.map(req => (
                                    <TableRow key={req.parameter}>
                                        <TableCell className="font-medium">{req.parameter}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {req.compliant ? <Check className="h-4 w-4 text-green-500"/> : <XCircle className="h-4 w-4 text-destructive"/>}
                                            {req.requirement}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
