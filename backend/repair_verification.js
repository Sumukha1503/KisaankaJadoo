import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const repairData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
        console.log('Connected to MongoDB');

        // Update Products
        const prodResult = await mongoose.connection.db.collection('products').updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: true } }
        );
        console.log(`Updated ${prodResult.modifiedCount} products`);

        // Update Vendor Listings
        const vendorResult = await mongoose.connection.db.collection('vendorlistings').updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: true } }
        );
        console.log(`Updated ${vendorResult.modifiedCount} vendor listings`);

        // Update Vehicles
        const vehicleResult = await mongoose.connection.db.collection('vehicles').updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: true } }
        );
        console.log(`Updated ${vehicleResult.modifiedCount} vehicles`);

        // Update Labourers
        const labourResult = await mongoose.connection.db.collection('labours').updateMany(
            { verified: { $exists: false } },
            { $set: { verified: true } }
        );
        console.log(`Updated ${labourResult.modifiedCount} labourers`);

        console.log('✅ Data Repair Complete');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Data Repair Failed:', err.message);
    }
};

repairData();
