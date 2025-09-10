// laboratory-management-backend/src/models/patient.model.js
const db = require('../db'); // This points to the file we just created

const Patient = {
  // Function to find all patients
  findAll: () => {
    return db('patients').select('*');
  },

  // Function to find a patient by their ID
  findById: (id) => {
    return db('patients').where({ id }).first();
  },

  // Function to create a new patient
  create: (patient) => {
    return db('patients').insert(patient).returning('*');
  },
  // We will add update and delete functions later
};

module.exports = Patient;
