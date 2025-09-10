const bcrypt = require('bcryptjs');

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries in these tables
  await knex('tests').del();
  await knex('patients').del();

  // Hashes the password before inserting
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Inserts seed for patients table
  await knex('patients').insert([
    {
      full_name: 'John Doe',
      email: 'john.doe@test.com',
      password: hashedPassword,
      phone_number: '123-456-7890',
    },
  ]);

  // Inserts seed for tests table
  await knex('tests').insert([
    {
      name: 'Complete Blood Count (CBC)',
      description: 'Measures different components of your blood.',
      price: 75.5,
      category: 'Hematology',
    },
    {
      name: 'Lipid Panel',
      description: 'Measures fats and fatty substances in the blood.',
      price: 120.0,
      category: 'Cardiology',
    },
  ]);
};
