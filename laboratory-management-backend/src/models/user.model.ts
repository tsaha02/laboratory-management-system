import db from '../db';

const User = {
  findAll: () => {
    return db('users').select('*');
  },
  findById: (id: number) => {
    return db('users').where({ id }).first();
  },
  findByEmail: (email: string) => {
    return db('users').where({ email }).first();
  },
  create: (user: any) => {
    return db('users').insert(user).returning('*');
  },
};

export default User;
