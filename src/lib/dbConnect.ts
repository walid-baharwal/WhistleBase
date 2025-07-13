import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to Database");
    return;
  }
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI environment variable is not defined");
    process.exit(1);
  }
  
  try {
    const db = await mongoose.connect(mongoUri.trim(), {});

    connection.isConnected = db.connections[0].readyState;
    console.log("Successfully connected to MongoDB");

    connection.isConnected = db.connections[0].readyState;
    console.log("Successfully connected to MongoDB");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Error connecting to Database:", error.message);
    } else {
      console.log("Error connecting to Database:", error);
    }
    process.exit(1);
  }
}

export default dbConnect;
