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

const createMessage = (message) => {
  const p = document.createElement('p');
  p.textContent = message;
  document.getElementById('messages').appendChild(p);
};

// Listen for messages from the server
socket.addEventListener('message', (event) => {
  console.log(`Received message: ${event.data}`);

  try {
    // Try to parse as JSON
    const message = JSON.parse(event.data);

    // Handle authentication response
    switch (message.type) {
      case 'auth-response':
        handleAuthMessage(message);
        break;
      case 'message':
        handleChatMessage(message);
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

function handleAuthMessage(message) {
  if (!message.success) {
    localStorage.removeItem('token');
    return;
  }
  user = message.user;
  updateUIForAuthenticatedUser();
}

function handleChatMessage(message) {
  if (!message.data) {
    console.error(`Message data did not contain message ${JSON.stringify(message)}`);
    return;
  }
  createMessage(message.data);
}

function handleCredentialResponse(response) {
  // Decode the JWT token to get user info
  const token = response.credential;

  try {
    localStorage.setItem('token', token);
    // Send the token to your backend for verification
    const message = {
      type: 'auth-request',
      data: {
        token
      }
    };
    socket.send(JSON.stringify(message));
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
  // Show sign-out button
  document.getElementById('sign-out-button').classList.remove('hidden');
  // Hide Google sign-in button
  document.getElementById('sign-in-button-background').classList.add('hidden');
}

// Handle sign out
function handleSignOut() {
  // Clear authentication state
  user = null;
  localStorage.removeItem('token');
  // Update UI
  document.getElementById('sign-out-button').classList.add('hidden');
  document.getElementById('sign-in-button-background').classList.remove('hidden');
  // Notify server
  socket.send(JSON.stringify({type: 'sign-out'}));
}

// Initialize Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById('sign-in-button-container'),
    {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular'
    }
  );
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGoogleSignIn();
  document.getElementById('sign-out-button').addEventListener('click', handleSignOut);
  const input = document.getElementById('input-message');
  document.getElementById('message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = {
      type: 'message',
      data: input.value
    };
    input.value = '';
    socket.send(JSON.stringify(message));
    return false;
  });
});
