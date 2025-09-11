import db from '../db';

const Patient = {
  findAll: () => {
    return db('patients').select('*');
  },
  findById: (id: number) => {
    return db('patients').where({ id }).first();
  },
  findByEmail: (email: string) => {
    return db('patients').where({ email }).first();
  },
  create: (patient: any) => {
    return db('patients').insert(patient).returning('*');
  },
};

export default Patient;
