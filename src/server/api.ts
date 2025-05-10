import {executeSQL} from './database';
import {Express, Request, Response} from 'express';

/**
 * Initializes the API endpoints.
 * @example
 * initializeAPI(app);
 */
export const initializeAPI = (app: Express) => {
  console.log('Initializing API');
  // default REST api endpoint
  app.get('/api/users', users);
  console.log('API initialized');
};

/**
 * A simple users endpoint that shows the use of the database for insert and select statements.
 * @example
 * users(req, res);
 */

const users = async (_: Request, res: Response) => {
  await executeSQL('INSERT INTO users (name) VALUES (\'John Doe\');');
  const result = await executeSQL('SELECT * FROM users;');
  res.json(result);
};

module.exports = {initializeAPI};
