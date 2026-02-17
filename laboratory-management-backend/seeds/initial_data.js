const bcrypt = require('bcryptjs');

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries in these tables (order matters for FK constraints)
  await knex('appointments').del();
  await knex('test_package_items').del();
  await knex('test_packages').del();
  await knex('tests').del();
  await knex('users').del();

  // Hash the password before inserting
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Inserts seed for users table — one user per role
  const users = await knex('users').insert([
    {
      full_name: 'John Doe',
      email: 'john.doe@test.com',
      password: hashedPassword,
      phone_number: '123-456-7890',
      role: 'patient',
    },
    {
      full_name: 'Lab Technician',
      email: 'tech@example.com',
      password: hashedPassword,
      role: 'technician',
    },
    {
      full_name: 'System Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  ]).returning('id');

  // Inserts seed for tests table
  const tests = await knex('tests')
    .insert([
      {
        name: 'Complete Blood Count (CBC)',
        description: 'Measures different components of your blood including red and white blood cells, hemoglobin, and platelets.',
        price: 75.5,
        category: 'Hematology',
      },
      {
        name: 'Lipid Panel',
        description: 'Measures fats and fatty substances (cholesterol, triglycerides) in the blood.',
        price: 120.0,
        category: 'Cardiology',
      },
      {
        name: 'Thyroid Panel (TSH, T3, T4)',
        description: 'Evaluates thyroid gland function by measuring hormone levels.',
        price: 180.0,
        category: 'Endocrinology',
      },
      {
        name: 'Blood Glucose (Fasting)',
        description: 'Measures blood sugar levels after an overnight fast.',
        price: 45.0,
        category: 'Endocrinology',
      },
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        description: 'Provides average blood sugar levels over the past 2-3 months.',
        price: 95.0,
        category: 'Endocrinology',
      },
      {
        name: 'Liver Function Test (LFT)',
        description: 'Assesses liver health by measuring enzymes, proteins, and bilirubin.',
        price: 150.0,
        category: 'Gastroenterology',
      },
      {
        name: 'Urinalysis',
        description: 'Analyzes urine for signs of infection, kidney disease, or diabetes.',
        price: 50.0,
        category: 'Nephrology',
      },
      {
        name: 'Iron Studies',
        description: 'Measures iron levels and related proteins to check for anemia or overload.',
        price: 110.0,
        category: 'Hematology',
      },
      {
        name: 'Chest X-Ray',
        description: 'Imaging test to visualize lungs, heart, and chest wall structures.',
        price: 200.0,
        category: 'Radiology',
      },
      {
        name: 'Electrocardiogram (ECG)',
        description: 'Records electrical activity of the heart to detect abnormalities.',
        price: 250.0,
        category: 'Cardiology',
      },
    ])
    .returning('id');

  // Insert test packages
  const packages = await knex('test_packages')
    .insert([
      {
        name: 'Basic Health Checkup',
        description: 'Essential screening package covering blood count, glucose, and urinalysis.',
        price: 149.99,
      },
      {
        name: 'Comprehensive Wellness Panel',
        description: 'Full-body health assessment including cardiac, thyroid, liver, and kidney markers.',
        price: 499.99,
      },
    ])
    .returning('id');

  // Link tests to packages
  await knex('test_package_items').insert([
    // Basic Health Checkup: CBC, Blood Glucose, Urinalysis
    { package_id: packages[0].id, test_id: tests[0].id },
    { package_id: packages[0].id, test_id: tests[3].id },
    { package_id: packages[0].id, test_id: tests[6].id },
    // Comprehensive Wellness Panel: CBC, Lipid, Thyroid, Glucose, LFT, Urinalysis, ECG
    { package_id: packages[1].id, test_id: tests[0].id },
    { package_id: packages[1].id, test_id: tests[1].id },
    { package_id: packages[1].id, test_id: tests[2].id },
    { package_id: packages[1].id, test_id: tests[3].id },
    { package_id: packages[1].id, test_id: tests[5].id },
    { package_id: packages[1].id, test_id: tests[6].id },
    { package_id: packages[1].id, test_id: tests[9].id },
  ]);

  // Insert sample appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  await knex('appointments').insert([
    {
      user_id: users[0].id,
      test_id: tests[0].id,
      appointment_date: tomorrowStr,
      time_slot: '09:00-09:30',
      status: 'pending',
    },
    {
      user_id: users[0].id,
      test_id: tests[1].id,
      appointment_date: tomorrowStr,
      time_slot: '10:00-10:30',
      status: 'confirmed',
      technician_id: users[1].id,
    },
    {
      user_id: users[0].id,
      test_id: tests[3].id,
      appointment_date: dayAfterStr,
      time_slot: '14:00-14:30',
      status: 'completed',
      technician_id: users[1].id,
      notes: 'Patient fasted for 12 hours. Results normal.',
    },
  ]);
};
