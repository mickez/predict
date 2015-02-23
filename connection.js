'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/predict');

var connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
    console.log('mongodb connection opened');
});

module.exports = connection;