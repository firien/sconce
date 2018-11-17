const path = require('path');

module.exports = [
  {
    name: 'client',
    entry: './main.js',
    // target: 'web', // by default
    output: {
      path: path.resolve(__dirname, 'docs'),
      filename: 'bundle.js',
    },
    mode: 'production'
  }
];
