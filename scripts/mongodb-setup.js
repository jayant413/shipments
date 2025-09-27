// MongoDB Setup Script
// This script helps set up the MongoDB database and collections

const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipment_db';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(process.env.MONGODB_DB_NAME || 'shipment_db');
    
    // Create shipments collection
    const shipmentsCollection = db.collection('shipments');
    
    // Create indexes for better performance
    await shipmentsCollection.createIndex({ shipment_id: 1 });
    await shipmentsCollection.createIndex({ order_id: 1 });
    await shipmentsCollection.createIndex({ created_at: -1 });
    await shipmentsCollection.createIndex({ status: 1 });
    
    console.log('MongoDB setup completed successfully');
    console.log('Indexes created for shipments collection');
    
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
  } finally {
    await client.close();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupMongoDB();
}

module.exports = { setupMongoDB };
