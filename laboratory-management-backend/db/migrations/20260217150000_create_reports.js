/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('reports', function (table) {
    table.increments('id').primary();
    table
      .integer('appointment_id')
      .unsigned()
      .notNullable()
      .unique() // one report per appointment
      .references('id')
      .inTable('appointments')
      .onDelete('CASCADE');
    table.string('file_path', 500).notNullable();
    table.string('file_name', 255).notNullable();
    table.string('mime_type', 100).notNullable();
    table.text('doctor_remarks').nullable();
    table
      .integer('uploaded_by')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('reports');
};
