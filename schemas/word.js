'use strict';

var mongoose = require('mongoose');

var wordSchema = mongoose.Schema({
    value: String,
    prob: Number,
    freq: {type: Number, default: 0},
    given: Object
});

var wordModel = mongoose.model('Word', wordSchema);

wordModel.prototype.conditionalProb = function(given) {
    return this.prob * this.given[given].prob;
};

module.exports = wordModel;