import { Request, Response } from 'express';
import Trip from '../models/Trip';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req: AuthRequest, res: Response) => {
    try {
        const { name, location, startDate, endDate, description, maxParticipants, tags, itinerary, images } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const trip = await Trip.create({
            hostId: req.user._id,
            name,
            location,
            startDate,
            endDate,
            description,
            maxParticipants,
            tags,
            itinerary,
            images,
            participants: [] // Host is not automatically added to participants array based on plan logic, but usually they are part of the trip. Plan says "Join Trip (Adds current user to participants)". Host is separate field.
        });

        res.status(201).json(trip);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
export const getTrips = async (req: Request, res: Response) => {
    try {
        const { search, tags, startDate, endDate } = req.query;

        let query: any = {};

        if (search) {
            query.$text = { $search: search as string };
        }

        if (tags) {
            query.tags = { $in: (tags as string).split(',') };
        }

        if (startDate) {
            query.startDate = { $gte: new Date(startDate as string) };
        }

        if (endDate) {
            query.endDate = { $lte: new Date(endDate as string) };
        }

        // Only show open trips by default or all? Plan says "Explore". Usually upcoming trips.
        // Let's return all for now, maybe filter by status if needed.

        const trips = await Trip.find(query).populate('hostId', 'name avatar');

        res.json(trips);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public
export const getTripById = async (req: Request, res: Response) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('hostId', 'name avatar bio')
            .populate('participants', 'name avatar bio');

        if (trip) {
            res.json(trip);
        } else {
            res.status(404).json({ message: 'Trip not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (Host only)
export const updateTrip = async (req: AuthRequest, res: Response) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.hostId.toString() !== req.user?._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this trip' });
        }

        const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(updatedTrip);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Host only)
export const deleteTrip = async (req: AuthRequest, res: Response) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.hostId.toString() !== req.user?._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this trip' });
        }

        await trip.deleteOne();

        res.json({ message: 'Trip removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join trip
// @route   POST /api/trips/:id/join
// @access  Private
export const joinTrip = async (req: AuthRequest, res: Response) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Validation
        if (trip.hostId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Host cannot join their own trip as a participant' });
        }

        if (trip.participants.some(p => p.toString() === req.user!._id.toString())) {
            return res.status(400).json({ message: 'Already joined this trip' });
        }

        if (trip.participants.length >= trip.maxParticipants) {
            return res.status(400).json({ message: 'Trip is full' });
        }

        // Check if trip is open
        if (trip.status !== 'open') {
            return res.status(400).json({ message: 'Trip is not open for joining' });
        }

        trip.participants.push(req.user._id);

        // Update status if full
        if (trip.participants.length >= trip.maxParticipants) {
            trip.status = 'full';
        }

        await trip.save();

        res.json({ message: 'Joined trip successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Leave trip
// @route   POST /api/trips/:id/leave
// @access  Private
export const leaveTrip = async (req: AuthRequest, res: Response) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        if (!trip.participants.some(p => p.toString() === req.user!._id.toString())) {
            return res.status(400).json({ message: 'Not a participant of this trip' });
        }

        trip.participants = trip.participants.filter(
            (participantId) => participantId.toString() !== req.user!._id.toString()
        );

        // If it was full, set back to open
        if (trip.status === 'full' && trip.participants.length < trip.maxParticipants) {
            trip.status = 'open';
        }

        await trip.save();

        res.json({ message: 'Left trip successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user created trips
// @route   GET /api/trips/user/created
// @access  Private
export const getCreatedTrips = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const trips = await Trip.find({ hostId: req.user._id }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user joined trips
// @route   GET /api/trips/user/joined
// @access  Private
export const getJoinedTrips = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const trips = await Trip.find({
            participants: { $in: [req.user._id] },
            hostId: { $ne: req.user._id }
        }).populate('hostId', 'name avatar');
        res.json(trips);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user upcoming trips
// @route   GET /api/trips/user/upcoming
// @access  Private
export const getUpcomingTrips = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const trips = await Trip.find({
            $or: [{ hostId: req.user._id }, { participants: { $in: [req.user._id] } }],
            startDate: { $gt: new Date() }
        }).sort({ startDate: 1 }).populate('hostId', 'name avatar');
        res.json(trips);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user past trips
// @route   GET /api/trips/user/past
// @access  Private
export const getPastTrips = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        const trips = await Trip.find({
            $or: [{ hostId: req.user._id }, { participants: { $in: [req.user._id] } }],
            endDate: { $lt: new Date() }
        }).sort({ endDate: -1 }).populate('hostId', 'name avatar');
        res.json(trips);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
