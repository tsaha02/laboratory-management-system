import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import {
  uploadReport,
  getMyReports,
  getAllReports,
  getReportByAppointment,
  downloadReport,
  updateRemarks,
} from '../controllers/report.controller';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `report-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const router = Router();

// All routes require authentication
router.use(protect);

// Patient: own reports
router.get('/my', getMyReports);

// Admin/Tech: all reports
router.get('/', authorize('admin', 'technician'), getAllReports);

// Auth'd user: get report for a specific appointment
router.get('/appointment/:appointmentId', getReportByAppointment);

// Auth'd user: download report file
router.get('/appointment/:appointmentId/download', downloadReport);

// Admin/Tech: upload report for an appointment
router.post(
  '/:appointmentId',
  authorize('admin', 'technician'),
  upload.single('file'),
  uploadReport
);

// Admin/Tech: update doctor remarks
router.put('/:id', authorize('admin', 'technician'), updateRemarks);

export default router;
