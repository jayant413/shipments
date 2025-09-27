# MongoDB Migration Guide

This document outlines the migration from Supabase to MongoDB for the shipment management system.

## Changes Made

### 1. Database Configuration
- **New file**: `lib/mongodb.ts` - MongoDB connection and collection management
- **Updated**: `lib/server.ts` and `lib/client.ts` - Replaced Supabase client with MongoDB-compatible interface
- **Updated**: `lib/shipment-service.ts` - Direct MongoDB operations using native driver

### 2. API Routes Conversion
All API routes have been converted from Supabase to MongoDB:

- **GET** `/api/shipments` - Fetch all shipments with sorting
- **POST** `/api/shipments` - Create single shipment
- **PUT** `/api/shipments/[id]` - Update shipment by ID
- **DELETE** `/api/shipments/[id]` - Delete shipment by ID
- **POST** `/api/shipments/bulk` - Bulk create shipments

### 3. Key Changes in Data Handling

#### ID Management
- **Before**: Used Supabase's auto-generated UUIDs
- **After**: Using MongoDB's ObjectId with string conversion for API compatibility

#### Data Structure
- **Before**: Snake_case field names (shipment_id, order_id, etc.)
- **After**: Maintained snake_case for consistency, added created_at timestamp

#### Error Handling
- **Before**: Supabase error objects
- **After**: Native MongoDB error handling with proper HTTP status codes

## Environment Setup

### Required Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/shipment_db
MONGODB_DB_NAME=shipment_db
```

### For MongoDB Atlas (Cloud)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shipment_db?retryWrites=true&w=majority
```

## Database Setup

### 1. Install Dependencies
```bash
npm install mongodb
```

### 2. Run Setup Script
```bash
node scripts/mongodb-setup.js
```

### 3. Create Indexes
The setup script creates the following indexes for optimal performance:
- `shipment_id` (ascending)
- `order_id` (ascending) 
- `created_at` (descending)
- `status` (ascending)

## Data Migration (if needed)

If you have existing data in Supabase, you'll need to migrate it. Here's a sample migration script:

```javascript
// Example migration script
const { MongoClient } = require('mongodb');

async function migrateData() {
  // Connect to MongoDB
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db(process.env.MONGODB_DB_NAME);
  const collection = db.collection('shipments');

  // Your existing Supabase data
  const supabaseData = [
    // ... your data here
  ];

  // Transform and insert data
  const transformedData = supabaseData.map(item => ({
    ...item,
    created_at: new Date(item.created_at || new Date())
  }));

  await collection.insertMany(transformedData);
  console.log('Migration completed');
}
```

## API Compatibility

The API endpoints maintain the same interface, so no changes are needed in the frontend components. The response format remains consistent:

```json
{
  "data": [
    {
      "_id": "ObjectId",
      "shipment_id": "string",
      "order_id": "string",
      "item_id": "string",
      "sku_id": "string",
      "reason": "string",
      "aging": "number",
      "receiving_date": "Date",
      "photos_received": "boolean",
      "status": "string",
      "checked": "boolean",
      "created_at": "Date"
    }
  ]
}
```

## Performance Considerations

1. **Connection Pooling**: MongoDB driver handles connection pooling automatically
2. **Indexes**: Created indexes for commonly queried fields
3. **Sorting**: Using MongoDB's native sort for better performance
4. **Bulk Operations**: Using `insertMany` for bulk operations

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure MongoDB is running and URI is correct
2. **ObjectId Errors**: Make sure to convert string IDs to ObjectId for queries
3. **Index Errors**: Run the setup script to create required indexes

### Debug Mode
Set `NODE_ENV=development` for detailed MongoDB connection logging.

## Next Steps

1. Update your environment variables
2. Run the MongoDB setup script
3. Test all API endpoints
4. Deploy with MongoDB Atlas or local MongoDB instance

The migration maintains full API compatibility while providing the flexibility and performance benefits of MongoDB.
