import db from '../db';

const Appointment = {
  findAll: async () => {
    return db('appointments')
      .join('users as patient', 'appointments.user_id', 'patient.id')
      .join('tests', 'appointments.test_id', 'tests.id')
      .leftJoin('users as tech', 'appointments.technician_id', 'tech.id')
      .select(
        'appointments.*',
        'patient.full_name as patient_name',
        'patient.email as patient_email',
        'tests.name as test_name',
        'tests.price as test_price',
        'tech.full_name as technician_name'
      )
      .orderBy('appointments.appointment_date', 'desc')
      .orderBy('appointments.time_slot', 'asc');
  },

  findByUserId: async (userId: number) => {
    return db('appointments')
      .join('tests', 'appointments.test_id', 'tests.id')
      .leftJoin('users as tech', 'appointments.technician_id', 'tech.id')
      .where('appointments.user_id', userId)
      .select(
        'appointments.*',
        'tests.name as test_name',
        'tests.price as test_price',
        'tech.full_name as technician_name'
      )
      .orderBy('appointments.appointment_date', 'desc')
      .orderBy('appointments.time_slot', 'asc');
  },

  findById: async (id: number) => {
    return db('appointments')
      .join('users as patient', 'appointments.user_id', 'patient.id')
      .join('tests', 'appointments.test_id', 'tests.id')
      .leftJoin('users as tech', 'appointments.technician_id', 'tech.id')
      .where('appointments.id', id)
      .select(
        'appointments.*',
        'patient.full_name as patient_name',
        'patient.email as patient_email',
        'tests.name as test_name',
        'tests.price as test_price',
        'tech.full_name as technician_name'
      )
      .first();
  },

  create: async (data: {
    user_id: number;
    test_id: number;
    appointment_date: string;
    time_slot: string;
  }) => {
    const [appointment] = await db('appointments').insert(data).returning('*');
    return appointment;
  },

  update: async (
    id: number,
    data: {
      status?: string;
      technician_id?: number | null;
      notes?: string;
    }
  ) => {
    const [appointment] = await db('appointments')
      .where({ id })
      .update(data)
      .returning('*');
    return appointment;
  },

  delete: async (id: number) => {
    return db('appointments').where({ id }).del();
  },

  getBookedSlots: async (date: string) => {
    return db('appointments')
      .where({ appointment_date: date })
      .whereNot({ status: 'cancelled' })
      .select('time_slot');
  },

  getTechnicians: async () => {
    return db('users')
      .where({ role: 'technician' })
      .select('id', 'full_name', 'email');
  },
};

export default Appointment;
