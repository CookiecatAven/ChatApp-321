import {Express, Request, Response} from 'express';

/**
 * Initializes the API endpoints.
 * @example
 * initializeAPI(app);
 */
export const initializeAPI = (app: Express) => {
  console.log('Initializing API');
  // default REST api endpoint
  app.get('/api/config', config);
  console.log('API initialized');
};

/**
 * Handles the configuration setup and sends it as a JSON response.
 *
 * This function dynamically determines the WebSocket protocol and host
 * based on the current environment (`NODE_ENV`). It constructs a configuration
 * object that includes:
 * - The Google Client ID (`GOOGLE_CLIENT_ID`) pulled from environment variables.
 * - The WebSocket URL (`WS_URL`) based on the WebSocket protocol and host.
 */
const config = async (_: Request, res: Response) => {
  const wsProtocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
  const host = process.env.NODE_ENV === 'production' ? process.env.HOST : 'localhost:3000';

  const config = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    WS_URL: `${wsProtocol}://${host}/ws`
  };

  res.json(config);
};

module.exports = {initializeAPI};
