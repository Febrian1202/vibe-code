import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let db: any;

try {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });
  db = drizzle(connection, { schema, mode: 'default' });
} catch (error) {
  console.warn('⚠️ Could not connect to database. Please check your DATABASE_URL in .env');
}

export { db };
export default db;
