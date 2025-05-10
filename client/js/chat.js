/**
 * Sends a message through a WebSocket connection after validating input.
 *
 * @param {Event} e The event triggered by the form submission.
 * @return {boolean} Returns false if the message data is empty or after sending the message.
 */
function sendMessage(e) {
  e.preventDefault();
  const message = {
    type: 'message',
    data: document.getElementById('input-message').value
  };
  if (!message.data) {
    return false;
  }
  socket.send(JSON.stringify(message));
  e.target.reset();
  return false;
}

/**
 * Handles an incoming chat message by rendering it in the chat interface.
 *
 * @param {Object} message - The message object containing data to process.
 * @param {string} message.data - The actual message content to be displayed.
 */
function handleChatMessage(message) {
  if (!message.data) {
    console.error(`Message data did not contain message ${JSON.stringify(message)}`);
    return;
  }

  const p = document.createElement('p');
  p.textContent = message.data;
  document.getElementById('messages').appendChild(p);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('message-form').addEventListener('submit', sendMessage);
});
