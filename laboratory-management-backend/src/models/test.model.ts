import db from '../db';

interface TestData {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

const Test = {
  findAll: () => {
    return db('tests').select('*').orderBy('name');
  },

  findById: (id: number) => {
    return db('tests').where({ id }).first();
  },

  create: (data: TestData) => {
    return db('tests').insert(data).returning('*');
  },

  update: (id: number, data: Partial<TestData>) => {
    return db('tests').where({ id }).update(data).returning('*');
  },

  delete: (id: number) => {
    return db('tests').where({ id }).del();
  },
};

export default Test;
