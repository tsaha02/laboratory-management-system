import { Request, Response } from 'express';
import { CustomRequest } from '../../types/express';
import Report from '../models/report.model';
import Appointment from '../models/appointment.model';
import path from 'path';
import fs from 'fs';

// POST /api/reports/:appointmentId — Upload report (admin/tech)
export const uploadReport = async (req: CustomRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Check if a report already exists for this appointment
    const existing = await Report.findByAppointmentId(appointmentId);
    if (existing) {
      // Delete old file
      if (fs.existsSync(existing.file_path)) {
        fs.unlinkSync(existing.file_path);
      }
      await Report.delete(existing.id);
    }

    const report = await Report.create({
      appointment_id: appointmentId,
      file_path: req.file.path,
      file_name: req.file.originalname,
      mime_type: req.file.mimetype,
      doctor_remarks: req.body.doctor_remarks || null,
      uploaded_by: req.user!.userId,
    });

    // Mark appointment as completed when report is uploaded
    await Appointment.update(appointmentId, { status: 'completed' });

    res.status(201).json({ message: 'Report uploaded!', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error uploading report.' });
  }
};

// GET /api/reports/my — Patient: own reports
export const getMyReports = async (req: CustomRequest, res: Response) => {
  try {
    const reports = await Report.findByUserId(req.user!.userId);
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching your reports.' });
  }
};

// GET /api/reports — Admin/Tech: all reports
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await Report.findAll();
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching reports.' });
  }
};

// GET /api/reports/appointment/:appointmentId — Get report for an appointment
export const getReportByAppointment = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const report = await Report.findByAppointmentId(appointmentId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Patients can only see their own reports
    if (req.user!.role === 'patient') {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment.user_id !== req.user!.userId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
    }

    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching report.' });
  }
};

// GET /api/reports/appointment/:appointmentId/download — Download report file
export const downloadReport = async (req: CustomRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const report = await Report.findByAppointmentId(appointmentId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Patients can only download their own reports
    if (req.user!.role === 'patient') {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment.user_id !== req.user!.userId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
    }

    const filePath = path.resolve(report.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Report file not found on server.' });
    }

    res.setHeader('Content-Type', report.mime_type);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.file_name}"`
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error downloading report.' });
  }
};

// PUT /api/reports/:id — Update doctor remarks (admin/tech)
export const updateRemarks = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Report.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    const { doctor_remarks } = req.body;
    const report = await Report.update(id, { doctor_remarks });
    res.status(200).json({ message: 'Remarks updated!', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating remarks.' });
  }
};
