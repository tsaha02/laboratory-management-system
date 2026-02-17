import db from '../db';

const Report = {
  findByAppointmentId: async (appointmentId: number) => {
    return db('reports')
      .join('appointments', 'reports.appointment_id', 'appointments.id')
      .join('tests', 'appointments.test_id', 'tests.id')
      .join('users as uploader', 'reports.uploaded_by', 'uploader.id')
      .where('reports.appointment_id', appointmentId)
      .select(
        'reports.*',
        'tests.name as test_name',
        'uploader.full_name as uploaded_by_name'
      )
      .first();
  },

  findByUserId: async (userId: number) => {
    return db('reports')
      .join('appointments', 'reports.appointment_id', 'appointments.id')
      .join('tests', 'appointments.test_id', 'tests.id')
      .join('users as uploader', 'reports.uploaded_by', 'uploader.id')
      .where('appointments.user_id', userId)
      .select(
        'reports.*',
        'appointments.appointment_date',
        'appointments.time_slot',
        'tests.name as test_name',
        'uploader.full_name as uploaded_by_name'
      )
      .orderBy('reports.created_at', 'desc');
  },

  findAll: async () => {
    return db('reports')
      .join('appointments', 'reports.appointment_id', 'appointments.id')
      .join('tests', 'appointments.test_id', 'tests.id')
      .join('users as patient', 'appointments.user_id', 'patient.id')
      .join('users as uploader', 'reports.uploaded_by', 'uploader.id')
      .select(
        'reports.*',
        'appointments.appointment_date',
        'appointments.time_slot',
        'tests.name as test_name',
        'patient.full_name as patient_name',
        'uploader.full_name as uploaded_by_name'
      )
      .orderBy('reports.created_at', 'desc');
  },

  findById: async (id: number) => {
    return db('reports').where({ id }).first();
  },

  create: async (data: {
    appointment_id: number;
    file_path: string;
    file_name: string;
    mime_type: string;
    doctor_remarks?: string;
    uploaded_by: number;
  }) => {
    const [report] = await db('reports').insert(data).returning('*');
    return report;
  },

  update: async (
    id: number,
    data: { doctor_remarks?: string }
  ) => {
    const [report] = await db('reports')
      .where({ id })
      .update(data)
      .returning('*');
    return report;
  },

  delete: async (id: number) => {
    return db('reports').where({ id }).del();
  },
};

export default Report;
