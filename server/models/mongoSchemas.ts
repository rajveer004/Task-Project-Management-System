import mongoose, { Schema, Document } from 'mongoose';

// Board Schema
export interface IBoardDoc extends Document {
  id: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  members: Array<{ userId: string; role: string }>;
  columns: Array<{ id: string; boardId: string; title: string; color: string; position: number; limit?: number }>;
  createdAt: string;
  updatedAt: string;
}

const BoardSchema = new Schema<IBoardDoc>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  isPrivate: { type: Boolean, default: false },
  members: [
    {
      userId: { type: String, required: true },
      role: { type: String, default: 'Member' }
    }
  ],
  columns: [
    {
      id: { type: String, required: true },
      boardId: { type: String, required: true },
      title: { type: String, required: true },
      color: { type: String, default: '#3B82F6' },
      position: { type: Number, required: true },
      limit: { type: Number }
    }
  ],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

// Task Schema
export interface ITaskDoc extends Document {
  id: string;
  boardId: string;
  listId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  tags: string[];
  assignees: string[];
  dueDate: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: Array<{ id: string; title: string; completed: boolean; estimatedHours?: number }>;
  position: number;
  createdAt: string;
  updatedAt: string;
}

const TaskSchema = new Schema<ITaskDoc>({
  id: { type: String, required: true, unique: true },
  boardId: { type: String, required: true },
  listId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  tags: [{ type: String }],
  assignees: [{ type: String }],
  dueDate: { type: String, default: '' },
  startDate: { type: String, default: '' },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  subtasks: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      completed: { type: Boolean, default: false },
      estimatedHours: { type: Number, default: 0 }
    }
  ],
  position: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

// User Schema
export interface IUserDoc extends Document {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Member' | 'Guest';
  department: string;
}

const UserSchema = new Schema<IUserDoc>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['Admin', 'Member', 'Guest'], default: 'Member' },
  department: { type: String, default: 'Engineering' }
}, { strict: false });

export const MongoBoard = mongoose.model<IBoardDoc>('Board', BoardSchema);
export const MongoTask = mongoose.model<ITaskDoc>('Task', TaskSchema);
export const MongoUser = mongoose.model<IUserDoc>('User', UserSchema);

// MongoDB connection initialization helper
export async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('[Database] MONGODB_URI environment variable not defined. Using persistent disk/in-memory store.');
    return false;
  }
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Database] Connected successfully to MongoDB instance!');
    return true;
  } catch (err: any) {
    console.warn('[Database] Could not connect to MongoDB:', err.message);
    return false;
  }
}
