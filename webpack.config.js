const path = require('path');
const PWAPlugin = require('pwa');

app = new PWAPlugin({
  name: 'Sconce',
  scope: 'sconce',
  description: "ICO Generator",
  theme: '#fffff0',
  tag: 2
})

module.exports = [
  {
    name: 'client',
    entry: './main.js',
    // target: 'web', // by default
    output: {
      path: path.resolve(__dirname, 'docs'),
      filename: 'bundle.[contenthash].js',
    },
    mode: 'development',
    devServer: {
      contentBase: path.join(__dirname, 'docs'),
      port: 3012
    },
    plugins: [app]
  }
];
