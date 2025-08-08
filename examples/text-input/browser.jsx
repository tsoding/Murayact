const React = require('react');
const ReactDom = require('react-dom/client');
const { App } = require('./App.js');

const app = document.getElementById('app');
const root = ReactDom.createRoot(app);
root.render(<App />)
