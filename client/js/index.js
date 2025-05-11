// Configuration object with default values
let configRequestInProgressPromise = null;
let config = {
  GOOGLE_CLIENT_ID: '',
  WS_URL: ''
};

let socket = null;

/**
 * Represents the current user of the application.
 * Can be an instance of the User object if a user is logged in.
 * Will be null if no user is logged in.
 * @type {null | {
 *       id: string,
 *       picture: string,
 *       token: string
 *       }}
 */
let user = null;

function loadConfig() {
  if (config.GOOGLE_CLIENT_ID && config.WS_URL) {
    // Configuration already loaded
    return new Promise(resolve => resolve());
  }
  if (!configRequestInProgressPromise) {
    // no request in progress, starting request from server
    configRequestInProgressPromise = new Promise((resolve, reject) => {
      // Fetch configuration from server
      fetch('/api/config')
        .then(response => response.json())
        .then(serverConfig => {
          if (!serverConfig.GOOGLE_CLIENT_ID || !serverConfig.WS_URL) {
            throw new Error(`Configuration is missing required field ${JSON.stringify(serverConfig)}`);
          }
          config = serverConfig;
          configRequestInProgressPromise = null;
          return resolve();
        })
        .catch(error => {
          configRequestInProgressPromise = null;
          console.error('Error loading configuration:', error);
          return reject();
        });
    });
  }
  // return promise for server request
  return configRequestInProgressPromise;
}

loadConfig().then(() => {
  // Initialize WebSocket with the configured URL
  socket = new WebSocket(config.WS_URL);

  // Listen for WebSocket open event
  socket.addEventListener('open', () => {
    console.log('WebSocket connected.');
    // Check if we have a saved user in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Send the authenticated user to the backend
      const message = {
        type: 'auth-request',
        data: {
          token
        }
      };
      socket.send(JSON.stringify(message));
      updateUIForAuthenticatedUser();
    }
  });

  // Listen for messages from the server
  socket.addEventListener('message', (event) => {
    console.log(`Received message: ${event.data}`);

    try {
      // Try to parse as JSON
      const message = JSON.parse(event.data);

      // Handle authentication response
      switch (message.type) {
        case 'auth-response':
          handleAuthResponse(message);
          break;
        case 'update-name-response':
          handleUpdateNameResponse(message);
          break;
        case 'typing-status':
          handleTypingStatus(message);
          break;
        case 'users':
          handleUsers(message);
          break;
        case 'messages':
          handleChatMessages(message.data);
          break;
        default:
          console.warn(`Unknown message type ${message.type}`);
      }
    } catch (e) {
      // If not JSON, log error
      console.error(`Could not parse message from server ${event.data}`);
    }
  });

  // Listen for WebSocket close event
  socket.addEventListener('close', () => {
    console.log('WebSocket closed.');
  });

  // Listen for WebSocket errors
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });
});
