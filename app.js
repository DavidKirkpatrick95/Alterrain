'use strict';

/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');
const favicon = require('serve-favicon');
const chalk = require('chalk');
const logger = require('morgan');
const errorHandler = require('errorhandler');

/**
 * Load environment variables from .env file, where API keys and passwords
 * are configured.
 */
dotenv.load({path: '.env'});

/**
 * Create Express server.
 */
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

/**
 * Express configuration.
 */
app.use(compression());
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/**
 * Socket
 */
server.listen(port, () => {
  console.log(`
  Port: ${chalk.blue(port)}
  http://localhost:${port}
  `);
});

io.on('connection', (socket) => {
  logger.info('A client connected..');

  socket.on('disconnect', () => {
    logger.info('A client Disconnected..');
  });
});

/**
 * Basic Routing.
 */
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));


/**
 * Error Handler.
 */
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
}

module.exports = app;
