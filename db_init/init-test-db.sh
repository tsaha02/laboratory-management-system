#!/bin/bash
set -e

echo "--- [DEBUG] RUNNING CUSTOM INIT SCRIPT TO CREATE TEST DATABASE ---"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE lms_test_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lms_test_db')\gexec
EOSQL

echo "--- [DEBUG] TEST DATABASE CREATION SCRIPT FINISHED ---"