/**
 * Sends a message through a WebSocket connection after validating input.
 *
 * @param {Event} e The event triggered by the form submission.
 * @return {boolean} Returns false if the message data is empty or after sending the message.
 */
function sendMessage(e) {
  e.preventDefault();
  const message = {
    type: 'chat-message',
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
 * Handles an incoming chat chatMessages by rendering it in the chat interface.
 *
 * @param {Array} chatMessages - The chatMessages array containing the chat messages.
 */
function handleChatMessages(chatMessages) {
  if (!Array.isArray(chatMessages)) {
    console.error(`Message data did not contain message ${JSON.stringify(chatMessages)}`);
    return;
  }

  const chatContainer = document.getElementById('messages');
  chatContainer.innerHTML = '';
  chatMessages.forEach(chatMessage => {
    const p = document.createElement('p');
    p.textContent = `${chatMessage.userName}: ${chatMessage.message}`;
    chatContainer.appendChild(p);
  })
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('message-form').addEventListener('submit', sendMessage);
});

/**
 * Displays the list of users in the users div and highlights the current user.
 *
 * @param message
 */
function handleUsers(message) {
  if (!message.data || !Array.isArray(message.data)) {
    console.error(`Message data did not contain users ${JSON.stringify(message)}`);
    return;
  }
  const usersDiv = document.getElementById('users');
  usersDiv.innerHTML = '';

  message.data.forEach(chatUser => {
    const userDiv = document.createElement('div');
    userDiv.className = 'flex items-center gap-2 p-2 rounded-full';

    const img = document.createElement('img');
    img.src = chatUser.picture;
    img.alt = 'User avatar';
    img.className = 'w-8 h-8 rounded-full';

    const name = document.createElement('span');
    name.textContent = chatUser.name;
    name.className = 'text-nowrap overflow-hidden text-ellipsis';

    if (chatUser.id === user?.id) {
      userDiv.classList.add('bg-violet-100');
      name.classList.add('text-violet-800');
    }

    userDiv.appendChild(img);
    userDiv.appendChild(name);

    usersDiv.appendChild(userDiv);
  });

}