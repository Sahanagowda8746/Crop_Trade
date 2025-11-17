'use client';
import { useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, ScanSearch, GalleryHorizontal, TestTube } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'AI Soil Analysis',
    description: 'Upload a soil image to get instant crop and fertilizer recommendations.',
    href: '/soil-analysis',
    icon: Leaf,
  },
  {
    title: 'Professional Lab Test',
    description: 'Order a physical soil kit for a comprehensive, lab-accurate analysis.',
    href: '/soil-kit',
    icon: TestTube,
  },
  {
    title: 'AI Pest Detection',
    description: 'Identify crop pests and diseases from a photo and get treatment advice.',
    href: '/pest-detection',
    icon: ScanSearch,
  },
  {
    title: 'AI Marketing Suite',
    description: 'Generate marketing descriptions and images for your crop listings.',
    href: '/marketing-suite',
    icon: GalleryHorizontal,
  },
];

export default function AIToolsPage() {
  const { setPageTitle } = useAppContext();

  useEffect(() => {
    setPageTitle('AI & Lab Tools');
  }, [setPageTitle]);

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Farming Assistant</h1>
        <p className="text-muted-foreground">Leverage technology to optimize your farming practices.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map(tool => (
          <Link href={tool.href} key={tool.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
              <CardHeader className="flex-grow">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-md">
                    <tool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-headline text-xl">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

    