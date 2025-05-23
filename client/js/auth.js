/**
 * Handles the authentication message received from the server.
 *
 * @param {Object} message - The authentication message object.
 * @param {boolean} message.success - Indicates whether the authentication was successful.
 * @param {Object} [message.user] - The user object, provided if authentication is successful.
 * @param {Array} [message.messages] - The user object, provided if authentication is successful.
 */
function handleAuthResponse(message) {
  if (!message.success) {
    localStorage.removeItem('token');
    return;
  }
  user = message.user;
  updateUIForAuthenticatedUser();
  // update messages
  handleChatMessages(message.messages);
}

/**
 * Handles the credential response by decoding the provided JWT token, storing it locally,
 * and sending it to the backend for verification through a WebSocket connection.
 *
 * @param {Object} response - The credential response object.
 * @param {string} response.credential - The JWT token provided as part of the response object.
 */
function handleCredentialResponse(response) {
  // Decode the JWT token to get user info
  const token = response.credential;

  try {
    localStorage.setItem('token', token);
    // Send the token to your backend for verification
    const message = {
      type: 'auth-request', data: {
        token
      }
    };
    socket.send(JSON.stringify(message));
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
  }
}

let initCounter = 0;

/**
 * Initializes Google Sign-In by setting up the Google client library with the required
 * client ID and callback function. Additionally, it renders the Google Sign-In button
 * with specified settings in the designated HTML container.
 */
function initializeGoogleSignIn() {
  if (!window.google?.accounts?.id) {
    if (initCounter <= 5) {
      console.warn('Google client library isn\'t loaded! Deferring init of Google Sign-In.');
      setTimeout(initializeGoogleSignIn, 1000);
      initCounter++;
      return;
    } else {
      console.error(`Google client library didn't load during ${initCounter} seconds. Aborting init of Google Sign-In.`);
    }
  }
  loadConfig().then(() => {
    window.google.accounts.id.initialize({
      client_id: config.GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });

    window.google.accounts.id.renderButton(
      document.getElementById('sign-in-button-container'),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular'
      }
    );
  });
}

/**
 * Handles user sign-out by clearing authentication state, updating the UI, and notifying the server.
 */
function handleSignOut() {
  // Clear authentication state
  user = null;
  localStorage.removeItem('token');
  updateUIForAuthenticatedUser();
  // Notify server
  socket.send(JSON.stringify({type: 'sign-out'}));
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGoogleSignIn();
  document.getElementById('sign-out-button').addEventListener('click', handleSignOut);
});
