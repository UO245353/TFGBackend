'use strict';

let config = {
  server: {
    adminAppPort: 20000,
    dbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/testData',
  },

  adminProfile: {
    appUrl: 'localhost',
    appPort: 12345,
  },
  superuser: {
    username: 'falsoDelTodo',
    pass: 'falsaDelTodo'
  },
  secret: 'testSecret'
};

module.exports = config;
