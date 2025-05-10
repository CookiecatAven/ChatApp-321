import WebSocket, {RawData} from 'ws';
import {Server} from 'node:http';
import {verifyUserToken} from './service/auth';
import {getUserById, storeUser, updateUserName} from './service/user';

interface Client {
  user: {
    id: string;
    name: string;
    picture?: string;
  };
}

interface Message<T> {
  type: string;
  data: T;
}

const clients = new Map<WebSocket, Client>();

/**
 * Initializes the websocket server.
 * @example
 * initializeWebsocketServer(server);
 */
export const initializeWebsocketServer = (server: Server) => {
  console.log('Initializing websocket server');
  const websocketServer = new WebSocket.Server({server});
  websocketServer.on('connection', onConnection);
  console.log('Websocket server initialized');
};

/**
 * Handles a new websocket connection.
 * @example
 * onConnection(ws);
 */
const onConnection = (ws: WebSocket) => {
  console.log('New websocket connection');
  ws.on('message', (message) => onMessage(ws, message));
};

// If a new message is received, the onMessage function is called
/**
 * Handles a new message from a websocket connection.
 * @example
 * onMessage(ws, messageBuffer);
 */
const onMessage = async (ws: WebSocket, messageBuffer: RawData) => {
  const message = JSON.parse(messageBuffer.toString());
  console.log(`Received message: ${JSON.stringify(message)}`);
  // The message type is checked and the appropriate action is taken
  switch (message.type) {
    case 'auth-request':
      await handleGoogleAuth(ws, message.data.token);
      break;
    case 'update-name':
      await handleUpdateUserName(ws, message.data);
      break;
    case 'message':
      if (!clients.get(ws)) {
        // client is not in the list of authenticated clients
        return;
      }
      sendToAll({
        type: 'message',
        data: message.data
      });
      break;
    case 'sign-out':
      handleSignOut(ws);
      break;
    default:
      console.log('Unknown message type: ' + message.type);
  }
};

const handleUpdateUserName = async (ws: WebSocket, newName: string) => {
  if (!clients.get(ws)) {
    // client is not in the list of authenticated clients
    return;
  }
  const user = clients.get(ws)?.user;
  if (!user) {
    return;
  }
  const updatedUser = await updateUserName(user.id, newName);
  if (!updatedUser) {
    ws.send(JSON.stringify({
      type: 'update-name-response',
      success: false,
      errorMessage: 'Update failed'
    }));
    return;
  }
  ws.send(JSON.stringify({
    type: 'update-name-response',
    success: true,
    data: updatedUser.name
  }));
};

const handleGoogleAuth = async (ws: WebSocket, userToken: string) => {
  const userVerification = await verifyUserToken(userToken);

  if (!userVerification.success) {
    ws.send(JSON.stringify({
      type: 'auth-response',
      success: false,
      errorMessage: `Authentication failed: ${userVerification.errorMessage}`
    }));
    return;
  }

  const {payload} = userVerification;
  let existingUser = await getUserById(payload.sub);
  if (!existingUser) {
    console.log(`User ${payload.sub} does not exist in database. Creating user.`);
    existingUser = await storeUser({
      id: payload.sub,
      name: payload.name ?? 'Google User',
      picture: payload.picture
    });
    if (!existingUser) {
      ws.send(JSON.stringify({
        type: 'auth-response',
        success: false,
        errorMessage: 'Sign-Up failed'
      }));
      return;
    }
  }

  // Update client data with authenticated user info
  clients.set(ws, {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      picture: existingUser.picture
    }
  });

  // Send success response
  ws.send(JSON.stringify({
    type: 'auth-response',
    success: true,
    user: {
      id: existingUser.id,
      name: existingUser.name ?? 'Google User',
      picture: existingUser.picture
    }
  }));

  // register handler for closing socket
  ws.on('close', () => handleSignOut(ws));

  sendCurrentUsersToAll();
};

/**
 * Handles a websocket disconnect. All other clients are notified about the disconnect.
 * @example
 * handleSignOut(ws);
 */
const handleSignOut = (ws: WebSocket) => {
  if (!clients.get(ws)) {
    // client is not in the list of authenticated clients
    return;
  }
  clients.delete(ws);
  sendCurrentUsersToAll();
};

/**
 * Sends the current list of users to all connected clients.
 * @example
 * sendCurrentUsersToAll();
 */
const sendCurrentUsersToAll = () => {
  const usersMessage = {
    type: 'users',
    data: Array.from(clients)
      .map(([_, client]) => client.user)
      .sort((a, b) => a.name.localeCompare(b.name))
  };
  sendToAll(usersMessage);
};

/**
 * Sends a message to all connected clients.
 * It will be serialized into a JSON string before being sent.
 */
const sendToAll = (message: Message<any>) => {
  clients.forEach((_, ws) => {
    ws.send(JSON.stringify(message));
  });
};
