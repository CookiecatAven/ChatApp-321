"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const livereload_1 = __importDefault(require("livereload"));
const connect_livereload_1 = __importDefault(require("connect-livereload"));
const websocket_server_1 = require("./server/websocket-server");
const api_1 = require("./server/api");
const database_1 = require("./server/database");
// Create the express server
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// create a livereload server
// ONLY FOR DEVELOPMENT important to remove in production
// by set the NODE_ENV to production
const env = process.env.NODE_ENV || 'development';
if (env !== 'production') {
    console.log('Starting livereload server');
    const liveReloadServer = livereload_1.default.createServer();
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });
    // use livereload middleware
    app.use((0, connect_livereload_1.default)());
}
// deliver static files from the client folder like css, js, images
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'client')));
// route for the homepage
app.get('/', (_, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'client', 'index.html'));
});
// Initialize the websocket server
(0, websocket_server_1.initializeWebsocketServer)(server);
// Initialize the REST api
(0, api_1.initializeAPI)(app);
// Allowing top-level await
(async function () {
    // Initialize the database
    (0, database_1.initializeMariaDB)();
    await (0, database_1.initializeDBSchema)();
    //start the web server
    const serverPort = process.env.PORT || 3000;
    server.listen(serverPort, () => {
        console.log(`Express Server started on port ${serverPort} as '${env}' Environment`);
    });
})();
