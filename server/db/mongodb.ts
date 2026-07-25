import mongoose from 'mongoose';

export interface MongoStatus {
  isConnected: boolean;
  readyState: number;
  host?: string;
  name?: string;
}

let isConnecting = false;

/**
 * Connects to MongoDB using Mongoose and configures event listeners.
 */
export async function connectMongoDB(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('[MongoDB] MONGODB_URI environment variable is not defined. Operating with fallback storage engine.');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    console.log('[MongoDB] Connection already active.');
    return true;
  }

  if (isConnecting) {
    console.log('[MongoDB] Connection attempt already in progress...');
    return false;
  }

  isConnecting = true;

  // Setup Mongoose connection event listeners once
  if (mongoose.connection.listeners('connected').length === 0) {
    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected successfully to host: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error occurred:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Connection re-established.');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('[MongoDB] Connection closed through app termination (SIGINT).');
      }
    });

    process.on('SIGTERM', async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('[MongoDB] Connection closed through app termination (SIGTERM).');
      }
    });
  }

  try {
    console.log('[MongoDB] Initiating connection to MongoDB cluster...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    isConnecting = false;
    return true;
  } catch (err: any) {
    isConnecting = false;
    console.error('[MongoDB] Initial connection failed:', err.message);
    return false;
  }
}

/**
 * Disconnects from MongoDB.
 */
export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[MongoDB] Successfully disconnected from MongoDB.');
  }
}

/**
 * Returns current MongoDB connection status.
 */
export function getMongoStatus(): MongoStatus {
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1,
    readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}
