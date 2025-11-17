import type { TraceEvent, CropListing } from './types';

// This is now used for seeding the database
export const initialCrops: CropListing[] = [
  {
    id: '1',
    farmerId: 'farmer-1',
    farmerName: 'Green Valley Farms',
    cropType: 'Wheat',
    variety: 'Winter Red',
    quantity: 1000,
    unit: 'ton',
    pricePerUnit: 20000,
    currency: 'INR',
    location: 'California, USA',
    harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    listingDate: new Date().toISOString(),
    description: 'High-quality winter red wheat, perfect for baking.',
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    imageHint: 'wheat field'
  },
  {
    id: '2',
    farmerId: 'farmer-2',
    farmerName: 'Sunshine Acres',
    cropType: 'Corn',
    variety: 'Golden Bantam',
    quantity: 2500,
    unit: 'bushel',
    pricePerUnit: 14400,
    currency: 'INR',
    location: 'Iowa, USA',
    harvestDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    listingDate: new Date().toISOString(),
    description: 'Sweet and juicy Golden Bantam corn.',
    imageUrl: 'https://picsum.photos/seed/2/600/400',
    imageHint: 'corn field'
  },
  {
    id: '3',
    farmerId: 'farmer-3',
    farmerName: 'Harvest Moon Fields',
    cropType: 'Tomatoes',
    variety: 'Roma',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 280,
    currency: 'INR',
    location: 'Florida, USA',
    harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    listingDate: new Date().toISOString(),
    description: 'Firm and flavorful Roma tomatoes, ideal for sauces.',
    imageUrl: 'https://picsum.photos/seed/3/600/400',
    imageHint: 'ripe tomatoes'
  },
  {
    id: '4',
    farmerId: 'farmer-1',
    farmerName: 'Green Valley Farms',
    cropType: 'Carrots',
    variety: 'Danvers',
    quantity: 1200,
    unit: 'kg',
    pricePerUnit: 96,
    currency: 'INR',
    location: 'California, USA',
    harvestDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    listingDate: new Date().toISOString(),
    description: 'Crisp and sweet Danvers carrots.',
    imageUrl: 'https://picsum.photos/seed/4/600/400',
    imageHint: 'fresh carrots'
  },
  {
    id: '5',
    farmerId: 'farmer-2',
    farmerName: 'Sunshine Acres',
    cropType: 'Potatoes',
    variety: 'Russet',
    quantity: 5000,
    unit: 'kg',
    pricePerUnit: 64,
    currency: 'INR',
    location: 'Idaho, USA',
    harvestDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    listingDate: new Date().toISOString(),
    description: 'Starchy Russet potatoes, great for baking and frying.',
    imageUrl: 'https://picsum.photos/seed/5/600/400',
    imageHint: 'fresh potatoes'
  },
    {
    id: '6',
    farmerId: 'farmer-3',
    farmerName: 'Harvest Moon Fields',
    cropType: 'Lettuce',
    variety: 'Iceberg',
    quantity: 800,
    unit: 'head',
    pricePerUnit: 120,
    currency: 'INR',
    location: 'Arizona, USA',
    harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    listingDate: new Date().toISOString(),
    description: 'Crisp and refreshing Iceberg lettuce.',
    imageUrl: 'https://picsum.photos/seed/7/600/400',
    imageHint: 'lettuce'
  },
];


export const traceHistory: Record<string, TraceEvent[]> = {
    'A1B2C3D4E5': [
        { event: 'Planted', timestamp: new Date('2023-03-15T08:00:00Z').toISOString(), location: 'Field 4, Green Valley Farms', details: 'Seed Variety: Winter Red' },
        { event: 'Fertilized', timestamp: new Date('2023-05-20T10:00:00Z').toISOString(), location: 'Field 4, Green Valley Farms', details: 'Organic nutrient mix applied.' },
        { event: 'Harvested', timestamp: new Date('2023-08-01T14:30:00Z').toISOString(), location: 'Field 4, Green Valley Farms', details: 'Moisture content: 14%' },
        { event: 'Stored', timestamp: new Date('2023-08-01T18:00:00Z').toISOString(), location: 'Silo 2, Green Valley Farms', details: 'Temperature: 15°C' },
        { event: 'Shipped', timestamp: new Date('2023-08-05T09:00:00Z').toISOString(), location: 'Central Distribution Hub', details: 'Carrier: AgroTrans, Truck ID: T-123' },
        { event: 'Delivered', timestamp: new Date('2023-08-06T16:00:00Z').toISOString(), location: 'Buyer Warehouse, Cityville', details: 'Signed by: John Doe' }
    ]
}

    