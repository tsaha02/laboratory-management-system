// src/db/index.ts
import knex from 'knex';
import knexConfig from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const connectionConfig = knexConfig[environment];

export default knex(connectionConfig);
