"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDBSchema = exports.executeSQL = exports.initializeMariaDB = void 0;
let pool = null;
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
const initializeMariaDB = () => {
    console.log('Initializing MariaDB');
    const mariadb = require('mariadb');
    pool = mariadb.createPool({
        database: process.env.DB_NAME || 'mychat',
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'mychat',
        password: process.env.DB_PASSWORD || 'mychatpassword',
        connectionLimit: 5
    });
    console.log('MariaDB initialized');
};
exports.initializeMariaDB = initializeMariaDB;
/**
 * Allows the execution of SQL queries.
 * @example
 * // Insert statement with a parameter. Can be multiple in an array format like ["Patrick", 1]
 * executeSQL("INSERT INTO users value (?)", ["Patrick"]);
 * @example
 * // Select statement without parameters.
 * executeSQL("SELECT * FROM users;");
 */
const executeSQL = async (query, params) => {
    if (!pool) {
        console.error('Database connection pool is not initialized');
        return [];
    }
    let conn;
    try {
        conn = await pool.getConnection();
        return await conn.query(query, params);
    }
    catch (err) {
        console.log(err);
        return [];
    }
    finally {
        if (conn) {
            await conn.release();
        }
    }
};
exports.executeSQL = executeSQL;
/**
 * Initializes the database schema.
 * Creates the tables if they do not exist.
 * Useful for the first time setup.
 */
const initializeDBSchema = async () => {
    console.log('Initializing database schema');
    // language=SQL format=false
    const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users
    (
      id   INT          NOT NULL AUTO_INCREMENT,
      NAME VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
      );
  `;
    await (0, exports.executeSQL)(userTableQuery);
    // language=SQL format=false
    const messageTableQuery = `
    CREATE TABLE IF NOT EXISTS messages
    (
      id      INT          NOT NULL AUTO_INCREMENT,
      user_id INT          NOT NULL,
      message VARCHAR(255) NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
      );
  `;
    await (0, exports.executeSQL)(messageTableQuery);
    console.log('Database schema initialized');
};
exports.initializeDBSchema = initializeDBSchema;
