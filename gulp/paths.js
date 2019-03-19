'use strict';
let paths = {
  srcServer: ['**/*.js'],
  srcLint: [
    '**/*.js',
    '!node_modules/**/*',
    '!gulp/**/*',
  ],
  srcServerStart: 'app.js',
  srcTested: [
    '**/*.js',
    '!node_modules/**/*',
    '!test/**/*'
  ],
  ignoredSrc : ['node_modules/**/*', 'test/**/*'],
  testsSrc: ['test/test.js'],
  dependencies: ['./package.json']
};

module.exports = paths;
