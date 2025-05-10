"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebsocketServer = void 0;
const ws_1 = __importDefault(require("ws"));
const clients = [];
/**
 * Initializes the websocket server.
 * @example
 * initializeWebsocketServer(server);
 */
const initializeWebsocketServer = (server) => {
    console.log('Initializing websocket server');
    const websocketServer = new ws_1.default.Server({ server });
    websocketServer.on('connection', onConnection);
    console.log('Websocket server initialized');
};
exports.initializeWebsocketServer = initializeWebsocketServer;
/**
 * Handles a new websocket connection.
 * @example
 * onConnection(ws);
 */
const onConnection = (ws) => {
    console.log('New websocket connection');
    ws.on('message', (message) => onMessage(ws, message));
};
// If a new message is received, the onMessage function is called
/**
 * Handles a new message from a websocket connection.
 * @example
 * onMessage(ws, messageBuffer);
 */
const onMessage = (ws, messageBuffer) => {
    const messageString = messageBuffer.toString();
    const message = JSON.parse(messageString);
    console.log('Received message: ' + messageString);
    // The message type is checked and the appropriate action is taken
    switch (message.type) {
        case 'user': {
            clients.push({ ws, user: message.user });
            const usersMessage = {
                type: 'users',
                users: clients.map((client) => client.user)
            };
            clients.forEach((client) => {
                client.ws.send(JSON.stringify(usersMessage));
            });
            ws.on('close', () => onDisconnect(ws));
            break;
        }
        case 'message': {
            clients.forEach((client) => {
                client.ws.send(messageString);
            });
            break;
        }
        default: {
            console.log('Unknown message type: ' + message.type);
        }
    }
};
/**
 * Handles a websocket disconnect. All other clients are notified about the disconnect.
 * @example
 * onDisconnect(ws);
 */
const onDisconnect = (ws) => {
    const index = clients.findIndex((client) => client.ws === ws);
    clients.splice(index, 1);
    const usersMessage = {
        type: 'users',
        users: clients.map((client) => client.user)
    };
    clients.forEach((client) => {
        client.ws.send(JSON.stringify(usersMessage));
    });
};
