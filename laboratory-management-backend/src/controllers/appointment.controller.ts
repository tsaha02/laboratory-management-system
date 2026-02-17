import { Request, Response } from 'express';
import { CustomRequest } from '../../types/express';
import Appointment from '../models/appointment.model';

// All time slots: 30-min intervals from 08:00 to 17:00
const ALL_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = (i % 2) * 30;
  const startH = String(hour).padStart(2, '0');
  const startM = String(min).padStart(2, '0');
  const endMin = min + 30;
  const endH = endMin >= 60 ? String(hour + 1).padStart(2, '0') : startH;
  const endM = String(endMin % 60).padStart(2, '0');
  return `${startH}:${startM}-${endH}:${endM}`;
});

// GET /api/appointments — Admin/Tech: all appointments
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.findAll();
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching appointments.' });
  }
};

// GET /api/appointments/my — Authenticated: own appointments
export const getMyAppointments = async (req: CustomRequest, res: Response) => {
  try {
    const appointments = await Appointment.findByUserId(req.user!.userId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching your appointments.' });
  }
};

// GET /api/appointments/slots/:date — Available slots for a date
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const bookedRows = await Appointment.getBookedSlots(date);
    const bookedSlots = bookedRows.map((r: any) => r.time_slot);
    const available = ALL_SLOTS.map((slot) => ({
      slot,
      available: !bookedSlots.includes(slot),
    }));
    res.status(200).json(available);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching available slots.' });
  }
};

// GET /api/appointments/technicians — List technicians for assignment
export const getTechnicians = async (req: Request, res: Response) => {
  try {
    const technicians = await Appointment.getTechnicians();
    res.status(200).json(technicians);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching technicians.' });
  }
};

// GET /api/appointments/:id — Single appointment
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(parseInt(req.params.id));
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching appointment.' });
  }
};

// POST /api/appointments — Patient: book appointment
export const bookAppointment = async (req: CustomRequest, res: Response) => {
  try {
    const { test_id, appointment_date, time_slot } = req.body;

    if (!test_id || !appointment_date || !time_slot) {
      return res.status(400).json({
        message: 'test_id, appointment_date, and time_slot are required.',
      });
    }

    if (!ALL_SLOTS.includes(time_slot)) {
      return res.status(400).json({ message: 'Invalid time slot.' });
    }

    // Check if slot is already booked
    const bookedRows = await Appointment.getBookedSlots(appointment_date);
    const bookedSlots = bookedRows.map((r: any) => r.time_slot);
    if (bookedSlots.includes(time_slot)) {
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }

    const appointment = await Appointment.create({
      user_id: req.user!.userId,
      test_id,
      appointment_date,
      time_slot,
    });

    res.status(201).json({ message: 'Appointment booked!', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error booking appointment.' });
  }
};

// PUT /api/appointments/:id — Admin/Tech: update status, assign tech, add notes
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Appointment.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const { status, technician_id, notes } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (technician_id !== undefined) updateData.technician_id = technician_id;
    if (notes !== undefined) updateData.notes = notes;

    const appointment = await Appointment.update(id, updateData);
    res.status(200).json({ message: 'Appointment updated!', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating appointment.' });
  }
};

// DELETE /api/appointments/:id — Admin: delete
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Appointment.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    await Appointment.delete(id);
    res.status(200).json({ message: 'Appointment deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting appointment.' });
  }
};
