/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('test_packages', function (table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.text('description');
      table.decimal('price').notNullable();
      table.timestamps(true, true);
    })
    .createTable('test_package_items', function (table) {
      table.increments('id').primary();
      table
        .integer('package_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('test_packages')
        .onDelete('CASCADE');
      table
        .integer('test_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tests')
        .onDelete('CASCADE');
      table.unique(['package_id', 'test_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('test_package_items')
    .dropTableIfExists('test_packages');
};
