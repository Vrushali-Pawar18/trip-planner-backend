import mongoose, { Schema, Document } from 'mongoose';

export interface IItineraryItem {
    day: string;
    time?: string;
    title: string;
    description: string;
}

export interface ITrip extends Document {
    hostId: mongoose.Types.ObjectId;
    name: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description: string;
    maxParticipants: number;
    participants: mongoose.Types.ObjectId[];
    tags: string[];
    itinerary: IItineraryItem[];
    status: 'open' | 'full' | 'completed' | 'cancelled';
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ItineraryItemSchema = new Schema({
    day: { type: String, required: true },
    time: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true }
});

const TripSchema: Schema = new Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    maxParticipants: {
        type: Number,
        required: true,
        min: 1
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String
    }],
    itinerary: [ItineraryItemSchema],
    status: {
        type: String,
        enum: ['open', 'full', 'completed', 'cancelled'],
        default: 'open'
    },
    images: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for faster searching
TripSchema.index({ location: 'text', name: 'text', tags: 'text' });

export default mongoose.model<ITrip>('Trip', TripSchema);
