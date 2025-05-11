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
  sendTypingStatus(false);
  return false;
}

let typingInterval = undefined;
let hasBeenTyping = false;

/**
 * Handles the input event for the message input field. Tracks typing status and sends updates about it.
 *
 * @param {Event} e - The input event triggered by the message input field.
 */
function handleMessageInput(e) {
  const message = e.target.value;
  if (message.length <= 0) {
    clearInterval(typingInterval);
    typingInterval = undefined;
    sendTypingStatus(false);
    return;
  }
  if (typingInterval) {
    hasBeenTyping = true;
    return;
  }
  sendTypingStatus(true);
  typingInterval = setInterval(() => {
    if (!hasBeenTyping) {
      clearInterval(typingInterval);
      typingInterval = undefined;
      sendTypingStatus(false);
      return;
    }
    hasBeenTyping = false;
    sendTypingStatus(true);
  }, 3000);
}

/**
 * Sends a typing status message to the server indicating whether the user is currently typing.
 *
 * @param {boolean} isTyping - Whether the user is typing
 */
function sendTypingStatus(isTyping) {
  const message = {
    type: 'typing-status',
    data: isTyping
  };
  socket.send(JSON.stringify(message));
}

function handleTypingStatus(message) {
  if (!Array.isArray(message.data)) {
    console.error(`Message data did not contain typing status array ${JSON.stringify(message)}`);
    return;
  }
  console.log(`users typing: ${message.data.filter(user => user.isTyping).map(user => user.name).join(', ')}`);
  const typingUsers = message.data
    .filter(typingUser => typingUser.isTyping && typingUser.id !== user.id)
    .map(user => user.name);
  const typingStatusContainer = document.getElementById('typing-status');
  typingStatusContainer.innerHTML = `${typingUsers.join(', ')} ${typingUsers.length > 1 ? 'are' : 'is'} typing...`;
  typingStatusContainer.classList.toggle('hidden', typingUsers.length <= 0);
  // scroll if the container was displayed
  if (typingUsers.length > 0) {
    scrollToBottom()
  }
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
    const h = 250 + (Math.abs(hash) % 81); // Range from 250 to 330 (purple hues)
    return `hsl(${h}, 70%, 85%)`;
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
  scrollToBottom()
}

let userScrolledToBottom = true;
/**
 * Stores if the user scrolled away from the bottom
 * @param e scroll event
 */
function handleMessageScroll(e) {
  const container = e.target;
  const scrollPosition = container.scrollTop + container.clientHeight;
  userScrolledToBottom = Math.abs(scrollPosition - container.scrollHeight) < 1;
  console.log(`At bottom: ${userScrolledToBottom}`);
}

/**
 * Scrolls the messages-container to the bottom if it was scrolled to the bottom before.
 */
function scrollToBottom() {
  if (!userScrolledToBottom) {
    return;
  }

  const chatContainer = document.getElementById('messages');
  // delay scroll so DOM is rendered
  setTimeout(() => {
    chatContainer.parentElement.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('message-form').addEventListener('submit', sendMessage);
  // use keyup to prevent spam by holding down a key
  document.getElementById('input-message').addEventListener('keyup', handleMessageInput);
  document.getElementById('messages').parentElement.addEventListener('scroll', handleMessageScroll)
});
