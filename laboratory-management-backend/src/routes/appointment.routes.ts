import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import {
  getAllAppointments,
  getMyAppointments,
  getAvailableSlots,
  getTechnicians,
  getAppointmentById,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointment.controller';

const router = Router();

// --- Authenticated routes (all need protect) ---

// Patient: view own appointments
router.get('/my', protect, getMyAppointments);

// Any authenticated: check available slots for a date
router.get('/slots/:date', protect, getAvailableSlots);

// Admin/Tech: list all technicians (for assignment dropdown)
router.get('/technicians', protect, authorize('admin', 'technician'), getTechnicians);

// Admin/Tech: view all appointments
router.get('/', protect, authorize('admin', 'technician'), getAllAppointments);

// Any authenticated: view single appointment
router.get('/:id', protect, getAppointmentById);

// Patient: book a new appointment
router.post('/', protect, authorize('patient'), bookAppointment);

// Admin/Tech: update appointment (status, technician, notes)
router.put('/:id', protect, authorize('admin', 'technician'), updateAppointment);

// Admin: delete appointment
router.delete('/:id', protect, authorize('admin'), cancelAppointment);

export default router;
