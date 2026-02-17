/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('appointments', function (table) {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .integer('test_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tests')
      .onDelete('CASCADE');
    table.date('appointment_date').notNullable();
    table.string('time_slot', 20).notNullable(); // e.g. "09:00-09:30"
    table
      .enu('status', ['pending', 'confirmed', 'completed', 'cancelled'])
      .notNullable()
      .defaultTo('pending');
    table
      .integer('technician_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.text('notes').nullable();
    table.timestamps(true, true);

    // Prevent double-booking: same date + time slot can only be booked once
    table.unique(['appointment_date', 'time_slot']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('appointments');
};
