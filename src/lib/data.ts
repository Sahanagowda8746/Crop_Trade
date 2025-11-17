import type { Crop, Auction, TraceEvent, CropListing } from './types';

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
    pricePerUnit: 250,
    currency: 'USD',
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
    pricePerUnit: 180,
    currency: 'USD',
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
    pricePerUnit: 3.5,
    currency: 'USD',
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
    pricePerUnit: 1.2,
    currency: 'USD',
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
    pricePerUnit: 0.8,
    currency: 'USD',
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
    pricePerUnit: 1.5,
    currency: 'USD',
    location: 'Arizona, USA',
    harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    listingDate: new Date().toISOString(),
    description: 'Crisp and refreshing Iceberg lettuce.',
    imageUrl: 'https://picsum.photos/seed/7/600/400',
    imageHint: 'lettuce'
  },
];


// MOCK DATA - This will be replaced by Firestore data
export const crops: Crop[] = [
  {
    id: '1',
    name: 'Wheat',
    variety: 'Winter Red',
    farmer: 'Green Valley Farms',
    price: 250,
    quantity: 1000,
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    imageHint: 'wheat field'
  },
  {
    id: '2',
    name: 'Corn',
    variety: 'Golden Bantam',
    farmer: 'Sunshine Acres',
    price: 180,
    quantity: 2500,
    imageUrl: 'https://picsum.photos/seed/2/600/400',
    imageHint: 'corn field'
  },
  {
    id: '3',
    name: 'Tomatoes',
    variety: 'Roma',
    farmer: 'Harvest Moon Fields',
    price: 3.5,
    quantity: 500,
    imageUrl: 'https://picsum.photos/seed/3/600/400',
    imageHint: 'ripe tomatoes'
  },
];


export const auctions: Auction[] = [
    {
        id: 'auc1',
        crop: crops[0],
        currentBid: 260,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        bidderCount: 5,
    },
    {
        id: 'auc2',
        crop: crops[2],
        currentBid: 4.0,
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        bidderCount: 12,
    },
]

export const traceHistory: Record<string, TraceEvent[]> = {
    'A1B2C3D4E5': [
        { event: 'Planted', timestamp: new Date('2023-03-15T08:00:00Z'), location: 'Field 4, Green Valley Farms', details: 'Seed Variety: Winter Red' },
        { event: 'Fertilized', timestamp: new Date('2023-05-20T10:00:00Z'), location: 'Field 4, Green Valley Farms', details: 'Organic nutrient mix applied.' },
        { event: 'Harvested', timestamp: new Date('2023-08-01T14:30:00Z'), location: 'Field 4, Green Valley Farms', details: 'Moisture content: 14%' },
        { event: 'Stored', timestamp: new Date('2023-08-01T18:00:00Z'), location: 'Silo 2, Green Valley Farms', details: 'Temperature: 15°C' },
        { event: 'Shipped', timestamp: new Date('2023-08-05T09:00:00Z'), location: 'Central Distribution Hub', details: 'Carrier: AgroTrans, Truck ID: T-123' },
        { event: 'Delivered', timestamp: new Date('2023-08-06T16:00:00Z'), location: 'Buyer Warehouse, Cityville', details: 'Signed by: John Doe' }
    ]
}
