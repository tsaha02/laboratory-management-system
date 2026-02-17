/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .renameTable('patients', 'users')
    .then(() => {
      return knex.schema.alterTable('users', function (table) {
        table
          .string('role', 20)
          .notNullable()
          .defaultTo('patient');
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable('users', function (table) {
      table.dropColumn('role');
    })
    .then(() => {
      return knex.schema.renameTable('users', 'patients');
    });
};
