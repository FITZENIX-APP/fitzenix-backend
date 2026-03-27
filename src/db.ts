import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ConnectedDb =()=>{
    if (process.env.NODE_ENV === 'test') {
        return
    }

    const URI = process.env.MongoURI;

    if (!URI) {
        console.error("❌ MongoDB URI is missing!");
        process.exit(1);
    }
    
    console.log("🟡 Attempting to connect to MongoDB...");
    
    mongoose.connect(URI, {
        serverSelectionTimeoutMS: 5000, // Wait 5 seconds before timing out
        socketTimeoutMS: 45000, // Increase socket timeout
    })
    .then(() => console.log("✅ DB connected successfully"))
    .catch((err) => {
        console.error("❌ Error connecting to DB:", err);
        process.exit(1);
    });
}

export default ConnectedDb;
