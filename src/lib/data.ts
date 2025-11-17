import type { Crop, Auction, TraceEvent } from './types';

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
  {
    id: '4',
    name: 'Carrots',
    variety: 'Danvers',
    farmer: 'Green Valley Farms',
    price: 1.2,
    quantity: 1200,
    imageUrl: 'https://picsum.photos/seed/4/600/400',
    imageHint: 'fresh carrots'
  },
  {
    id: '5',
    name: 'Potatoes',
    variety: 'Russet',
    farmer: 'Sunshine Acres',
    price: 0.8,
    quantity: 5000,
    imageUrl: 'https://picsum.photos/seed/5/600/400',
    imageHint: 'fresh potatoes'
  },
    {
    id: '6',
    name: 'Lettuce',
    variety: 'Iceberg',
    farmer: 'Harvest Moon Fields',
    price: 1.5,
    quantity: 800,
    imageUrl: 'https://picsum.photos/seed/7/600/400',
    imageHint: 'lettuce'
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
    {
        id: 'auc3',
        crop: crops[4],
        currentBid: 0.85,
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
        bidderCount: 8,
    }
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
