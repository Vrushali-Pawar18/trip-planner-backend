import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    joinTrip,
    leaveTrip,
    getCreatedTrips,
    getJoinedTrips,
    getUpcomingTrips,
    getPastTrips
} from '../controllers/tripController';

const router = express.Router();

// Public routes
router.get('/', getTrips);
router.get('/:id', getTripById);

// Protected routes
router.post('/', protect, createTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.post('/:id/join', protect, joinTrip);
router.post('/:id/leave', protect, leaveTrip);

// User Dashboard routes
// Note: These must come before /:id routes if they were at the root level, 
// but since they are specific paths, they are fine. 
// However, /user/created matches /:id if :id can be "user". 
// MongoDB ObjectIds are hex strings, "user" is not a valid ObjectId usually, 
// but to be safe and follow express routing, specific routes should come before parameterized routes.
// So I will move these UP.

const routerOrdered = express.Router();

// Dashboard routes (specific paths)
routerOrdered.get('/user/created', protect, getCreatedTrips);
routerOrdered.get('/user/joined', protect, getJoinedTrips);
routerOrdered.get('/user/upcoming', protect, getUpcomingTrips);
routerOrdered.get('/user/past', protect, getPastTrips);

// General routes
routerOrdered.get('/', getTrips);
routerOrdered.post('/', protect, createTrip);

// Parameterized routes (should be last)
routerOrdered.get('/:id', getTripById);
routerOrdered.put('/:id', protect, updateTrip);
routerOrdered.delete('/:id', protect, deleteTrip);
routerOrdered.post('/:id/join', protect, joinTrip);
routerOrdered.post('/:id/leave', protect, leaveTrip);

export default routerOrdered;
