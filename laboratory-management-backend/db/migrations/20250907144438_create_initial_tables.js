/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('patients', function (table) {
      table.increments('id').primary();
      table.string('full_name', 255).notNullable();
      table.string('email', 255).notNullable().unique();
      table.string('password', 255).notNullable();
      table.string('phone_number', 50);
      table.date('date_of_birth');
      table.timestamp(true, true);
    })
    .createTable('tests', function (table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.text('description');
      table.decimal('price').notNullable();
      table.string('category', 100);
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('tests').dropTable('patients');
};
