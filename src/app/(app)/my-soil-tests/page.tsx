'use client';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import type { SoilAnalysis, SoilKitOrder } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TestTube, FlaskConical, Bot, CheckCircle, Clock, Package, Truck, Upload } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

function SoilAnalysisCard({ report }: { report: SoilAnalysis }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Bot className="text-primary"/> AI Analysis Report
                    </CardTitle>
                    <Badge variant="secondary">AI</Badge>
                </div>
                <CardDescription>
                    Analysis from {new Date(report.analysisDate).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-sm font-medium text-muted-foreground">Soil Type</p>
                    <p className="font-semibold">{report.soilType}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-muted-foreground">Fertility</p>
                    <p className="font-semibold">{report.fertilityScore} / 100</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-muted-foreground">pH Estimate</p>
                    <p className="font-semibold">{report.phEstimate}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-muted-foreground">Moisture</p>
                    <p className="font-semibold">{report.moisture}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function SoilKitOrderCard({ order, role }: { order: SoilKitOrder, role: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const statusIcons = {
        ordered: <Package className="w-4 h-4 mr-2" />,
        shipped: <Truck className="w-4 h-4 mr-2" />,
        received: <CheckCircle className="w-4 h-4 mr-2" />,
        processing: <FlaskConical className="w-4 h-4 mr-2 animate-pulse" />,
        completed: <CheckCircle className="w-4 h-4 mr-2 text-green-500" />,
    }
    
    const handleUploadReport = () => {
        if (!firestore) return;
        toast({ title: 'Simulating Upload...', description: 'Updating order status to completed and adding report URL.'});
        const orderRef = doc(firestore, 'soilKitOrders', order.id);
        updateDocumentNonBlocking(orderRef, {
            status: 'completed',
            labReportUrl: 'https://example.com/sample-lab-report.pdf' // Placeholder URL
        });
        toast({ title: 'Report "Uploaded"!', description: 'The farmer can now view their report.'});
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                     <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <TestTube className="text-primary"/> Soil Test Kit
                    </CardTitle>
                    <Badge variant="default">Lab</Badge>
                </div>
                 <CardDescription>
                    Ordered on {new Date(order.orderDate).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                    {statusIcons[order.status]}
                    <p className="font-semibold capitalize">{order.status}</p>
                </div>
                {order.status === 'shipped' && order.trackingId && (
                     <p className="text-sm text-muted-foreground">
                        Tracking ID: <span className="font-mono text-primary">{order.trackingId}</span>
                    </p>
                )}
                 {order.status === 'completed' && order.labReportUrl ? (
                    <Button asChild size="sm">
                        <Link href={order.labReportUrl} target="_blank">View Lab Report</Link>
                    </Button>
                ) : role === 'Admin' && order.status === 'processing' ? (
                     <Button size="sm" variant="secondary" onClick={handleUploadReport}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Report
                    </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}

export default function MySoilTestsPage() {
    const { setPageTitle, role } = useAppContext();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        setPageTitle('My Soil Tests');
    }, [setPageTitle]);

    const aiReportsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/soilAnalyses`), orderBy('analysisDate', 'desc'));
    }, [user, firestore]);

    const kitOrdersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        // Admins should see all orders to manage them
        if (role === 'Admin') {
            return query(collection(firestore, 'soilKitOrders'), orderBy('orderDate', 'desc'));
        }
        return query(collection(firestore, 'soilKitOrders'), where('userId', '==', user.uid), orderBy('orderDate', 'desc'));
    }, [user, firestore, role]);

    const { data: aiReports, isLoading: isLoadingAiReports } = useCollection<SoilAnalysis>(aiReportsQuery);
    const { data: kitOrders, isLoading: isLoadingKitOrders } = useCollection<SoilKitOrder>(kitOrdersQuery);

    const isLoading = isUserLoading || isLoadingAiReports || isLoadingKitOrders;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">My Soil Tests</CardTitle>
                    <CardDescription>View your AI-driven soil analyses and track your physical soil kit orders. {role === 'Admin' && <span className="font-bold text-primary">(Admin View)</span>}</CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="ai-reports">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai-reports">AI Analysis History</TabsTrigger>
                    <TabsTrigger value="kit-orders">Soil Kit Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="ai-reports" className="space-y-4">
                    {isLoading && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <Skeleton className="h-48" />
                            <Skeleton className="h-48" />
                        </div>
                    )}
                    {!isLoading && aiReports?.length === 0 && (
                        <Card className="text-center py-12">
                             <CardHeader>
                                <CardTitle>No AI Reports</CardTitle>
                                <CardDescription>You haven't performed any AI soil analyses yet.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild>
                                    <Link href="/ai-tools">Run First Analysis</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                        {aiReports?.map(report => <SoilAnalysisCard key={report.id} report={report} />)}
                    </div>
                </TabsContent>
                <TabsContent value="kit-orders" className="space-y-4">
                     {isLoading && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <Skeleton className="h-48" />
                            <Skeleton className="h-48" />
                        </div>
                    )}
                    {!isLoading && kitOrders?.length === 0 && (
                        <Card className="text-center py-12">
                            <CardHeader>
                                <CardTitle>No Soil Kit Orders</CardTitle>
                                <CardDescription>Purchase a soil kit for a professional lab analysis.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Button asChild>
                                    <Link href="/soil-kit">Order a Kit</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                        {kitOrders?.map(order => <SoilKitOrderCard key={order.id} order={order} role={role}/>)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
