const React = require('react');
const murayact = require('murayact');
const { App } = require('./App.js');

murayact.initWindow(1440, 800);
murayact.render(<App />);