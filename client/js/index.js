// Configuration
const GOOGLE_CLIENT_ID = '531851416947-lsarlt9ovcaeph4rvamu3hj1ur67m0u5.apps.googleusercontent.com';

// The websocket object is created by the browser and is used to connect to the server.
// Think about it when the backend is not running on the same server as the frontend
// replace localhost with the server's IP address or domain name.
const socket = new WebSocket('ws://localhost:3000');

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
        break
      case 'typing-status':
        // todo handle typing users
        console.log(`users typing: ${message.data.filter(user => user.isTyping).map(user => user.name).join(', ')}`);
        break;
      case 'users':
        handleUsers(message)
        break
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
