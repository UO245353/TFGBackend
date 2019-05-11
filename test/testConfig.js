'use strict';

let config = {
  server: {
    appPort: 12345,
    dbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/testData',
  },
  superUserData: {
    username: 'falsoDelTodo',
    pass: 'falsaDelTodo'
  },
  secret: 'testSecret',
  issuer: 'testIssuer'
};

module.exports = config;
