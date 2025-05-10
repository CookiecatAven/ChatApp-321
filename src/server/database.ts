import {Pool} from 'mariadb';

let pool: Pool | null = null;

/**
 * Initializes the MariaDB connection pool.
 * The connection pool is used to execute SQL queries.
 * The connection pool is created with the following parameters:
 * - database: The name of the database to connect to. (process.env.DB_NAME)
 * - host: The host of the database. (process.env.DB_HOST)
 * - user: The user to connect to the database. (process.env.DB_USER)
 * - password: The password to connect to the database. (process.env.DB_PASSWORD)
 * - connectionLimit: The maximum number of connections in the pool. (5)
 * @example
 * initializeMariaDB();
 * @see {@link https://mariadb.com/kb/en/mariadb-connector-nodejs-pooling/}
 */
export const initializeMariaDB = () => {
  console.log('Initializing MariaDB');
  const mariadb = require('mariadb');
  pool = mariadb.createPool({
    database: process.env.DB_NAME || 'mychat',
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'mychat',
    password: process.env.DB_PASSWORD || 'mychatpassword',
    connectionLimit: 5,
    timezone: 'UTC',
    dateStrings: true
  });
  console.log('MariaDB initialized');
};

/**
 * Allows the execution of SQL queries.
 * @example
 * // Insert statement with a parameter. Can be multiple in an array format like ["Patrick", 1]
 * executeSQL("INSERT INTO users value (?)", ["Patrick"]);
 * @example
 * // Select statement without parameters.
 * executeSQL("SELECT * FROM users;");
 */
export const executeSQL = async (query: string, params?: string[]) => {
  if (!pool) {
    console.error('Database connection pool is not initialized');
    return [];
  }

  let conn;
  try {
    conn = await pool.getConnection();
    return await conn.query(query, params);
  } catch (err) {
    console.log(err);
    return [];
  } finally {
    if (conn) {
      await conn.release();
    }
  }
};

/**
 * Initializes the database schema.
 * Creates the tables if they do not exist.
 * Useful for the first time setup.
 */
export const initializeDBSchema = async () => {
  console.log('Initializing database schema');
  // language=SQL format=false
  const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users
    (
      id   VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      picture           TEXT,
      PRIMARY KEY (id)
    );
  `;
  await executeSQL(userTableQuery);
  // language=SQL format=false
  const messageTableQuery = `
    CREATE TABLE IF NOT EXISTS messages
    (
      id      INT          NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(255) NOT NULL,
      message VARCHAR(255) NOT NULL,
      created TIMESTAMP    DEFAULT CURRENT_TIMESTAMP(),
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `;
  await executeSQL(messageTableQuery);
  console.log('Database schema initialized');
};
