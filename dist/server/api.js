"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAPI = void 0;
const database_1 = require("./database");
/**
 * Initializes the API endpoints.
 * @example
 * initializeAPI(app);
 */
const initializeAPI = (app) => {
    console.log('Initializing API');
    // default REST api endpoint
    app.get('/api/users', users);
    console.log('API initialized');
};
exports.initializeAPI = initializeAPI;
/**
 * A simple users endpoint that shows the use of the database for insert and select statements.
 * @example
 * users(req, res);
 */
const users = async (_, res) => {
    await (0, database_1.executeSQL)('INSERT INTO users (name) VALUES (\'John Doe\');');
    const result = await (0, database_1.executeSQL)('SELECT * FROM users;');
    res.json(result);
};
module.exports = { initializeAPI: exports.initializeAPI };
