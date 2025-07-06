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
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    connection.isConnected = db.connections[0].readyState;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Error connecting to Database", error.message);
    } else {
      console.log("Error connecting to Database", error);
    }
    process.exit(1);
  }
}

export default dbConnect;
