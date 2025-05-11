import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import {initializeWebsocketServer} from './server/websocket-server';
import {initializeAPI} from './server/api';
import {initializeDBSchema, initializeMariaDB} from './server/database';

dotenv.config();

// Create the express server
const app = express();
const server = http.createServer(app);

// create a livereload server
// ONLY FOR DEVELOPMENT important to remove in production
// by set the NODE_ENV to production
const env = process.env.NODE_ENV || 'development';
if (env !== 'production') {
  console.log('Starting livereload server');
  const liveReloadServer = livereload.createServer();
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/');
    }, 100);
  });
  // use livereload middleware
  app.use(connectLiveReload());
}

// deliver static files from the client folder like css, js, images

app.use(express.static(path.join(process.cwd(), 'client')));
// route for the homepage
app.get('/', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});
// Initialize the websocket server
initializeWebsocketServer(server);
// Initialize the REST api
initializeAPI(app);

// Allowing top-level await
(async function () {
  // Initialize the database
  initializeMariaDB();
  await initializeDBSchema();
  //start the web server
  const serverPort = process.env.PORT || 3000;
  server.listen(serverPort, () => {
    console.log(`Express Server started on port ${serverPort} as '${env}' Environment`);
  });
})();
