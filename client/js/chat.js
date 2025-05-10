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
 * @param {Array<{
 *       id: string;
 *       userId: string;
 *       message: string;
 *       timestamp: string;
 *       userName: string;
 *       userPicture: string;
 *     }>} chatMessages - The chatMessages array containing the chat messages.
 */
function handleChatMessages(chatMessages) {
  if (!Array.isArray(chatMessages)) {
    console.error(`Message data did not contain message ${JSON.stringify(chatMessages)}`);
    return;
  }

  const chatContainer = document.getElementById('messages');
  chatContainer.innerHTML = '';

  function hashColor(str) {
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = 260 + (Math.abs(hash) % 51); // Range from 260 to 310 (purple hues)
    return `hsl(${h}, 70%, 90%)`;
  }

  function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dateStr = `${isToday ? 'Today' : date.toLocaleDateString()} - `;
    return dateStr + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  chatMessages.forEach(chatMessage => {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex ${chatMessage.userId === user?.id ? 'justify-end' : 'justify-start'} w-full`;

    const messageContainer = document.createElement('div');
    messageContainer.className = 'min-w-[45%] max-w-[80%] flex flex-col gap-2';

    const headerRow = document.createElement('div');
    headerRow.className = `flex items-center gap-2 ${chatMessage.userId === user?.id ? 'justify-end' : 'justify-start'}`;

    const avatar = document.createElement('img');
    avatar.src = chatMessage.userPicture;
    avatar.alt = 'User avatar';
    avatar.className = 'w-6 h-6 rounded-full';

    const userName = document.createElement('span');
    userName.textContent = chatMessage.userName;
    userName.className = 'text-sm font-medium';

    const timestamp = document.createElement('span');
    timestamp.textContent = formatDateTime(chatMessage.timestamp);
    timestamp.className = 'text-xs text-gray-500';

    const messageBubble = document.createElement('div');
    messageBubble.className = 'p-2 rounded-lg';
    messageBubble.style.backgroundColor = hashColor(chatMessage.userId);
    messageBubble.textContent = chatMessage.message;

    headerRow.appendChild(avatar);
    headerRow.appendChild(userName);
    headerRow.appendChild(timestamp);

    messageContainer.appendChild(headerRow);
    messageContainer.appendChild(messageBubble);
    messageWrapper.appendChild(messageContainer);
    chatContainer.appendChild(messageWrapper);
  });
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